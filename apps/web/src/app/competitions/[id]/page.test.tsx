import type { Bet, Competition, Game } from "@premonition/types"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useParams } from "next/navigation"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { fetchMyBets } from "@/lib/bets"
import { fetchCompetition, fetchMyCompetitionIds } from "@/lib/competitions"
import { fetchGames } from "@/lib/games"
import CompetitionDetailsPage from "./page"

/*******************************************************************************
 *
 * Competition Details Page Tests
 *
 ******************************************************************************/

vi.mock("next/navigation", () => ({
    useParams: vi.fn(),
}))

vi.mock("@/lib/competitions", () => ({
    fetchCompetition: vi.fn(),
    fetchMyCompetitionIds: vi.fn(),
}))

vi.mock("@/lib/games", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/lib/games")>()
    return { ...actual, fetchGames: vi.fn() }
})

vi.mock("@/lib/bets", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/lib/bets")>()
    return {
        ...actual,
        fetchMyBets: vi.fn(),
        fetchBetVolume: vi.fn().mockResolvedValue({ home: 0, away: 0, tie: 0 }),
    }
})

const competition: Competition = {
    id: "c1",
    name: "World Cup 2026",
    sport: "SOCCER",
    startDate: "2026-06-11",
    endDate: "2026-07-19",
}

const game: Game = {
    id: "g1",
    competitionId: "c1",
    week: 1,
    homeTeam: "Chiefs",
    awayTeam: "Ravens",
    kickoff: "2026-09-10T20:00:00Z",
    homeScore: null,
    awayScore: null,
}

const bet: Bet = {
    id: "b1",
    userId: "u1",
    gameId: "g1",
    outcome: "home",
    wager: 100,
    placedAt: "2026-07-04T00:00:00Z",
}

beforeEach(() => {
    vi.mocked(useParams).mockReturnValue({ id: "c1" })
})

describe("CompetitionDetailsPage", () => {
    it("shows a loading state before the competition arrives", () => {
        vi.mocked(fetchCompetition).mockReturnValue(new Promise(() => {}))
        vi.mocked(fetchGames).mockReturnValue(new Promise(() => {}))
        vi.mocked(fetchMyCompetitionIds).mockReturnValue(new Promise(() => {}))
        vi.mocked(fetchMyBets).mockReturnValue(new Promise(() => {}))

        render(<CompetitionDetailsPage />)

        expect(screen.getByText("Loading competition...")).toBeInTheDocument()
    })

    it("shows an already-placed bet as locked, driven by the fetched bet", async () => {
        vi.mocked(fetchCompetition).mockResolvedValue(competition)
        vi.mocked(fetchGames).mockResolvedValue([game])
        vi.mocked(fetchMyCompetitionIds).mockResolvedValue([competition.id])
        vi.mocked(fetchMyBets).mockResolvedValue([bet])

        render(<CompetitionDetailsPage />)

        await waitFor(() => {
            expect(
                screen.getByRole("button", { name: /Chiefs.*Ravens/ }),
            ).toBeInTheDocument()
        })
        expect(screen.getByText("Bet: Chiefs")).toBeInTheDocument()
    })

    it("shows a bettable game as unlocked when the user has no bet yet", async () => {
        vi.mocked(fetchCompetition).mockResolvedValue(competition)
        vi.mocked(fetchGames).mockResolvedValue([game])
        vi.mocked(fetchMyCompetitionIds).mockResolvedValue([competition.id])
        vi.mocked(fetchMyBets).mockResolvedValue([])

        render(<CompetitionDetailsPage />)

        await waitFor(() => {
            expect(
                screen.getByRole("button", { name: /Chiefs.*Ravens/ }),
            ).toBeInTheDocument()
        })
        expect(screen.queryByText("Bet: Chiefs")).not.toBeInTheDocument()
    })

    it("shows a join prompt instead of a bet form when the user hasn't joined", async () => {
        const user = userEvent.setup()
        vi.mocked(fetchCompetition).mockResolvedValue(competition)
        vi.mocked(fetchGames).mockResolvedValue([game])
        vi.mocked(fetchMyCompetitionIds).mockResolvedValue([])
        vi.mocked(fetchMyBets).mockResolvedValue([])

        render(<CompetitionDetailsPage />)

        await waitFor(() => {
            expect(screen.getByText(/Chiefs/)).toBeInTheDocument()
        })
        await user.click(screen.getByRole("button", { name: /Chiefs.*Ravens/ }))

        expect(
            screen.getByRole("link", { name: "Join this competition" }),
        ).toBeInTheDocument()
    })
})
