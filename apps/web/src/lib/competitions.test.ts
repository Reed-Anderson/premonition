import type { Competition } from "@premonition/types"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { fetchCompetition, fetchCompetitions } from "./competitions"

/*******************************************************************************
 *
 * Competitions API Tests
 *
 ******************************************************************************/

const competition: Competition = {
    id: "c1",
    name: "World Cup 2026",
    sport: "SOCCER",
    startDate: "2026-06-11",
    endDate: "2026-07-19",
}

beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
})

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("fetchCompetitions", () => {
    it("returns the parsed competitions on success", async () => {
        vi.mocked(fetch).mockResolvedValue(
            new Response(JSON.stringify([competition]), { status: 200 }),
        )

        await expect(fetchCompetitions()).resolves.toEqual([competition])
    })

    it("throws when the response is not ok", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }))

        await expect(fetchCompetitions()).rejects.toThrow("500")
    })
})

describe("fetchCompetition", () => {
    it("requests the competition by id", async () => {
        vi.mocked(fetch).mockResolvedValue(
            new Response(JSON.stringify(competition), { status: 200 }),
        )

        await fetchCompetition("c1")

        expect(fetch).toHaveBeenCalledWith(
            expect.stringMatching(/\/competitions\/c1$/),
        )
    })

    it("throws when the response is not ok", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 404 }))

        await expect(fetchCompetition("missing")).rejects.toThrow("404")
    })
})
