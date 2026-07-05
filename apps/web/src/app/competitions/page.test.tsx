import type { Competition } from "@premonition/types"
import { render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { fetchCompetitions, fetchMyCompetitionIds } from "@/lib/competitions"
import CompetitionsPage from "./page"

/*******************************************************************************
 *
 * Competitions Page Tests
 *
 ******************************************************************************/

vi.mock("@/lib/competitions", () => ({
    fetchCompetitions: vi.fn(),
    fetchMyCompetitionIds: vi.fn(),
    joinCompetition: vi.fn(),
}))

const openCompetition: Competition = {
    id: "c1",
    name: "World Cup 2026",
    sport: "SOCCER",
    startDate: "2026-06-11",
    endDate: "2026-07-19",
}

const joinedCompetition: Competition = {
    id: "c2",
    name: "NFL 2026 Season",
    sport: "FOOTBALL",
    startDate: "2026-09-10",
    endDate: "2027-02-08",
}

const pastCompetition: Competition = {
    id: "c3",
    name: "2025 World Series",
    sport: "SOCCER",
    startDate: "2025-09-01",
    endDate: "2025-11-01",
}

describe("CompetitionsPage", () => {
    it("shows a loading state before competitions arrive", () => {
        vi.mocked(fetchCompetitions).mockReturnValue(new Promise(() => {}))
        vi.mocked(fetchMyCompetitionIds).mockReturnValue(new Promise(() => {}))

        render(<CompetitionsPage />)

        expect(screen.getByText("Loading competitions...")).toBeInTheDocument()
    })

    it("splits competitions into My, Active, and Past sections", async () => {
        vi.mocked(fetchCompetitions).mockResolvedValue([
            openCompetition,
            joinedCompetition,
            pastCompetition,
        ])
        vi.mocked(fetchMyCompetitionIds).mockResolvedValue([
            joinedCompetition.id,
        ])

        render(<CompetitionsPage />)

        await waitFor(() => {
            expect(screen.getByText("My Competitions")).toBeInTheDocument()
        })
        expect(screen.getByText("Active Competitions")).toBeInTheDocument()
        expect(screen.getByText("Past Competitions")).toBeInTheDocument()

        expect(screen.getByText("NFL 2026 Season")).toBeInTheDocument()
        expect(screen.getByText("World Cup 2026")).toBeInTheDocument()
        expect(screen.getByText("2025 World Series")).toBeInTheDocument()
        expect(
            screen.queryByText("Loading competitions..."),
        ).not.toBeInTheDocument()
    })

    it("omits a section when it has no competitions", async () => {
        vi.mocked(fetchCompetitions).mockResolvedValue([openCompetition])
        vi.mocked(fetchMyCompetitionIds).mockResolvedValue([])

        render(<CompetitionsPage />)

        await waitFor(() => {
            expect(screen.getByText("Active Competitions")).toBeInTheDocument()
        })
        expect(screen.queryByText("My Competitions")).not.toBeInTheDocument()
        expect(screen.queryByText("Past Competitions")).not.toBeInTheDocument()
    })

    it("shows an error message when the fetch fails", async () => {
        vi.mocked(fetchCompetitions).mockRejectedValue(new Error("network"))
        vi.mocked(fetchMyCompetitionIds).mockResolvedValue([])

        render(<CompetitionsPage />)

        await waitFor(() => {
            expect(
                screen.getByText(
                    "Couldn't load competitions. Please try again.",
                ),
            ).toBeInTheDocument()
        })
    })
})
