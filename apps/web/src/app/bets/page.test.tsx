import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import MyBetsPage from "./page"

/*******************************************************************************
 *
 * My Bets Page Tests
 *
 ******************************************************************************/

describe("MyBetsPage", () => {
    it("lists all bets by default", () => {
        render(<MyBetsPage />)

        expect(screen.getAllByText("Mexico").length).toBeGreaterThan(0)
        expect(screen.getAllByRole("listitem").length).toBeGreaterThan(1)
    })

    it("filters bets by status", async () => {
        const user = userEvent.setup()
        render(<MyBetsPage />)

        await user.click(screen.getByRole("button", { name: "Lost" }))

        expect(
            screen.getByText("Kansas City Chiefs", { exact: false }),
        ).toBeInTheDocument()
        expect(screen.queryByText("Arsenal")).not.toBeInTheDocument()
    })

    it("summarizes pending wagers and net credits from resolved bets", () => {
        render(<MyBetsPage />)

        expect(screen.getByText("225")).toBeInTheDocument()
        expect(screen.getByText("+260")).toBeInTheDocument()
    })
})
