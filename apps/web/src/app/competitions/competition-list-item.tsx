"use client"

import type { Competition } from "@premonition/types"
import Link from "next/link"
import { useState } from "react"
import SportIcon from "@/components/icons/sport-icon"
import { googleSignInUrl, UnauthorizedError } from "@/lib/auth"
import { joinCompetition } from "@/lib/competitions"
import { formatDate } from "@/lib/dates"

/*******************************************************************************
 *
 * Competition List Item
 *
 ******************************************************************************/

export type CompetitionStatus = "open" | "joined" | "ended"

export default function CompetitionListItem({
    competition,
    status,
    isPopular = false,
}: {
    competition: Competition
    status: CompetitionStatus
    isPopular?: boolean
}) {
    /***************************************************************************
     * State
     **************************************************************************/

    const [joining, setJoining] = useState(false)
    const [justJoined, setJustJoined] = useState(false)
    const [error, setError] = useState<string | null>(null)

    /***************************************************************************
     * Handlers
     **************************************************************************/

    async function handleJoin() {
        setJoining(true)
        setError(null)
        try {
            await joinCompetition(competition.id)
            setJustJoined(true)
        } catch (err) {
            if (err instanceof UnauthorizedError) {
                window.location.href = googleSignInUrl()
                return
            }
            setError("Couldn't join this competition. Please try again.")
        } finally {
            setJoining(false)
        }
    }

    /***************************************************************************
     * Render
     **************************************************************************/

    return (
        <li className="flex flex-col gap-6 rounded-xl border border-zinc-200 bg-white p-7 transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-start justify-between gap-4">
                <Link
                    href={`/competitions/${competition.id}`}
                    className="flex min-w-0 items-center gap-4"
                >
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-950">
                        <SportIcon
                            sport={competition.sport}
                            className="h-9 w-9 text-primary-600 dark:text-primary-400"
                        />
                    </span>
                    <div className="min-w-0">
                        <p className="text-lg font-medium text-black dark:text-zinc-50">
                            {competition.name}
                        </p>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                            {formatDate(competition.startDate)} –{" "}
                            {formatDate(competition.endDate)}
                        </p>
                    </div>
                </Link>
                {isPopular && (
                    <span className="shrink-0 rounded-full bg-secondary-100 px-2 py-0.5 text-xs font-medium text-secondary-800 dark:bg-secondary-950 dark:text-secondary-300">
                        Popular
                    </span>
                )}
            </div>

            {status === "open" && (
                <button
                    type="button"
                    onClick={handleJoin}
                    disabled={joining || justJoined}
                    className="mt-auto w-full rounded-md bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-primary-500 dark:text-black dark:hover:bg-primary-400"
                >
                    {justJoined ? "Joined" : joining ? "Joining..." : "Join"}
                </button>
            )}

            {status === "joined" && (
                <span className="mt-auto w-full rounded-md bg-primary-50 px-4 py-2.5 text-center text-sm font-medium text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                    Joined
                </span>
            )}

            {status === "ended" && (
                <span className="mt-auto w-full rounded-md bg-zinc-100 px-4 py-2.5 text-center text-sm font-medium text-zinc-500 dark:bg-zinc-900 dark:text-zinc-500">
                    Competition ended
                </span>
            )}

            {error && (
                <p className="text-center text-sm text-red-600 dark:text-red-400">
                    {error}
                </p>
            )}
        </li>
    )
}
