import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import WeekSelector from "./week-selector"

/*******************************************************************************
 *
 * Week Selector Tests
 *
 ******************************************************************************/

describe("WeekSelector", () => {
    it("renders a button per week", () => {
        render(
            <WeekSelector
                weeks={[1, 2, 3]}
                selectedWeek={1}
                onSelectWeek={() => {}}
            />,
        )

        expect(
            screen.getAllByRole("button").map((button) => button.textContent),
        ).toEqual(["Week 1", "Week 2", "Week 3"])
    })

    it("marks the selected week as current", () => {
        render(
            <WeekSelector
                weeks={[1, 2]}
                selectedWeek={2}
                onSelectWeek={() => {}}
            />,
        )

        expect(screen.getByRole("button", { name: "Week 1" })).toHaveAttribute(
            "aria-current",
            "false",
        )
        expect(screen.getByRole("button", { name: "Week 2" })).toHaveAttribute(
            "aria-current",
            "true",
        )
    })

    it("calls onSelectWeek with the clicked week", async () => {
        const user = userEvent.setup()
        const onSelectWeek = vi.fn()
        render(
            <WeekSelector
                weeks={[1, 2, 3]}
                selectedWeek={1}
                onSelectWeek={onSelectWeek}
            />,
        )

        await user.click(screen.getByRole("button", { name: "Week 3" }))

        expect(onSelectWeek).toHaveBeenCalledWith(3)
    })
})
