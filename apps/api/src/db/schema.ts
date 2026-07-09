import {
    date,
    integer,
    pgEnum,
    pgTable,
    primaryKey,
    text,
    timestamp,
    unique,
} from "drizzle-orm/pg-core"

/*******************************************************************************
 *
 * Schema
 *
 ******************************************************************************/

export const sportEnum = pgEnum("sport", ["SOCCER", "FOOTBALL", "HOCKEY"])

export const competitions = pgTable("competitions", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    sport: sportEnum("sport").notNull(),
    startDate: date("start_date", { mode: "string" }).notNull(),
    endDate: date("end_date", { mode: "string" }).notNull(),
})

export const games = pgTable("games", {
    id: text("id").primaryKey(),
    competitionId: text("competition_id")
        .notNull()
        .references(() => competitions.id),
    week: integer("week").notNull(),
    homeTeam: text("home_team").notNull(),
    awayTeam: text("away_team").notNull(),
    kickoff: timestamp("kickoff", {
        mode: "date",
        withTimezone: true,
    }).notNull(),
    homeScore: integer("home_score"),
    awayScore: integer("away_score"),
})

export const users = pgTable("users", {
    id: text("id").primaryKey(),
    googleId: text("google_id").notNull().unique(),
    email: text("email").notNull().unique(),
    name: text("name").notNull(),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
})

export const sessions = pgTable("sessions", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id),
    expiresAt: timestamp("expires_at", {
        mode: "date",
        withTimezone: true,
    }).notNull(),
})

export const competitionMembers = pgTable(
    "competition_members",
    {
        userId: text("user_id")
            .notNull()
            .references(() => users.id),
        competitionId: text("competition_id")
            .notNull()
            .references(() => competitions.id),
        joinedAt: timestamp("joined_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => [primaryKey({ columns: [table.userId, table.competitionId] })],
)

export const leagues = pgTable("leagues", {
    id: text("id").primaryKey(),
    competitionId: text("competition_id")
        .notNull()
        .references(() => competitions.id),
    name: text("name").notNull(),
    ownerId: text("owner_id")
        .notNull()
        .references(() => users.id),
    inviteCode: text("invite_code").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
})

export const leagueMembers = pgTable(
    "league_members",
    {
        userId: text("user_id")
            .notNull()
            .references(() => users.id),
        leagueId: text("league_id")
            .notNull()
            .references(() => leagues.id),
        joinedAt: timestamp("joined_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => [primaryKey({ columns: [table.userId, table.leagueId] })],
)

export const betOutcomeEnum = pgEnum("bet_outcome", ["home", "away", "tie"])

export const bets = pgTable(
    "bets",
    {
        id: text("id").primaryKey(),
        userId: text("user_id")
            .notNull()
            .references(() => users.id),
        gameId: text("game_id")
            .notNull()
            .references(() => games.id),
        outcome: betOutcomeEnum("outcome").notNull(),
        wager: integer("wager").notNull(),
        placedAt: timestamp("placed_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => [unique().on(table.userId, table.gameId)],
)
