import cookieParser from "cookie-parser"
import cors from "cors"
import "dotenv/config"
import express from "express"
import { PORT, WEB_URL } from "./config"
import { authRouter } from "./routes/auth"
import { competitionsRouter } from "./routes/competitions"
import { healthRouter } from "./routes/health"
import { leaguesRouter } from "./routes/leagues"

/*******************************************************************************
 *
 * App Setup
 *
 ******************************************************************************/

const app = express()

app.use(cors({ origin: WEB_URL, credentials: true }))
app.use(express.json())
app.use(cookieParser())

/*******************************************************************************
 *
 * Routes
 *
 ******************************************************************************/

app.use(healthRouter)
app.use(competitionsRouter)
app.use(leaguesRouter)
app.use(authRouter)

/*******************************************************************************
 *
 * Server
 *
 ******************************************************************************/

app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`)
})
