import { randomUUID } from "node:crypto"
import express from "express"
import { createGoogleAuthorizationURL, exchangeGoogleCode } from "../auth/google"
import {
    clearSessionCookie,
    createSession,
    getSessionUser,
    invalidateSession,
    SESSION_COOKIE,
    setSessionCookie,
} from "../auth/session"
import { WEB_URL } from "../config"
import { db } from "../db"
import { users } from "../db/schema"

export const authRouter = express.Router()

const OAUTH_STATE_COOKIE = "google_oauth_state"
const OAUTH_CODE_VERIFIER_COOKIE = "google_code_verifier"
const OAUTH_COOKIE_MAX_AGE_MS = 1000 * 60 * 10

/*******************************************************************************
 *
 * GET Routes
 *
 ******************************************************************************/

/**
 * Start the Google OAuth flow — sets state/PKCE cookies and redirects to Google's consent screen.
 *
 * @route GET /auth/google
 * @returns {void} 302 - redirect to Google's OAuth authorization URL
 */
authRouter.get("/auth/google", async (_req, res) => {
    const { url, state, codeVerifier } = await createGoogleAuthorizationURL()

    const oauthCookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/auth/google",
        maxAge: OAUTH_COOKIE_MAX_AGE_MS,
    }
    res.cookie(OAUTH_STATE_COOKIE, state, oauthCookieOptions)
    res.cookie(OAUTH_CODE_VERIFIER_COOKIE, codeVerifier, oauthCookieOptions)
    res.redirect(url)
})

/**
 * Google OAuth callback — verifies state, exchanges the code, upserts the user, and starts a session.
 *
 * @route GET /auth/google/callback
 * @param {string} code - authorization code from Google (query)
 * @param {string} state - CSRF state, must match the `google_oauth_state` cookie (query)
 * @returns {void} 302 - redirect to WEB_URL
 * @returns {ApiError} 400 - invalid OAuth request
 */
authRouter.get("/auth/google/callback", async (req, res) => {
    /***************************************************************************
     * Read the OAuth code/state and the cookies set by /auth/google
     **************************************************************************/
    const { code, state } = req.query
    const storedState = req.cookies[OAUTH_STATE_COOKIE]
    const codeVerifier = req.cookies[OAUTH_CODE_VERIFIER_COOKIE]

    /***************************************************************************
     * Clear the one-time OAuth cookies
     **************************************************************************/
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/auth/google" })
    res.clearCookie(OAUTH_CODE_VERIFIER_COOKIE, { path: "/auth/google" })

    /***************************************************************************
     * Verify the state matches to guard against CSRF
     **************************************************************************/
    if (
        typeof code !== "string" ||
        typeof state !== "string" ||
        !storedState ||
        !codeVerifier ||
        state !== storedState
    ) {
        res.status(400).json({ error: "Invalid OAuth request" })
        return
    }

    /***************************************************************************
     * Exchange the authorization code for Google claims
     **************************************************************************/
    let claims: Awaited<ReturnType<typeof exchangeGoogleCode>>
    try {
        claims = await exchangeGoogleCode(code, codeVerifier)
    } catch (error) {
        console.error("Google OAuth callback failed:", error)
        res.status(400).json({ error: "Invalid OAuth request" })
        return
    }

    /***************************************************************************
     * Upsert the user from the Google profile
     **************************************************************************/
    const [user] = await db
        .insert(users)
        .values({
            id: randomUUID(),
            googleId: claims.sub,
            email: claims.email,
            name: claims.name,
            avatarUrl: claims.picture ?? null,
        })
        .onConflictDoUpdate({
            target: users.googleId,
            set: {
                email: claims.email,
                name: claims.name,
                avatarUrl: claims.picture ?? null,
            },
        })
        .returning()

    /***************************************************************************
     * Start a session and redirect back to the web app
     **************************************************************************/
    const { token, expiresAt } = await createSession(user.id)
    setSessionCookie(res, token, expiresAt)
    res.redirect(WEB_URL)
})

/**
 * The currently signed-in user.
 *
 * @route GET /auth/me
 * @returns {{id: string, email: string, name: string, avatarUrl: string | null}} 200
 * @returns {ApiError} 401 - not signed in
 */
authRouter.get("/auth/me", async (req, res) => {
    const user = await getSessionUser(req)
    if (!user) {
        res.status(401).json({ error: "Not signed in" })
        return
    }
    res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
    })
})

/*******************************************************************************
 *
 * POST Routes
 *
 ******************************************************************************/

/**
 * End the current session.
 *
 * @route POST /auth/logout
 * @returns {void} 204
 */
authRouter.post("/auth/logout", async (req, res) => {
    const token = req.cookies[SESSION_COOKIE]
    if (token) {
        await invalidateSession(token)
    }
    clearSessionCookie(res)
    res.status(204).end()
})
