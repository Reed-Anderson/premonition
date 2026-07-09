import type { League } from "@premonition/types"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { googleSignInUrl, UnauthorizedError } from "@/lib/auth"
import { createLeague } from "@/lib/leagues"
import CreateLeagueForm from "./create-league-form"

/*******************************************************************************
 *
 * Create League Form Tests
 *
 ******************************************************************************/

vi.mock("@/lib/auth", () => ({
    googleSignInUrl: vi.fn(),
    UnauthorizedError: class UnauthorizedError extends Error {},
}))

vi.mock("@/lib/leagues", () => ({
    createLeague: vi.fn(),
}))

const league: League = {
    id: "l1",
    competitionId: "c1",
    name: "Office Pool",
    ownerId: "u1",
    inviteCode: "ABCDE12345",
    createdAt: "2026-07-04T00:00:00Z",
}

describe("CreateLeagueForm", () => {
    it("creates a league and clears the input on success", async () => {
        vi.mocked(createLeague).mockResolvedValue(league)
        const onCreated = vi.fn()

        render(<CreateLeagueForm competitionId="c1" onCreated={onCreated} />)

        fireEvent.change(screen.getByPlaceholderText("League name"), {
            target: { value: "Office Pool" },
        })
        fireEvent.click(screen.getByRole("button", { name: "Create" }))

        await waitFor(() => {
            expect(onCreated).toHaveBeenCalledWith(league)
        })
        expect(createLeague).toHaveBeenCalledWith("c1", "Office Pool")
        expect(screen.getByPlaceholderText("League name")).toHaveValue("")
    })

    it("redirects to sign-in when the user isn't signed in", async () => {
        vi.mocked(createLeague).mockRejectedValue(new UnauthorizedError())
        vi.mocked(googleSignInUrl).mockReturnValue(
            "http://localhost:4000/auth/google",
        )
        const originalLocation = window.location
        Reflect.deleteProperty(window, "location")
        Object.defineProperty(window, "location", {
            configurable: true,
            value: { href: "" },
        })

        render(<CreateLeagueForm competitionId="c1" onCreated={vi.fn()} />)

        fireEvent.change(screen.getByPlaceholderText("League name"), {
            target: { value: "Office Pool" },
        })
        fireEvent.click(screen.getByRole("button", { name: "Create" }))

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

    it("shows an error message when creation fails", async () => {
        vi.mocked(createLeague).mockRejectedValue(new Error("network"))

        render(<CreateLeagueForm competitionId="c1" onCreated={vi.fn()} />)

        fireEvent.change(screen.getByPlaceholderText("League name"), {
            target: { value: "Office Pool" },
        })
        fireEvent.click(screen.getByRole("button", { name: "Create" }))

        await waitFor(() => {
            expect(
                screen.getByText(
                    "Couldn't create this league. Please try again.",
                ),
            ).toBeInTheDocument()
        })
    })

    it("disables the create button until a name is entered", () => {
        render(<CreateLeagueForm competitionId="c1" onCreated={vi.fn()} />)

        expect(screen.getByRole("button", { name: "Create" })).toBeDisabled()
    })
})
