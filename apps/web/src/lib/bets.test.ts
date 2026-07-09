import type { Bet, BetSummary } from "@premonition/types"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { UnauthorizedError } from "./auth"
import {
    BetAlreadyPlacedError,
    fetchAllMyBets,
    fetchBetVolume,
    fetchMyBets,
    placeBet,
} from "./bets"

/*******************************************************************************
 *
 * Bets API Tests
 *
 ******************************************************************************/

const bet: Bet = {
    id: "b1",
    userId: "u1",
    gameId: "g1",
    outcome: "home",
    wager: 100,
    placedAt: "2026-07-04T00:00:00Z",
}

beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
})

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("fetchMyBets", () => {
    it("returns the parsed bets on success", async () => {
        vi.mocked(fetch).mockResolvedValue(
            new Response(JSON.stringify([bet]), { status: 200 }),
        )

        await expect(fetchMyBets("c1")).resolves.toEqual([bet])
    })

    it("resolves to an empty list when signed out", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 401 }))

        await expect(fetchMyBets("c1")).resolves.toEqual([])
    })

    it("throws when the response is not ok", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }))

        await expect(fetchMyBets("c1")).rejects.toThrow("500")
    })
})

describe("fetchBetVolume", () => {
    it("returns the parsed volume on success", async () => {
        vi.mocked(fetch).mockResolvedValue(
            new Response(JSON.stringify({ home: 300, away: 200, tie: 0 }), {
                status: 200,
            }),
        )

        await expect(fetchBetVolume("g1")).resolves.toEqual({
            home: 300,
            away: 200,
            tie: 0,
        })
        expect(fetch).toHaveBeenCalledWith(
            expect.stringMatching(/\/games\/g1\/bets\/volume$/),
        )
    })

    it("throws when the response is not ok", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }))

        await expect(fetchBetVolume("g1")).rejects.toThrow("500")
    })
})

describe("fetchAllMyBets", () => {
    const betSummary: BetSummary = {
        id: "b1",
        competitionName: "FIFA World Cup",
        homeTeam: "Mexico",
        awayTeam: "South Korea",
        outcome: "home",
        wager: 100,
        potentialReturn: 180,
        status: "pending",
        kickoff: "2026-06-11T19:00:00Z",
    }

    it("returns the parsed bet summaries on success", async () => {
        vi.mocked(fetch).mockResolvedValue(
            new Response(JSON.stringify([betSummary]), { status: 200 }),
        )

        await expect(fetchAllMyBets()).resolves.toEqual([betSummary])
        expect(fetch).toHaveBeenCalledWith(
            expect.stringMatching(/\/bets\/mine$/),
            expect.objectContaining({ credentials: "include" }),
        )
    })

    it("resolves to an empty list when signed out", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 401 }))

        await expect(fetchAllMyBets()).resolves.toEqual([])
    })

    it("throws when the response is not ok", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }))

        await expect(fetchAllMyBets()).rejects.toThrow("500")
    })
})

describe("placeBet", () => {
    it("posts the outcome and wager to the game's bets endpoint", async () => {
        vi.mocked(fetch).mockResolvedValue(
            new Response(JSON.stringify(bet), { status: 201 }),
        )

        await placeBet("g1", "home", 100)

        expect(fetch).toHaveBeenCalledWith(
            expect.stringMatching(/\/games\/g1\/bets$/),
            expect.objectContaining({
                method: "POST",
                body: JSON.stringify({ outcome: "home", wager: 100 }),
            }),
        )
    })

    it("returns the parsed bet on success", async () => {
        vi.mocked(fetch).mockResolvedValue(
            new Response(JSON.stringify(bet), { status: 201 }),
        )

        await expect(placeBet("g1", "home", 100)).resolves.toEqual(bet)
    })

    it("throws UnauthorizedError when signed out", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 401 }))

        await expect(placeBet("g1", "home", 100)).rejects.toThrow(
            UnauthorizedError,
        )
    })

    it("throws BetAlreadyPlacedError on conflict", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 409 }))

        await expect(placeBet("g1", "home", 100)).rejects.toThrow(
            BetAlreadyPlacedError,
        )
    })

    it("throws when the response is not ok", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }))

        await expect(placeBet("g1", "home", 100)).rejects.toThrow("500")
    })
})
