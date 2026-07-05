import { sql } from "drizzle-orm"
import express from "express"
import { db } from "../db"

export const healthRouter = express.Router()

/*******************************************************************************
 *
 * GET Routes
 *
 ******************************************************************************/

/**
 * Liveness check — confirms the API process is up.
 *
 * @route GET /health
 * @returns {{status: "ok"}} 200
 */
healthRouter.get("/health", (_req, res) => {
    res.json({ status: "ok" })
})

/**
 * Readiness check — confirms the database is reachable.
 *
 * @route GET /health/db
 * @returns {{status: "ok"}} 200
 * @returns {{status: "error"}} 503 - database unreachable
 */
healthRouter.get("/health/db", async (_req, res) => {
    try {
        await db.execute(sql`select 1`)
        res.json({ status: "ok" })
    } catch (error) {
        console.error("Database health check failed:", error)
        res.status(503).json({ status: "error" })
    }
})
