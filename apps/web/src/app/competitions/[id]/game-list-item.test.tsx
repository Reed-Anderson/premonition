import type { Bet, Game } from "@premonition/types"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { placeBet } from "@/lib/bets"
import GameListItem from "./game-list-item"

/*******************************************************************************
 *
 * Game List Item Tests
 *
 ******************************************************************************/

vi.mock("@/lib/bets", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/lib/bets")>()
    return {
        ...actual,
        placeBet: vi.fn(),
        fetchBetVolume: vi.fn().mockResolvedValue({ home: 50, away: 50 }),
        BetAlreadyPlacedError: class BetAlreadyPlacedError extends Error {},
    }
})

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

const placedBet: Bet = {
    id: "b1",
    userId: "u1",
    gameId: "g1",
    outcome: "home",
    wager: 50,
    placedAt: "2026-07-04T00:00:00Z",
}

describe("GameListItem", () => {
    it("shows a 'Bet placed' badge once a bet is submitted, even while collapsed", async () => {
        const user = userEvent.setup()
        vi.mocked(placeBet).mockResolvedValue(placedBet)
        render(<GameListItem game={game} hasJoined={true} />)

        const header = screen.getByRole("button", { name: /Chiefs.*Ravens/ })
        expect(screen.queryByText("Bet placed")).not.toBeInTheDocument()

        await user.click(header)
        await user.click(screen.getByRole("button", { name: /Chiefs.*return/ }))
        await user.type(screen.getByRole("textbox"), "50")
        await user.click(screen.getByRole("button", { name: "Place Bet" }))

        expect(await screen.findByText("Bet placed")).toBeInTheDocument()

        await user.click(header)
        expect(screen.getByText("Bet placed")).toBeInTheDocument()
    })

    it("shows the badge up front when given an initial bet", () => {
        render(
            <GameListItem game={game} hasJoined={true} initialBet={placedBet} />,
        )

        expect(screen.getByText("Bet placed")).toBeInTheDocument()
    })

    it("shows a join prompt instead of the form when not joined", async () => {
        const user = userEvent.setup()
        render(<GameListItem game={game} hasJoined={false} />)

        await user.click(screen.getByRole("button", { name: /Chiefs.*Ravens/ }))

        expect(
            screen.getByRole("link", { name: "Join this competition" }),
        ).toBeInTheDocument()
    })
})
