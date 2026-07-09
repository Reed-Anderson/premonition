import type { League } from "@premonition/types"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { UnauthorizedError } from "./auth"
import {
    createLeague,
    fetchLeagueMembers,
    fetchMyLeagues,
    joinLeague,
    LeagueNotFoundError,
} from "./leagues"

/*******************************************************************************
 *
 * Leagues API Tests
 *
 ******************************************************************************/

const league: League = {
    id: "l1",
    competitionId: "c1",
    name: "Office Pool",
    ownerId: "u1",
    inviteCode: "ABCDE12345",
    createdAt: "2026-07-04T00:00:00Z",
}

beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
})

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("fetchMyLeagues", () => {
    it("returns the parsed leagues on success", async () => {
        vi.mocked(fetch).mockResolvedValue(
            new Response(JSON.stringify([league]), { status: 200 }),
        )

        await expect(fetchMyLeagues("c1")).resolves.toEqual([league])
        expect(fetch).toHaveBeenCalledWith(
            expect.stringMatching(/\/competitions\/c1\/leagues\/mine$/),
            expect.anything(),
        )
    })

    it("resolves to an empty list when signed out", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 401 }))

        await expect(fetchMyLeagues("c1")).resolves.toEqual([])
    })

    it("throws when the response is not ok", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }))

        await expect(fetchMyLeagues("c1")).rejects.toThrow("500")
    })
})

describe("fetchLeagueMembers", () => {
    it("returns the parsed members on success", async () => {
        const member = {
            id: "u1",
            email: "a@example.com",
            name: "Alex",
            avatarUrl: null,
        }
        vi.mocked(fetch).mockResolvedValue(
            new Response(JSON.stringify([member]), { status: 200 }),
        )

        await expect(fetchLeagueMembers("l1")).resolves.toEqual([member])
    })

    it("throws when the response is not ok", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 404 }))

        await expect(fetchLeagueMembers("l1")).rejects.toThrow("404")
    })
})

describe("createLeague", () => {
    it("posts the name to the competition's leagues endpoint", async () => {
        vi.mocked(fetch).mockResolvedValue(
            new Response(JSON.stringify(league), { status: 201 }),
        )

        await createLeague("c1", "Office Pool")

        expect(fetch).toHaveBeenCalledWith(
            expect.stringMatching(/\/competitions\/c1\/leagues$/),
            expect.objectContaining({
                method: "POST",
                body: JSON.stringify({ name: "Office Pool" }),
            }),
        )
    })

    it("returns the parsed league on success", async () => {
        vi.mocked(fetch).mockResolvedValue(
            new Response(JSON.stringify(league), { status: 201 }),
        )

        await expect(createLeague("c1", "Office Pool")).resolves.toEqual(
            league,
        )
    })

    it("throws UnauthorizedError when signed out", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 401 }))

        await expect(createLeague("c1", "Office Pool")).rejects.toThrow(
            UnauthorizedError,
        )
    })

    it("throws when the response is not ok", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }))

        await expect(createLeague("c1", "Office Pool")).rejects.toThrow("500")
    })
})

describe("joinLeague", () => {
    it("posts the invite code to the join endpoint", async () => {
        vi.mocked(fetch).mockResolvedValue(
            new Response(JSON.stringify(league), { status: 200 }),
        )

        await joinLeague("ABCDE12345")

        expect(fetch).toHaveBeenCalledWith(
            expect.stringMatching(/\/leagues\/join$/),
            expect.objectContaining({
                method: "POST",
                body: JSON.stringify({ inviteCode: "ABCDE12345" }),
            }),
        )
    })

    it("returns the parsed league on success", async () => {
        vi.mocked(fetch).mockResolvedValue(
            new Response(JSON.stringify(league), { status: 200 }),
        )

        await expect(joinLeague("ABCDE12345")).resolves.toEqual(league)
    })

    it("throws UnauthorizedError when signed out", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 401 }))

        await expect(joinLeague("ABCDE12345")).rejects.toThrow(
            UnauthorizedError,
        )
    })

    it("throws LeagueNotFoundError when the invite code doesn't match", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 404 }))

        await expect(joinLeague("BADCODE")).rejects.toThrow(
            LeagueNotFoundError,
        )
    })

    it("throws when the response is not ok", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }))

        await expect(joinLeague("ABCDE12345")).rejects.toThrow("500")
    })
})
