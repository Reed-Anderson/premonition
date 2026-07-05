import { render, screen } from "@testing-library/react"
import { usePathname } from "next/navigation"
import { describe, expect, it, vi } from "vitest"
import NavLinkItem from "./nav-link-item"

/*******************************************************************************
 *
 * Nav Link Item Tests
 *
 ******************************************************************************/

vi.mock("next/navigation", () => ({
    usePathname: vi.fn(),
}))

const link = {
    href: "/competitions",
    label: "Competitions",
}

describe("NavLinkItem", () => {
    it("marks the link active when the pathname matches an activePath", () => {
        vi.mocked(usePathname).mockReturnValue("/competitions/2026-world-cup")

        render(
            <ul>
                <NavLinkItem link={link} variant="desktop" />
            </ul>,
        )

        expect(
            screen.getByRole("link", { name: "Competitions" }),
        ).toHaveAttribute("aria-current", "page")
    })

    it("leaves the link inactive when the pathname doesn't match", () => {
        vi.mocked(usePathname).mockReturnValue("/leaderboard")

        render(
            <ul>
                <NavLinkItem link={link} variant="desktop" />
            </ul>,
        )

        expect(
            screen.getByRole("link", { name: "Competitions" }),
        ).not.toHaveAttribute("aria-current")
    })
})
