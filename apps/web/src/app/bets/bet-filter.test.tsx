import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import BetFilter from "./bet-filter"

/*******************************************************************************
 *
 * Bet Filter Tests
 *
 ******************************************************************************/

describe("BetFilter", () => {
    it("renders a button per filter", () => {
        render(<BetFilter selected="all" onSelect={() => {}} />)

        expect(
            screen.getAllByRole("button").map((button) => button.textContent),
        ).toEqual(["All", "Pending", "Won", "Lost"])
    })

    it("marks the selected filter as current", () => {
        render(<BetFilter selected="won" onSelect={() => {}} />)

        expect(screen.getByRole("button", { name: "All" })).toHaveAttribute(
            "aria-current",
            "false",
        )
        expect(screen.getByRole("button", { name: "Won" })).toHaveAttribute(
            "aria-current",
            "true",
        )
    })

    it("calls onSelect with the clicked filter", async () => {
        const user = userEvent.setup()
        const onSelect = vi.fn()
        render(<BetFilter selected="all" onSelect={onSelect} />)

        await user.click(screen.getByRole("button", { name: "Lost" }))

        expect(onSelect).toHaveBeenCalledWith("lost")
    })
})
