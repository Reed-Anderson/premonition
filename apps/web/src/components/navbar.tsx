import Link from "next/link"
import NavLinkItem, { type NavLink } from "./nav-link-item"
import UserMenu from "./user-menu"

/*******************************************************************************
 *
 * Navbar
 *
 ******************************************************************************/

export default function Navbar() {
    return (
        <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/80">
            <nav className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 font-sans">
                <Link
                    href="/"
                    className="text-lg font-semibold tracking-tight text-black dark:text-zinc-50"
                >
                    Premonition
                </Link>

                <ul className="hidden items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400 md:flex">
                    {NAV_LINKS.map((link) => (
                        <NavLinkItem
                            key={link.href}
                            link={link}
                            variant="desktop"
                        />
                    ))}
                </ul>

                <div className="flex items-center gap-3">
                    <UserMenu />

                    <details className="group md:hidden">
                        <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-md outline-none transition hover:bg-zinc-100 dark:hover:bg-zinc-900 [&::-webkit-details-marker]:hidden">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-5 w-5 text-zinc-700 dark:text-zinc-300"
                            >
                                <path d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </summary>
                        <ul className="absolute inset-x-0 top-full flex flex-col gap-1 border-b border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-600 dark:border-zinc-800 dark:bg-black dark:text-zinc-400">
                            {NAV_LINKS.map((link) => (
                                <NavLinkItem
                                    key={link.href}
                                    link={link}
                                    variant="mobile"
                                />
                            ))}
                        </ul>
                    </details>
                </div>
            </nav>
        </header>
    )
}

const NAV_LINKS: NavLink[] = [
    { href: "/competitions", label: "Competitions" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/bets", label: "My Bets" },
]
