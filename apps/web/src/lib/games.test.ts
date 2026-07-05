import type { Game } from "@premonition/types"
import { describe, expect, it } from "vitest"
import { groupGamesByWeek } from "./games"

/*******************************************************************************
 *
 * Games Helper Tests
 *
 ******************************************************************************/

function makeGame(overrides: Partial<Game>): Game {
    return {
        id: "g1",
        competitionId: "c1",
        week: 1,
        homeTeam: "Chiefs",
        awayTeam: "Ravens",
        kickoff: "2026-09-10T20:00:00Z",
        homeScore: null,
        awayScore: null,
        ...overrides,
    }
}

describe("groupGamesByWeek", () => {
    it("groups games under their week and sorts weeks ascending", () => {
        const games = [
            makeGame({ id: "g1", week: 3 }),
            makeGame({ id: "g2", week: 1 }),
            makeGame({ id: "g3", week: 2 }),
        ]

        expect(groupGamesByWeek(games).map((w) => w.week)).toEqual([1, 2, 3])
    })

    it("keeps every game with a matching week in the same group", () => {
        const games = [
            makeGame({ id: "g1", week: 1, homeTeam: "Chiefs" }),
            makeGame({ id: "g2", week: 1, homeTeam: "Bills" }),
            makeGame({ id: "g3", week: 2, homeTeam: "Eagles" }),
        ]

        const weeks = groupGamesByWeek(games)

        expect(weeks.find((w) => w.week === 1)?.games).toHaveLength(2)
        expect(weeks.find((w) => w.week === 2)?.games).toHaveLength(1)
    })

    it("returns an empty array for no games", () => {
        expect(groupGamesByWeek([])).toEqual([])
    })
})
