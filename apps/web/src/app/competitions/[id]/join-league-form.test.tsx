import type { League } from "@premonition/types"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { googleSignInUrl, UnauthorizedError } from "@/lib/auth"
import { joinLeague, LeagueNotFoundError } from "@/lib/leagues"
import JoinLeagueForm from "./join-league-form"

/*******************************************************************************
 *
 * Join League Form Tests
 *
 ******************************************************************************/

vi.mock("@/lib/auth", () => ({
    googleSignInUrl: vi.fn(),
    UnauthorizedError: class UnauthorizedError extends Error {},
}))

vi.mock("@/lib/leagues", () => ({
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

describe("JoinLeagueForm", () => {
    it("joins a league and clears the input on success", async () => {
        vi.mocked(joinLeague).mockResolvedValue(league)
        const onJoined = vi.fn()

        render(<JoinLeagueForm onJoined={onJoined} />)

        fireEvent.change(screen.getByPlaceholderText("Invite code"), {
            target: { value: "abcde12345" },
        })
        fireEvent.click(screen.getByRole("button", { name: "Join" }))

        await waitFor(() => {
            expect(onJoined).toHaveBeenCalledWith(league)
        })
        expect(joinLeague).toHaveBeenCalledWith("ABCDE12345")
        expect(screen.getByPlaceholderText("Invite code")).toHaveValue("")
    })

    it("redirects to sign-in when the user isn't signed in", async () => {
        vi.mocked(joinLeague).mockRejectedValue(new UnauthorizedError())
        vi.mocked(googleSignInUrl).mockReturnValue(
            "http://localhost:4000/auth/google",
        )
        const originalLocation = window.location
        Reflect.deleteProperty(window, "location")
        Object.defineProperty(window, "location", {
            configurable: true,
            value: { href: "" },
        })

        render(<JoinLeagueForm onJoined={vi.fn()} />)

        fireEvent.change(screen.getByPlaceholderText("Invite code"), {
            target: { value: "ABCDE12345" },
        })
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

    it("shows a not-found message for an unknown invite code", async () => {
        vi.mocked(joinLeague).mockRejectedValue(new LeagueNotFoundError())

        render(<JoinLeagueForm onJoined={vi.fn()} />)

        fireEvent.change(screen.getByPlaceholderText("Invite code"), {
            target: { value: "BADCODE" },
        })
        fireEvent.click(screen.getByRole("button", { name: "Join" }))

        await waitFor(() => {
            expect(
                screen.getByText("No league matches that invite code."),
            ).toBeInTheDocument()
        })
    })

    it("shows a generic error message when joining fails", async () => {
        vi.mocked(joinLeague).mockRejectedValue(new Error("network"))

        render(<JoinLeagueForm onJoined={vi.fn()} />)

        fireEvent.change(screen.getByPlaceholderText("Invite code"), {
            target: { value: "ABCDE12345" },
        })
        fireEvent.click(screen.getByRole("button", { name: "Join" }))

        await waitFor(() => {
            expect(
                screen.getByText(
                    "Couldn't join this league. Please try again.",
                ),
            ).toBeInTheDocument()
        })
    })
})
