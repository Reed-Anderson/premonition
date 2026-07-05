import { randomUUID } from "node:crypto"
import cookieParser from "cookie-parser"
import cors from "cors"
import "dotenv/config"
import type { BetVolume } from "@premonition/types"
import { and, eq, sql } from "drizzle-orm"
import express from "express"
import { createGoogleAuthorizationURL, exchangeGoogleCode } from "./auth/google"
import {
    clearSessionCookie,
    createSession,
    getSessionUser,
    invalidateSession,
    SESSION_COOKIE,
    setSessionCookie,
} from "./auth/session"
import { db } from "./db"
import { bets, competitionMembers, competitions, games, users } from "./db/schema"

/*******************************************************************************
 *
 * App Setup
 *
 ******************************************************************************/

const app = express()
const PORT = process.env.PORT ?? 4000
const WEB_URL = process.env.WEB_URL ?? "http://localhost:3000"

app.use(cors({ origin: WEB_URL, credentials: true }))
app.use(express.json())
app.use(cookieParser())

/*******************************************************************************
 *
 * Routes
 *
 ******************************************************************************/

app.get("/health", (_req, res) => {
    res.json({ status: "ok" })
})

app.get("/health/db", async (_req, res) => {
    try {
        await db.execute(sql`select 1`)
        res.json({ status: "ok" })
    } catch (error) {
        console.error("Database health check failed:", error)
        res.status(503).json({ status: "error" })
    }
})

app.get("/competitions", async (_req, res) => {
    res.json(await db.select().from(competitions))
})

/* Registered ahead of "/competitions/:id" so "mine" isn't swallowed as a competition id. */
app.get("/competitions/mine", async (req, res) => {
    const user = await getSessionUser(req)
    if (!user) {
        res.status(401).json({ error: "Not signed in" })
        return
    }

    const rows = await db
        .select({ competitionId: competitionMembers.competitionId })
        .from(competitionMembers)
        .where(eq(competitionMembers.userId, user.id))
    res.json(rows.map((row) => row.competitionId))
})

app.get("/competitions/:id", async (req, res) => {
    const [competition] = await db
        .select()
        .from(competitions)
        .where(eq(competitions.id, req.params.id))
    if (!competition) {
        res.status(404).json({ error: "Competition not found" })
        return
    }
    res.json(competition)
})

app.get("/competitions/:id/games", async (req, res) => {
    res.json(
        await db
            .select()
            .from(games)
            .where(eq(games.competitionId, req.params.id)),
    )
})

app.post("/competitions/:id/join", async (req, res) => {
    const user = await getSessionUser(req)
    if (!user) {
        res.status(401).json({ error: "Not signed in" })
        return
    }

    const [competition] = await db
        .select()
        .from(competitions)
        .where(eq(competitions.id, req.params.id))
    if (!competition) {
        res.status(404).json({ error: "Competition not found" })
        return
    }

    await db
        .insert(competitionMembers)
        .values({ userId: user.id, competitionId: competition.id })
        .onConflictDoNothing()

    res.status(204).end()
})

app.get("/competitions/:id/bets/mine", async (req, res) => {
    const user = await getSessionUser(req)
    if (!user) {
        res.status(401).json({ error: "Not signed in" })
        return
    }

    const rows = await db
        .select({ bet: bets })
        .from(bets)
        .innerJoin(games, eq(bets.gameId, games.id))
        .where(
            and(
                eq(games.competitionId, req.params.id),
                eq(bets.userId, user.id),
            ),
        )
    res.json(rows.map((row) => row.bet))
})

app.get("/games/:id/bets/volume", async (req, res) => {
    const rows = await db
        .select({
            outcome: bets.outcome,
            total: sql<number>`sum(${bets.wager})`,
        })
        .from(bets)
        .where(eq(bets.gameId, req.params.id))
        .groupBy(bets.outcome)

    const volume: BetVolume = { home: 0, away: 0 }
    for (const row of rows) {
        volume[row.outcome] = Number(row.total)
    }
    res.json(volume)
})

app.post("/games/:id/bets", async (req, res) => {
    const user = await getSessionUser(req)
    if (!user) {
        res.status(401).json({ error: "Not signed in" })
        return
    }

    const { outcome, wager } = req.body
    if (
        (outcome !== "home" && outcome !== "away") ||
        !Number.isInteger(wager) ||
        wager <= 0
    ) {
        res.status(400).json({ error: "Invalid bet" })
        return
    }

    const [game] = await db.select().from(games).where(eq(games.id, req.params.id))
    if (!game) {
        res.status(404).json({ error: "Game not found" })
        return
    }

    const [membership] = await db
        .select()
        .from(competitionMembers)
        .where(
            and(
                eq(competitionMembers.userId, user.id),
                eq(competitionMembers.competitionId, game.competitionId),
            ),
        )
    if (!membership) {
        res.status(403).json({ error: "Not a member of this competition" })
        return
    }

    const [bet] = await db
        .insert(bets)
        .values({
            id: randomUUID(),
            userId: user.id,
            gameId: game.id,
            outcome,
            wager,
        })
        .onConflictDoNothing()
        .returning()
    if (!bet) {
        res.status(409).json({ error: "Bet already placed" })
        return
    }

    res.status(201).json(bet)
})

/*******************************************************************************
 *
 * Auth Routes
 *
 ******************************************************************************/

const OAUTH_STATE_COOKIE = "google_oauth_state"
const OAUTH_CODE_VERIFIER_COOKIE = "google_code_verifier"
const OAUTH_COOKIE_MAX_AGE_MS = 1000 * 60 * 10

app.get("/auth/google", async (_req, res) => {
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

app.get("/auth/google/callback", async (req, res) => {
    const { code, state } = req.query
    const storedState = req.cookies[OAUTH_STATE_COOKIE]
    const codeVerifier = req.cookies[OAUTH_CODE_VERIFIER_COOKIE]

    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/auth/google" })
    res.clearCookie(OAUTH_CODE_VERIFIER_COOKIE, { path: "/auth/google" })

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

    let claims: Awaited<ReturnType<typeof exchangeGoogleCode>>
    try {
        claims = await exchangeGoogleCode(code, codeVerifier)
    } catch (error) {
        console.error("Google OAuth callback failed:", error)
        res.status(400).json({ error: "Invalid OAuth request" })
        return
    }

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

    const { token, expiresAt } = await createSession(user.id)
    setSessionCookie(res, token, expiresAt)
    res.redirect(WEB_URL)
})

app.get("/auth/me", async (req, res) => {
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

app.post("/auth/logout", async (req, res) => {
    const token = req.cookies[SESSION_COOKIE]
    if (token) {
        await invalidateSession(token)
    }
    clearSessionCookie(res)
    res.status(204).end()
})

/*******************************************************************************
 *
 * Server
 *
 ******************************************************************************/

app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`)
})
