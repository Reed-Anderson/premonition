import type { Bet, Game } from "@premonition/types"
import { act, render, screen } from "@testing-library/react"
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
        fetchBetVolume: vi.fn().mockResolvedValue({ home: 50, away: 50, tie: 0 }),
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
    it("shows a badge naming the wagered amount once a bet is submitted, even while collapsed", async () => {
        const user = userEvent.setup()
        vi.mocked(placeBet).mockResolvedValue(placedBet)
        render(<GameListItem game={game} sport="FOOTBALL" hasJoined={true} />)

        const header = screen.getByRole("button", { name: /Chiefs.*Ravens/ })
        expect(screen.queryByText("50 credits")).not.toBeInTheDocument()

        await user.click(header)
        await user.click(screen.getByRole("button", { name: /Chiefs.*return/ }))
        await user.type(screen.getByRole("textbox"), "50")
        await user.click(screen.getByRole("button", { name: "Place Bet" }))

        expect(await screen.findByText("50 credits")).toBeInTheDocument()

        await user.click(header)
        expect(screen.getByText("50 credits")).toBeInTheDocument()
    })

    it("shows the badge up front when given an initial bet", () => {
        render(
            <GameListItem
                game={game}
                sport="FOOTBALL"
                hasJoined={true}
                initialBet={placedBet}
            />,
        )

        expect(screen.getByText("50 credits")).toBeInTheDocument()
    })

    it("shows the wagered amount when the placed bet is a tie", () => {
        render(
            <GameListItem
                game={game}
                sport="SOCCER"
                hasJoined={true}
                initialBet={{ ...placedBet, outcome: "tie" }}
            />,
        )

        expect(screen.getByText("50 credits")).toBeInTheDocument()
    })

    it("shows a join prompt instead of the form when not joined", async () => {
        const user = userEvent.setup()
        render(<GameListItem game={game} sport="FOOTBALL" hasJoined={false} />)

        await user.click(screen.getByRole("button", { name: /Chiefs.*Ravens/ }))

        expect(
            screen.getByRole("link", { name: "Join this competition" }),
        ).toBeInTheDocument()
    })

    it("starts expanded when highlighted, without requiring a click", () => {
        render(
            <GameListItem
                game={game}
                sport="FOOTBALL"
                hasJoined={true}
                highlighted={true}
            />,
        )

        expect(
            screen.getByRole("button", { name: /Chiefs.*Ravens/ }),
        ).toHaveAttribute("aria-expanded", "true")
    })

    it("fades the highlight ring out after 3 seconds, without collapsing the game", () => {
        vi.useFakeTimers()
        const { container } = render(
            <GameListItem
                game={game}
                sport="FOOTBALL"
                hasJoined={true}
                highlighted={true}
            />,
        )

        expect(container.querySelector("li")).toHaveClass("ring-primary-400")

        act(() => {
            vi.advanceTimersByTime(3000)
        })

        expect(container.querySelector("li")).not.toHaveClass(
            "ring-primary-400",
        )
        expect(
            screen.getByRole("button", { name: /Chiefs.*Ravens/ }),
        ).toHaveAttribute("aria-expanded", "true")
        vi.useRealTimers()
    })
})
