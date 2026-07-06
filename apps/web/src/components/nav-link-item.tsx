"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

/*******************************************************************************
 *
 * Nav Link Item
 *
 ******************************************************************************/

export type NavLink = {
    href: string
    label: string
    activePaths?: string[]
}

type NavLinkItemProps = {
    link: NavLink
    variant: "desktop" | "mobile"
}

export default function NavLinkItem(props: NavLinkItemProps) {
    const pathname = usePathname()
    const activePaths = props.link.activePaths ?? [props.link.href]
    const isActive = activePaths.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`),
    )

    return (
        <li>
            <Link
                href={props.link.href}
                aria-current={isActive ? "page" : undefined}
                className={`${VARIANT_CLASS_NAMES[props.variant]} ${isActive ? ACTIVE_VARIANT_CLASS_NAMES[props.variant] : ""}`}
            >
                {props.link.label}
            </Link>
        </li>
    )
}

const VARIANT_CLASS_NAMES: Record<"desktop" | "mobile", string> = {
    desktop: "transition hover:text-primary-600 dark:hover:text-primary-400",
    mobile: "block rounded-md px-2 py-2 transition hover:bg-primary-50 hover:text-primary-700 dark:hover:bg-primary-950 dark:hover:text-primary-300",
}

const ACTIVE_VARIANT_CLASS_NAMES: Record<"desktop" | "mobile", string> = {
    desktop: "text-primary-600 dark:text-primary-400",
    mobile: "bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300",
}
