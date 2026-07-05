import type { Competition } from "@premonition/types"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { googleSignInUrl, UnauthorizedError } from "@/lib/auth"
import { joinCompetition } from "@/lib/competitions"
import CompetitionListItem from "./competition-list-item"

/*******************************************************************************
 *
 * Competition List Item Tests
 *
 ******************************************************************************/

vi.mock("@/lib/auth", () => ({
    googleSignInUrl: vi.fn(),
    UnauthorizedError: class UnauthorizedError extends Error {},
}))

vi.mock("@/lib/competitions", () => ({
    joinCompetition: vi.fn(),
}))

const competition: Competition = {
    id: "c1",
    name: "World Cup 2026",
    sport: "SOCCER",
    startDate: "2026-06-11",
    endDate: "2026-07-19",
}

describe("CompetitionListItem", () => {
    it("shows a joined state after successfully joining", async () => {
        vi.mocked(joinCompetition).mockResolvedValue(undefined)

        render(<CompetitionListItem competition={competition} status="open" />)

        fireEvent.click(screen.getByRole("button", { name: "Join" }))

        await waitFor(() => {
            expect(
                screen.getByRole("button", { name: "Joined" }),
            ).toBeInTheDocument()
        })
        expect(joinCompetition).toHaveBeenCalledWith("c1")
    })

    it("redirects to sign-in when the user isn't signed in", async () => {
        vi.mocked(joinCompetition).mockRejectedValue(new UnauthorizedError())
        vi.mocked(googleSignInUrl).mockReturnValue(
            "http://localhost:4000/auth/google",
        )
        const originalLocation = window.location
        Reflect.deleteProperty(window, "location")
        Object.defineProperty(window, "location", {
            configurable: true,
            value: { href: "" },
        })

        render(<CompetitionListItem competition={competition} status="open" />)

        fireEvent.click(screen.getByRole("button", { name: "Join" }))

        await waitFor(() => {
            expect(window.location.href).toBe(
                "http://localhost:4000/auth/google",
            )
        })

        Object.defineProperty(window, "location", {
            configurable: true,
            value: originalLocation,
        })
    })

    it("shows an error message when joining fails", async () => {
        vi.mocked(joinCompetition).mockRejectedValue(new Error("network"))

        render(<CompetitionListItem competition={competition} status="open" />)

        fireEvent.click(screen.getByRole("button", { name: "Join" }))

        await waitFor(() => {
            expect(
                screen.getByText(
                    "Couldn't join this competition. Please try again.",
                ),
            ).toBeInTheDocument()
        })
    })

    it("shows a Joined label with no button for already-joined competitions", () => {
        render(
            <CompetitionListItem competition={competition} status="joined" />,
        )

        expect(screen.getByText("Joined")).toBeInTheDocument()
        expect(screen.queryByRole("button")).not.toBeInTheDocument()
    })

    it("shows an ended label with no button for past competitions", () => {
        render(<CompetitionListItem competition={competition} status="ended" />)

        expect(screen.getByText("Competition ended")).toBeInTheDocument()
        expect(screen.queryByRole("button")).not.toBeInTheDocument()
    })
})
