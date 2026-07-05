import { randomUUID } from "node:crypto"
import type { BetVolume } from "@premonition/types"
import { and, eq, sql } from "drizzle-orm"
import express from "express"
import { getSessionUser } from "../auth/session"
import { db } from "../db"
import { bets, competitionMembers, competitions, games } from "../db/schema"

export const competitionsRouter = express.Router()

/*******************************************************************************
 *
 * GET Routes
 *
 ******************************************************************************/

/**
 * List all competitions.
 *
 * @route GET /competitions
 * @returns {Competition[]} 200
 */
competitionsRouter.get("/competitions", async (_req, res) => {
    res.json(await db.select().from(competitions))
})

/**
 * Competitions the signed-in user has joined.
 * Registered ahead of "/competitions/:id" so "mine" isn't swallowed as a competition id.
 *
 * @route GET /competitions/mine
 * @returns {string[]} 200 - competition ids
 * @returns {ApiError} 401 - not signed in
 */
competitionsRouter.get("/competitions/mine", async (req, res) => {
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

/**
 * Fetch a single competition by id.
 *
 * @route GET /competitions/:id
 * @param {string} id - competition id (path)
 * @returns {Competition} 200
 * @returns {ApiError} 404 - competition not found
 */
competitionsRouter.get("/competitions/:id", async (req, res) => {
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

/**
 * List the games in a competition.
 *
 * @route GET /competitions/:id/games
 * @param {string} id - competition id (path)
 * @returns {Game[]} 200
 */
competitionsRouter.get("/competitions/:id/games", async (req, res) => {
    res.json(
        await db
            .select()
            .from(games)
            .where(eq(games.competitionId, req.params.id)),
    )
})

/**
 * The signed-in user's bets within a competition.
 *
 * @route GET /competitions/:id/bets/mine
 * @param {string} id - competition id (path)
 * @returns {Bet[]} 200
 * @returns {ApiError} 401 - not signed in
 */
competitionsRouter.get("/competitions/:id/bets/mine", async (req, res) => {
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

/**
 * Aggregate bet volume by outcome for a game.
 *
 * @route GET /games/:id/bets/volume
 * @param {string} id - game id (path)
 * @returns {BetVolume} 200
 */
competitionsRouter.get("/games/:id/bets/volume", async (req, res) => {
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

/*******************************************************************************
 *
 * POST Routes
 *
 ******************************************************************************/

/**
 * Join a competition as the signed-in user.
 *
 * @route POST /competitions/:id/join
 * @param {string} id - competition id (path)
 * @returns {void} 204
 * @returns {ApiError} 401 - not signed in
 * @returns {ApiError} 404 - competition not found
 */
competitionsRouter.post("/competitions/:id/join", async (req, res) => {
    /***************************************************************************
     * Require the user to be signed in
     **************************************************************************/
    const user = await getSessionUser(req)
    if (!user) {
        res.status(401).json({ error: "Not signed in" })
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
     * Add the user as a member and confirm
     **************************************************************************/
    await db
        .insert(competitionMembers)
        .values({ userId: user.id, competitionId: competition.id })
        .onConflictDoNothing()

    res.status(204).end()
})

/**
 * Place a bet on a game.
 *
 * @route POST /games/:id/bets
 * @param {string} id - game id (path)
 * @param {"home"|"away"} outcome - predicted winner (body)
 * @param {number} wager - credits to bet (body)
 * @returns {Bet} 201 - created bet
 * @returns {ApiError} 400 - invalid outcome or wager
 * @returns {ApiError} 401 - not signed in
 * @returns {ApiError} 403 - not a member of this competition
 * @returns {ApiError} 404 - game not found
 * @returns {ApiError} 409 - bet already placed
 */
competitionsRouter.post("/games/:id/bets", async (req, res) => {
    /***************************************************************************
     * Require the user to be signed in
     **************************************************************************/
    const user = await getSessionUser(req)
    if (!user) {
        res.status(401).json({ error: "Not signed in" })
        return
    }

    /***************************************************************************
     * Validate the bet payload
     **************************************************************************/
    const { outcome, wager } = req.body
    if (
        (outcome !== "home" && outcome !== "away") ||
        !Number.isInteger(wager) ||
        wager <= 0
    ) {
        res.status(400).json({ error: "Invalid bet" })
        return
    }

    /***************************************************************************
     * Look up the game
     **************************************************************************/
    const [game] = await db.select().from(games).where(eq(games.id, req.params.id))
    if (!game) {
        res.status(404).json({ error: "Game not found" })
        return
    }

    /***************************************************************************
     * Confirm the user is a member of the game's competition
     **************************************************************************/
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

    /***************************************************************************
     * Place the bet and return it
     **************************************************************************/
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
