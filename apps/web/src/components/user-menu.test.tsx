import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { fetchCurrentUser, googleSignInUrl, signOut } from "@/lib/auth"
import UserMenu from "./user-menu"

/*******************************************************************************
 *
 * User Menu Tests
 *
 ******************************************************************************/

vi.mock("@/lib/auth", () => ({
    fetchCurrentUser: vi.fn(),
    googleSignInUrl: vi.fn(),
    signOut: vi.fn(),
}))

describe("UserMenu", () => {
    it("shows a Google sign-in link when signed out", async () => {
        vi.mocked(fetchCurrentUser).mockResolvedValue(null)
        vi.mocked(googleSignInUrl).mockReturnValue(
            "http://localhost:4000/auth/google",
        )

        render(<UserMenu />)

        await waitFor(() => {
            expect(
                screen.getByRole("link", { name: "Sign in with Google" }),
            ).toBeInTheDocument()
        })
        expect(
            screen.getByRole("link", { name: "Sign in with Google" }),
        ).toHaveAttribute("href", "http://localhost:4000/auth/google")
    })

    it("shows the signed-in user's name and initials", async () => {
        vi.mocked(fetchCurrentUser).mockResolvedValue({
            id: "u1",
            email: "alex@example.com",
            name: "Alex Morgan",
            avatarUrl: null,
        })

        render(<UserMenu />)

        await waitFor(() => {
            expect(screen.getByText("Alex Morgan")).toBeInTheDocument()
        })
        expect(screen.getByText("AM")).toBeInTheDocument()
    })

    it("signs out and reverts to the signed-out state", async () => {
        vi.mocked(fetchCurrentUser).mockResolvedValue({
            id: "u1",
            email: "alex@example.com",
            name: "Alex Morgan",
            avatarUrl: null,
        })
        vi.mocked(signOut).mockResolvedValue(undefined)
        vi.mocked(googleSignInUrl).mockReturnValue(
            "http://localhost:4000/auth/google",
        )

        render(<UserMenu />)

        await waitFor(() => {
            expect(
                screen.getByRole("button", { name: "Sign out" }),
            ).toBeInTheDocument()
        })

        fireEvent.click(screen.getByRole("button", { name: "Sign out" }))

        await waitFor(() => {
            expect(
                screen.getByRole("link", { name: "Sign in with Google" }),
            ).toBeInTheDocument()
        })
        expect(signOut).toHaveBeenCalled()
    })
})
