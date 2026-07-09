"use client"

import type { League } from "@premonition/types"
import { useState } from "react"

/*******************************************************************************
 *
 * League List Item
 *
 ******************************************************************************/

type LeagueListItemProps = {
    league: League
}

export default function LeagueListItem(props: LeagueListItemProps) {
    /***************************************************************************
     * State
     **************************************************************************/

    const [copied, setCopied] = useState(false)

    /***************************************************************************
     * Callbacks
     **************************************************************************/

    async function handleCopy() {
        await navigator.clipboard.writeText(props.league.inviteCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    /***************************************************************************
     * Render
     **************************************************************************/

    return (
        <li className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="min-w-0 truncate font-medium text-black dark:text-zinc-50">
                {props.league.name}
            </p>
            <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 rounded-md bg-primary-50 px-3 py-1.5 font-mono text-sm font-medium text-primary-700 transition hover:bg-primary-100 dark:bg-primary-950 dark:text-primary-300 dark:hover:bg-primary-900"
            >
                {copied ? "Copied!" : props.league.inviteCode}
            </button>
        </li>
    )
}
