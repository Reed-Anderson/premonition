import type { Bet, Game } from "@premonition/types"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
    BetAlreadyPlacedError,
    cancelBet,
    fetchBetVolume,
    placeBet,
} from "@/lib/bets"
import GameBetForm from "./game-bet-form"

/*******************************************************************************
 *
 * Game Bet Form Tests
 *
 ******************************************************************************/

vi.mock("@/lib/bets", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/lib/bets")>()
    return {
        ...actual,
        placeBet: vi.fn(),
        cancelBet: vi.fn(),
        fetchBetVolume: vi.fn(),
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
    wager: 100,
    placedAt: "2026-07-04T00:00:00Z",
}

function placeBetButton() {
    return screen.getByRole("button", { name: "Place Bet" })
}

beforeEach(() => {
    vi.mocked(fetchBetVolume).mockResolvedValue({ home: 300, away: 200, tie: 0 })
})

describe("GameBetForm", () => {
    it("shows a join prompt instead of the form when not joined", () => {
        render(
            <GameBetForm
                game={game}
                sport="FOOTBALL"
                hasJoined={false}
                onPlaceBet={() => {}}
            />,
        )

        expect(
            screen.getByRole("link", { name: "Join this competition" }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole("button", { name: /Chiefs/ }),
        ).not.toBeInTheDocument()
    })

    it("disables Place Bet until an outcome and a wager are set", async () => {
        const user = userEvent.setup()
        render(<GameBetForm game={game} sport="FOOTBALL" hasJoined={true} onPlaceBet={() => {}} />)

        expect(placeBetButton()).toBeDisabled()

        await user.click(screen.getByRole("button", { name: /Chiefs/ }))
        expect(placeBetButton()).toBeDisabled()

        await user.type(screen.getByRole("textbox"), "100")
        expect(placeBetButton()).toBeEnabled()
    })

    it("marks the selected outcome as pressed", async () => {
        const user = userEvent.setup()
        render(<GameBetForm game={game} sport="FOOTBALL" hasJoined={true} onPlaceBet={() => {}} />)

        const homeOption = screen.getByRole("button", { name: /Chiefs/ })
        const awayOption = screen.getByRole("button", { name: /Ravens/ })

        await user.click(homeOption)

        expect(homeOption).toHaveAttribute("aria-pressed", "true")
        expect(awayOption).toHaveAttribute("aria-pressed", "false")
    })

    it("strips non-digit characters from the wager input", async () => {
        const user = userEvent.setup()
        render(<GameBetForm game={game} sport="FOOTBALL" hasJoined={true} onPlaceBet={() => {}} />)

        const wagerInput = screen.getByRole("textbox")
        await user.type(wagerInput, "12a3.5b")

        expect(wagerInput).toHaveValue("1235")
    })

    it("shows the potential return once an outcome and wager are set", async () => {
        const user = userEvent.setup()
        render(<GameBetForm game={game} sport="FOOTBALL" hasJoined={true} onPlaceBet={() => {}} />)

        expect(screen.queryByText(/Potential return/)).not.toBeInTheDocument()

        await screen.findByText("300 credits on Chiefs")
        await user.click(screen.getByRole("button", { name: /Chiefs/ }))
        await user.type(screen.getByRole("textbox"), "100")

        /* A 100 wager joins the pool: (500+100) / (300+100) on Chiefs = 1.5x. */
        expect(screen.getByText(/Potential return:/)).toHaveTextContent(
            "Potential return: 150 credits",
        )
    })

    it("shows the estimated return multiplier for each outcome once volume loads", async () => {
        render(<GameBetForm game={game} sport="FOOTBALL" hasJoined={true} onPlaceBet={() => {}} />)

        /* Pool total 500: 500/300 on Chiefs = 1.67x, 500/200 on Ravens = 2.50x. */
        expect(await screen.findByText("1.67x return")).toBeInTheDocument()
        expect(screen.getByText("2.50x return")).toBeInTheDocument()
    })

    it("keeps the same potential return after placing, rather than double-counting the wager", async () => {
        const user = userEvent.setup()
        vi.mocked(placeBet).mockResolvedValue(placedBet)
        render(<GameBetForm game={game} sport="FOOTBALL" hasJoined={true} onPlaceBet={() => {}} />)

        await screen.findByText("300 credits on Chiefs")
        await user.click(screen.getByRole("button", { name: /Chiefs/ }))
        await user.type(screen.getByRole("textbox"), "100")

        expect(screen.getByText(/Potential return:/)).toHaveTextContent(
            "Potential return: 150 credits",
        )

        await user.click(placeBetButton())

        expect(await screen.findByRole("button", { name: "Bet Placed" }))
        expect(screen.getByText(/Potential return:/)).toHaveTextContent(
            "Potential return: 150 credits",
        )
    })

    it("reports the placed bet and locks the form once submitted", async () => {
        const user = userEvent.setup()
        vi.mocked(placeBet).mockResolvedValue(placedBet)
        const onPlaceBet = vi.fn()
        render(
            <GameBetForm
                game={game}
                sport="FOOTBALL"
                hasJoined={true}
                onPlaceBet={onPlaceBet}
            />,
        )

        await user.click(screen.getByRole("button", { name: /Chiefs/ }))
        await user.type(screen.getByRole("textbox"), "100")
        await user.click(placeBetButton())

        expect(await screen.findByRole("button", { name: "Bet Placed" })).toBeDisabled()
        expect(placeBet).toHaveBeenCalledWith("g1", "home", 100)
        expect(onPlaceBet).toHaveBeenCalledWith(placedBet)
        expect(screen.getByRole("textbox")).toBeDisabled()
        expect(screen.getByRole("button", { name: /Chiefs/ })).toBeDisabled()
    })

    it("shows an error and locks the form when the bet was already placed", async () => {
        const user = userEvent.setup()
        vi.mocked(placeBet).mockRejectedValue(new BetAlreadyPlacedError())
        render(<GameBetForm game={game} sport="FOOTBALL" hasJoined={true} onPlaceBet={() => {}} />)

        await user.click(screen.getByRole("button", { name: /Chiefs/ }))
        await user.type(screen.getByRole("textbox"), "100")
        await user.click(placeBetButton())

        expect(
            await screen.findByText("You've already placed a bet on this game."),
        ).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Bet Placed" })).toBeDisabled()
    })

    it("shows the betting volume split once it loads", async () => {
        render(<GameBetForm game={game} sport="FOOTBALL" hasJoined={true} onPlaceBet={() => {}} />)

        expect(
            await screen.findByText("300 credits on Chiefs"),
        ).toBeInTheDocument()
        expect(screen.getByText("200 credits on Ravens")).toBeInTheDocument()
    })

    it("bumps the volume split for the chosen outcome after placing a bet", async () => {
        const user = userEvent.setup()
        vi.mocked(placeBet).mockResolvedValue(placedBet)
        render(<GameBetForm game={game} sport="FOOTBALL" hasJoined={true} onPlaceBet={() => {}} />)

        await screen.findByText("300 credits on Chiefs")
        await user.click(screen.getByRole("button", { name: /Chiefs/ }))
        await user.type(screen.getByRole("textbox"), "100")
        await user.click(placeBetButton())

        expect(
            await screen.findByText("400 credits on Chiefs"),
        ).toBeInTheDocument()
        expect(screen.getByText("200 credits on Ravens")).toBeInTheDocument()
    })

    it("renders pre-filled and locked when given an initial bet", () => {
        render(
            <GameBetForm
                game={game}
                sport="FOOTBALL"
                hasJoined={true}
                initialBet={{ ...placedBet, outcome: "away", wager: 250 }}
                onPlaceBet={() => {}}
            />,
        )

        expect(screen.getByRole("textbox")).toHaveValue("250")
        expect(screen.getByRole("textbox")).toBeDisabled()
        expect(screen.getByRole("button", { name: /Ravens/ })).toHaveAttribute(
            "aria-pressed",
            "true",
        )
        expect(
            screen.getByRole("button", { name: "Bet Placed" }),
        ).toBeDisabled()
    })

    it("shows a Cancel Bet button once a bet is placed on a game that hasn't kicked off", async () => {
        const user = userEvent.setup()
        vi.mocked(placeBet).mockResolvedValue(placedBet)
        render(<GameBetForm game={game} sport="FOOTBALL" hasJoined={true} onPlaceBet={() => {}} />)

        await user.click(screen.getByRole("button", { name: /Chiefs/ }))
        await user.type(screen.getByRole("textbox"), "100")
        await user.click(placeBetButton())

        expect(
            await screen.findByRole("button", { name: "Cancel Bet" }),
        ).toBeInTheDocument()
    })

    it("omits the Cancel Bet button once the game has kicked off", () => {
        render(
            <GameBetForm
                game={{ ...game, kickoff: "2020-01-01T00:00:00Z" }}
                sport="FOOTBALL"
                hasJoined={true}
                initialBet={placedBet}
                onPlaceBet={() => {}}
            />,
        )

        expect(
            screen.queryByRole("button", { name: "Cancel Bet" }),
        ).not.toBeInTheDocument()
    })

    it("cancels the bet and unlocks the form for a new pick", async () => {
        const user = userEvent.setup()
        vi.mocked(cancelBet).mockResolvedValue(undefined)
        const onCancelBet = vi.fn()
        render(
            <GameBetForm
                game={game}
                sport="FOOTBALL"
                hasJoined={true}
                initialBet={placedBet}
                onPlaceBet={() => {}}
                onCancelBet={onCancelBet}
            />,
        )

        await user.click(screen.getByRole("button", { name: "Cancel Bet" }))

        expect(cancelBet).toHaveBeenCalledWith("g1")
        expect(onCancelBet).toHaveBeenCalled()
        expect(
            await screen.findByRole("button", { name: "Place Bet" }),
        ).toBeEnabled()
        expect(screen.getByRole("textbox")).toBeEnabled()
    })

    it("shows an error when cancelling fails", async () => {
        const user = userEvent.setup()
        vi.mocked(cancelBet).mockRejectedValue(new Error("500"))
        render(
            <GameBetForm
                game={game}
                sport="FOOTBALL"
                hasJoined={true}
                initialBet={placedBet}
                onPlaceBet={() => {}}
            />,
        )

        await user.click(screen.getByRole("button", { name: "Cancel Bet" }))

        expect(
            await screen.findByText("Couldn't cancel your bet. Please try again."),
        ).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Bet Placed" })).toBeDisabled()
    })

    it("offers a Tie option for a sport that allows ties", () => {
        render(<GameBetForm game={game} sport="SOCCER" hasJoined={true} onPlaceBet={() => {}} />)

        expect(screen.getByRole("button", { name: "Tie" })).toBeInTheDocument()
    })

    it("omits the Tie option for a sport that doesn't allow ties", () => {
        render(<GameBetForm game={game} sport="FOOTBALL" hasJoined={true} onPlaceBet={() => {}} />)

        expect(
            screen.queryByRole("button", { name: "Tie" }),
        ).not.toBeInTheDocument()
    })

    it("lets a tie be selected and placed", async () => {
        const user = userEvent.setup()
        vi.mocked(placeBet).mockResolvedValue({
            ...placedBet,
            outcome: "tie",
        })
        render(<GameBetForm game={game} sport="SOCCER" hasJoined={true} onPlaceBet={() => {}} />)

        const tieOption = screen.getByRole("button", { name: "Tie" })
        await user.click(tieOption)
        expect(tieOption).toHaveAttribute("aria-pressed", "true")

        await user.type(screen.getByRole("textbox"), "100")
        await user.click(placeBetButton())

        expect(placeBet).toHaveBeenCalledWith("g1", "tie", 100)
    })
})
