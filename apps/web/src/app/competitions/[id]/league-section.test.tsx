import type { League } from "@premonition/types"
import { render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { fetchMyLeagues } from "@/lib/leagues"
import LeagueSection from "./league-section"

/*******************************************************************************
 *
 * League Section Tests
 *
 ******************************************************************************/

vi.mock("@/lib/leagues", () => ({
    fetchMyLeagues: vi.fn(),
    createLeague: vi.fn(),
    joinLeague: vi.fn(),
    LeagueNotFoundError: class LeagueNotFoundError extends Error {},
}))

const league: League = {
    id: "l1",
    competitionId: "c1",
    name: "Office Pool",
    ownerId: "u1",
    inviteCode: "ABCDE12345",
    createdAt: "2026-07-04T00:00:00Z",
}

describe("LeagueSection", () => {
    it("renders nothing when the user hasn't joined the competition", () => {
        const { container } = render(
            <LeagueSection competitionId="c1" hasJoined={false} />,
        )

        expect(container).toBeEmptyDOMElement()
        expect(fetchMyLeagues).not.toHaveBeenCalled()
    })

    it("lists the user's leagues in this competition", async () => {
        vi.mocked(fetchMyLeagues).mockResolvedValue([league])

        render(<LeagueSection competitionId="c1" hasJoined={true} />)

        await waitFor(() => {
            expect(screen.getByText("Office Pool")).toBeInTheDocument()
        })
        expect(fetchMyLeagues).toHaveBeenCalledWith("c1")
    })

    it("shows an empty-state message when the user has no leagues yet", async () => {
        vi.mocked(fetchMyLeagues).mockResolvedValue([])

        render(<LeagueSection competitionId="c1" hasJoined={true} />)

        await waitFor(() => {
            expect(
                screen.getByText(
                    "You haven't joined a league in this competition yet.",
                ),
            ).toBeInTheDocument()
        })
    })
})
