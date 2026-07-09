import { randomBytes, randomUUID } from "node:crypto"
import { and, eq } from "drizzle-orm"
import express from "express"
import { getSessionUser } from "../auth/session"
import { db } from "../db"
import {
    competitionMembers,
    competitions,
    leagueMembers,
    leagues,
    users,
} from "../db/schema"

export const leaguesRouter = express.Router()

/*******************************************************************************
 *
 * GET Routes
 *
 ******************************************************************************/

/**
 * Leagues within a competition that the signed-in user belongs to.
 *
 * @route GET /competitions/:id/leagues/mine
 * @param {string} id - competition id (path)
 * @returns {League[]} 200
 * @returns {ApiError} 401 - not signed in
 */
leaguesRouter.get("/competitions/:id/leagues/mine", async (req, res) => {
    const user = await getSessionUser(req)
    if (!user) {
        res.status(401).json({ error: "Not signed in" })
        return
    }

    const rows = await db
        .select({ league: leagues })
        .from(leagues)
        .innerJoin(leagueMembers, eq(leagueMembers.leagueId, leagues.id))
        .where(
            and(
                eq(leagues.competitionId, req.params.id),
                eq(leagueMembers.userId, user.id),
            ),
        )
    res.json(rows.map((row) => row.league))
})

/**
 * Fetch a single league by id.
 *
 * @route GET /leagues/:id
 * @param {string} id - league id (path)
 * @returns {League} 200
 * @returns {ApiError} 404 - league not found
 */
leaguesRouter.get("/leagues/:id", async (req, res) => {
    const [league] = await db
        .select()
        .from(leagues)
        .where(eq(leagues.id, req.params.id))
    if (!league) {
        res.status(404).json({ error: "League not found" })
        return
    }
    res.json(league)
})

/**
 * List the members of a league.
 *
 * @route GET /leagues/:id/members
 * @param {string} id - league id (path)
 * @returns {User[]} 200
 */
leaguesRouter.get("/leagues/:id/members", async (req, res) => {
    const rows = await db
        .select({ user: users })
        .from(leagueMembers)
        .innerJoin(users, eq(users.id, leagueMembers.userId))
        .where(eq(leagueMembers.leagueId, req.params.id))
    res.json(rows.map((row) => row.user))
})

/*******************************************************************************
 *
 * POST Routes
 *
 ******************************************************************************/

/**
 * Create a league within a competition. The creator becomes its owner and
 * first member.
 *
 * @route POST /competitions/:id/leagues
 * @param {string} id - competition id (path)
 * @param {string} name - league name (body)
 * @returns {League} 201 - created league
 * @returns {ApiError} 400 - invalid name
 * @returns {ApiError} 401 - not signed in
 * @returns {ApiError} 403 - not a member of this competition
 * @returns {ApiError} 404 - competition not found
 */
leaguesRouter.post("/competitions/:id/leagues", async (req, res) => {
    /***************************************************************************
     * Require the user to be signed in
     **************************************************************************/
    const user = await getSessionUser(req)
    if (!user) {
        res.status(401).json({ error: "Not signed in" })
        return
    }

    /***************************************************************************
     * Validate the league name
     **************************************************************************/
    const { name } = req.body
    if (typeof name !== "string" || name.trim().length === 0) {
        res.status(400).json({ error: "Invalid league name" })
        return
    }

    /***************************************************************************
     * Look up the competition
     **************************************************************************/
    const [competition] = await db
        .select()
        .from(competitions)
        .where(eq(competitions.id, req.params.id))
    if (!competition) {
        res.status(404).json({ error: "Competition not found" })
        return
    }

    /***************************************************************************
     * Confirm the user is a member of the competition
     **************************************************************************/
    const [membership] = await db
        .select()
        .from(competitionMembers)
        .where(
            and(
                eq(competitionMembers.userId, user.id),
                eq(competitionMembers.competitionId, competition.id),
            ),
        )
    if (!membership) {
        res.status(403).json({ error: "Not a member of this competition" })
        return
    }

    /***************************************************************************
     * Create the league and add its creator as the first member
     **************************************************************************/
    const league = await db.transaction(async (tx) => {
        const [league] = await tx
            .insert(leagues)
            .values({
                id: randomUUID(),
                competitionId: competition.id,
                name: name.trim(),
                ownerId: user.id,
                inviteCode: randomBytes(5).toString("hex").toUpperCase(),
            })
            .returning()
        await tx
            .insert(leagueMembers)
            .values({ userId: user.id, leagueId: league.id })
        return league
    })

    res.status(201).json(league)
})

/**
 * Join a league using its invite code.
 *
 * @route POST /leagues/join
 * @param {string} inviteCode - the league's invite code (body)
 * @returns {League} 200 - joined league
 * @returns {ApiError} 400 - invalid invite code
 * @returns {ApiError} 401 - not signed in
 * @returns {ApiError} 403 - not a member of the league's competition
 * @returns {ApiError} 404 - no league with this invite code
 */
leaguesRouter.post("/leagues/join", async (req, res) => {
    /***************************************************************************
     * Require the user to be signed in
     **************************************************************************/
    const user = await getSessionUser(req)
    if (!user) {
        res.status(401).json({ error: "Not signed in" })
        return
    }

    /***************************************************************************
     * Validate the invite code
     **************************************************************************/
    const { inviteCode } = req.body
    if (typeof inviteCode !== "string" || inviteCode.trim().length === 0) {
        res.status(400).json({ error: "Invalid invite code" })
        return
    }

    /***************************************************************************
     * Look up the league by invite code
     **************************************************************************/
    const [league] = await db
        .select()
        .from(leagues)
        .where(eq(leagues.inviteCode, inviteCode.trim().toUpperCase()))
    if (!league) {
        res.status(404).json({ error: "No league with this invite code" })
        return
    }

    /***************************************************************************
     * Confirm the user is a member of the league's competition
     **************************************************************************/
    const [membership] = await db
        .select()
        .from(competitionMembers)
        .where(
            and(
                eq(competitionMembers.userId, user.id),
                eq(competitionMembers.competitionId, league.competitionId),
            ),
        )
    if (!membership) {
        res.status(403).json({ error: "Not a member of this competition" })
        return
    }

    /***************************************************************************
     * Add the user as a member and confirm
     **************************************************************************/
    await db
        .insert(leagueMembers)
        .values({ userId: user.id, leagueId: league.id })
        .onConflictDoNothing()

    res.status(200).json(league)
})
