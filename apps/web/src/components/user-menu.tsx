"use client"

import type { User } from "@premonition/types"
import Link from "next/link"
import { useEffect, useState } from "react"
import { fetchCurrentUser, googleSignInUrl, signOut } from "@/lib/auth"

/*******************************************************************************
 *
 * User Menu
 *
 ******************************************************************************/

export default function UserMenu() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCurrentUser()
            .then(setUser)
            .catch(() => setUser(null))
            .finally(() => setLoading(false))
    }, [])

    async function handleSignOut() {
        await signOut()
        setUser(null)
    }

    if (loading) {
        return null
    }

    if (!user) {
        return (
            <a
                href={googleSignInUrl()}
                className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700 dark:bg-primary-500 dark:text-black dark:hover:bg-primary-400"
            >
                Sign in with Google
            </a>
        )
    }

    return (
        <>
            <span className="hidden rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700 dark:bg-primary-950 dark:text-primary-300 sm:inline-block">
                {CREDITS.toLocaleString()} credits
            </span>

            <details className="group relative">
                <summary className="relative flex cursor-pointer list-none items-center gap-2 rounded-full outline-none [&::-webkit-details-marker]:hidden">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white dark:bg-primary-500 dark:text-black">
                        {initialsFor(user.name)}
                    </span>
                    <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-secondary-500 ring-2 ring-white dark:ring-black" />
                </summary>
                <div className="absolute right-0 z-10 mt-2 w-48 rounded-lg border border-zinc-200 bg-white p-1 text-sm shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
                    <p className="truncate px-3 py-2 font-medium text-black dark:text-zinc-50">
                        {user.name}
                    </p>
                    <hr className="border-zinc-200 dark:border-zinc-800" />
                    <Link
                        href="/profile"
                        className="block rounded-md px-3 py-2 text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
                    >
                        Profile
                    </Link>
                    <Link
                        href="/settings"
                        className="block rounded-md px-3 py-2 text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
                    >
                        Settings
                    </Link>
                    <button
                        type="button"
                        onClick={handleSignOut}
                        className="block w-full rounded-md px-3 py-2 text-left text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
                    >
                        Sign out
                    </button>
                </div>
            </details>
        </>
    )
}

/* Hardcoded until the credits ledger is fetched from the API. */
const CREDITS = 2450

function initialsFor(name: string) {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
}
