"use client"

import type { League } from "@premonition/types"
import { useState } from "react"
import { googleSignInUrl, UnauthorizedError } from "@/lib/auth"
import { createLeague } from "@/lib/leagues"

/*******************************************************************************
 *
 * Create League Form
 *
 ******************************************************************************/

type CreateLeagueFormProps = {
    competitionId: string
    onCreated: (league: League) => void
}

export default function CreateLeagueForm(props: CreateLeagueFormProps) {
    /***************************************************************************
     * State
     **************************************************************************/

    const [name, setName] = useState("")
    const [isCreating, setIsCreating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    /***************************************************************************
     * Callbacks
     **************************************************************************/

    async function handleCreate() {
        if (name.trim().length === 0) {
            return
        }
        setIsCreating(true)
        setError(null)
        try {
            const league = await createLeague(props.competitionId, name.trim())
            props.onCreated(league)
            setName("")
        } catch (err) {
            if (err instanceof UnauthorizedError) {
                window.location.href = googleSignInUrl()
                return
            }
            setError("Couldn't create this league. Please try again.")
        } finally {
            setIsCreating(false)
        }
    }

    /***************************************************************************
     * Render
     **************************************************************************/

    return (
        <div className="flex flex-col gap-2 rounded-lg border border-dashed border-zinc-300 p-4 dark:border-zinc-700">
            <p className="text-sm font-medium text-black dark:text-zinc-50">
                Create a league
            </p>
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="League name"
                    value={name}
                    disabled={isCreating}
                    onChange={(e) => setName(e.target.value)}
                    className="min-w-0 grow rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-black outline-none focus:border-primary-600 disabled:cursor-not-allowed disabled:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:disabled:bg-zinc-950"
                />
                <button
                    type="button"
                    disabled={isCreating || name.trim().length === 0}
                    onClick={handleCreate}
                    className="shrink-0 rounded-md bg-primary-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-primary-500 dark:text-black dark:hover:bg-primary-400"
                >
                    {isCreating ? "Creating..." : "Create"}
                </button>
            </div>
            {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
        </div>
    )
}
