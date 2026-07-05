"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

/*******************************************************************************
 *
 * Nav Link Item
 *
 ******************************************************************************/

export default function NavLinkItem({
    link,
    variant,
}: {
    link: NavLink
    variant: "desktop" | "mobile"
}) {
    const pathname = usePathname()
    const activePaths = link.activePaths ?? [link.href]
    const isActive = activePaths.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`),
    )

    return (
        <li>
            <Link
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`${VARIANT_CLASS_NAMES[variant]} ${isActive ? ACTIVE_VARIANT_CLASS_NAMES[variant] : ""}`}
            >
                {link.label}
            </Link>
        </li>
    )
}

export type NavLink = {
    href: string
    label: string
    activePaths?: string[]
}

const VARIANT_CLASS_NAMES: Record<"desktop" | "mobile", string> = {
    desktop: "transition hover:text-primary-600 dark:hover:text-primary-400",
    mobile: "block rounded-md px-2 py-2 transition hover:bg-primary-50 hover:text-primary-700 dark:hover:bg-primary-950 dark:hover:text-primary-300",
}

const ACTIVE_VARIANT_CLASS_NAMES: Record<"desktop" | "mobile", string> = {
    desktop: "text-primary-600 dark:text-primary-400",
    mobile: "bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300",
}
