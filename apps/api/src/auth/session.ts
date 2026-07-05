import { createHash, randomBytes } from "node:crypto"
import { eq } from "drizzle-orm"
import type { Request, Response } from "express"
import { db } from "../db"
import { sessions, users } from "../db/schema"

/*******************************************************************************
 *
 * Session Cookie
 *
 ******************************************************************************/

export const SESSION_COOKIE = "session"

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30

export function setSessionCookie(
    res: Response,
    token: string,
    expiresAt: Date,
) {
    res.cookie(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: expiresAt,
    })
}

export function clearSessionCookie(res: Response) {
    res.clearCookie(SESSION_COOKIE, { path: "/" })
}

/*******************************************************************************
 *
 * Session Storage
 *
 ******************************************************************************/

/* Only the SHA-256 hash of the token is stored, so a DB read alone can't be replayed as a valid cookie. */
function hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex")
}

export async function createSession(userId: string) {
    const token = randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)
    await db
        .insert(sessions)
        .values({ id: hashToken(token), userId, expiresAt })
    return { token, expiresAt }
}

export async function validateSessionToken(token: string) {
    const [result] = await db
        .select({ user: users, expiresAt: sessions.expiresAt })
        .from(sessions)
        .innerJoin(users, eq(sessions.userId, users.id))
        .where(eq(sessions.id, hashToken(token)))

    if (!result || result.expiresAt < new Date()) {
        return null
    }
    return result.user
}

export async function invalidateSession(token: string) {
    await db.delete(sessions).where(eq(sessions.id, hashToken(token)))
}

export async function getSessionUser(req: Request) {
    const token = req.cookies[SESSION_COOKIE]
    return token ? validateSessionToken(token) : null
}
