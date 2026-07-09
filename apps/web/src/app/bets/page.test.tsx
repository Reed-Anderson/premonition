import type { BetSummary } from "@premonition/types"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { fetchAllMyBets } from "@/lib/bets"
import MyBetsPage from "./page"

/*******************************************************************************
 *
 * My Bets Page Tests
 *
 ******************************************************************************/

vi.mock("@/lib/bets", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/lib/bets")>()
    return { ...actual, fetchAllMyBets: vi.fn() }
})

const BETS: BetSummary[] = [
    {
        id: "bet-1",
        gameId: "g1",
        competitionId: "c1",
        competitionName: "2026 FIFA World Cup",
        homeTeam: "Mexico",
        awayTeam: "South Korea",
        outcome: "home",
        wager: 150,
        potentialReturn: 270,
        status: "pending",
        kickoff: "2026-06-11T19:00:00Z",
    },
    {
        id: "bet-2",
        gameId: "g2",
        competitionId: "c1",
        competitionName: "2026 FIFA World Cup",
        homeTeam: "USA",
        awayTeam: "Wales",
        outcome: "home",
        wager: 200,
        potentialReturn: 360,
        status: "won",
        kickoff: "2026-06-12T21:00:00Z",
    },
    {
        id: "bet-3",
        gameId: "g3",
        competitionId: "c2",
        competitionName: "2026/27 NFL",
        homeTeam: "Kansas City Chiefs",
        awayTeam: "Buffalo Bills",
        outcome: "away",
        wager: 100,
        potentialReturn: 210,
        status: "lost",
        kickoff: "2026-09-10T20:20:00Z",
    },
    {
        id: "bet-4",
        gameId: "g4",
        competitionId: "c3",
        competitionName: "2026/27 English Premier League",
        homeTeam: "Arsenal",
        awayTeam: "Manchester City",
        outcome: "home",
        wager: 75,
        potentialReturn: 135,
        status: "pending",
        kickoff: "2026-08-15T14:00:00Z",
    },
    {
        id: "bet-5",
        gameId: "g5",
        competitionId: "c3",
        competitionName: "2026/27 English Premier League",
        homeTeam: "Liverpool",
        awayTeam: "Chelsea",
        outcome: "tie",
        wager: 50,
        potentialReturn: 165,
        status: "pending",
        kickoff: "2026-08-22T14:00:00Z",
    },
]

describe("MyBetsPage", () => {
    it("shows a loading state before bets arrive", () => {
        vi.mocked(fetchAllMyBets).mockReturnValue(new Promise(() => {}))

        render(<MyBetsPage />)

        expect(screen.getByText("Loading your bets...")).toBeInTheDocument()
    })

    it("lists all bets by default", async () => {
        vi.mocked(fetchAllMyBets).mockResolvedValue(BETS)

        render(<MyBetsPage />)

        expect(await screen.findAllByText("Mexico")).not.toHaveLength(0)
        expect(screen.getAllByRole("listitem").length).toBeGreaterThan(1)
    })

    it("filters bets by status", async () => {
        const user = userEvent.setup()
        vi.mocked(fetchAllMyBets).mockResolvedValue(BETS)
        render(<MyBetsPage />)

        await screen.findAllByText("Mexico")
        await user.click(screen.getByRole("button", { name: "Lost" }))

        expect(
            screen.getByText("Kansas City Chiefs", { exact: false }),
        ).toBeInTheDocument()
        expect(screen.queryByText("Arsenal")).not.toBeInTheDocument()
    })

    it("summarizes pending wagers and net credits from resolved bets", async () => {
        vi.mocked(fetchAllMyBets).mockResolvedValue(BETS)

        render(<MyBetsPage />)

        expect(await screen.findByText("275")).toBeInTheDocument()
        expect(screen.getByText("+260")).toBeInTheDocument()
    })

    it("shows a tie pick by coloring both teams in secondary color", async () => {
        vi.mocked(fetchAllMyBets).mockResolvedValue(BETS)

        render(<MyBetsPage />)

        expect(await screen.findByText("Liverpool")).toHaveClass(
            "text-secondary-700",
        )
        expect(screen.getByText("Chelsea")).toHaveClass("text-secondary-700")
        expect(screen.getByText("Tie")).toBeInTheDocument()
    })

    it("shows an empty state when there are no bets", async () => {
        vi.mocked(fetchAllMyBets).mockResolvedValue([])

        render(<MyBetsPage />)

        expect(
            await screen.findByText("No bets to show here yet."),
        ).toBeInTheDocument()
    })

    it("shows an error state when the request fails", async () => {
        vi.mocked(fetchAllMyBets).mockRejectedValue(new Error("500"))

        render(<MyBetsPage />)

        await waitFor(() => {
            expect(
                screen.getByText("Couldn't load your bets. Please try again."),
            ).toBeInTheDocument()
        })
    })
})
