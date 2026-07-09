"use client"

import type { League } from "@premonition/types"
import { useState } from "react"
import { googleSignInUrl, UnauthorizedError } from "@/lib/auth"
import { joinLeague, LeagueNotFoundError } from "@/lib/leagues"

/*******************************************************************************
 *
 * Join League Form
 *
 ******************************************************************************/

type JoinLeagueFormProps = {
    onJoined: (league: League) => void
}

export default function JoinLeagueForm(props: JoinLeagueFormProps) {
    /***************************************************************************
     * State
     **************************************************************************/

    const [inviteCode, setInviteCode] = useState("")
    const [isJoining, setIsJoining] = useState(false)
    const [error, setError] = useState<string | null>(null)

    /***************************************************************************
     * Callbacks
     **************************************************************************/

    async function handleJoin() {
        if (inviteCode.trim().length === 0) {
            return
        }
        setIsJoining(true)
        setError(null)
        try {
            const league = await joinLeague(inviteCode.trim())
            props.onJoined(league)
            setInviteCode("")
        } catch (err) {
            if (err instanceof UnauthorizedError) {
                window.location.href = googleSignInUrl()
                return
            }
            if (err instanceof LeagueNotFoundError) {
                setError("No league matches that invite code.")
            } else {
                setError("Couldn't join this league. Please try again.")
            }
        } finally {
            setIsJoining(false)
        }
    }

    /***************************************************************************
     * Render
     **************************************************************************/

    return (
        <div className="flex flex-col gap-2 rounded-lg border border-dashed border-zinc-300 p-4 dark:border-zinc-700">
            <p className="text-sm font-medium text-black dark:text-zinc-50">
                Join a league
            </p>
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Invite code"
                    value={inviteCode}
                    disabled={isJoining}
                    onChange={(e) =>
                        setInviteCode(e.target.value.toUpperCase())
                    }
                    className="min-w-0 grow rounded-md border border-zinc-200 px-3 py-1.5 font-mono text-sm text-black outline-none focus:border-primary-600 disabled:cursor-not-allowed disabled:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:disabled:bg-zinc-950"
                />
                <button
                    type="button"
                    disabled={isJoining || inviteCode.trim().length === 0}
                    onClick={handleJoin}
                    className="shrink-0 rounded-md bg-primary-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-primary-500 dark:text-black dark:hover:bg-primary-400"
                >
                    {isJoining ? "Joining..." : "Join"}
                </button>
            </div>
            {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
        </div>
    )
}
