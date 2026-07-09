import type { League } from "@premonition/types"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import LeagueListItem from "./league-list-item"

/*******************************************************************************
 *
 * League List Item Tests
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

const writeText = vi.fn()

beforeEach(() => {
    writeText.mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
})

afterEach(() => {
    vi.clearAllMocks()
})

describe("LeagueListItem", () => {
    it("shows the league name and invite code", () => {
        render(<LeagueListItem league={league} />)

        expect(screen.getByText("Office Pool")).toBeInTheDocument()
        expect(screen.getByText("ABCDE12345")).toBeInTheDocument()
    })

    it("copies the invite code and shows confirmation when clicked", async () => {
        render(<LeagueListItem league={league} />)

        fireEvent.click(screen.getByRole("button", { name: "ABCDE12345" }))

        expect(writeText).toHaveBeenCalledWith("ABCDE12345")
        await waitFor(() => {
            expect(
                screen.getByRole("button", { name: "Copied!" }),
            ).toBeInTheDocument()
        })
    })
})
