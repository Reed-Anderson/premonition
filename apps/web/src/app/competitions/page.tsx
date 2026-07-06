"use client"

import { type Competition, isCompetitionActive } from "@premonition/types"
import { useEffect, useState } from "react"
import { fetchCompetitions, fetchMyCompetitionIds } from "@/lib/competitions"
import CompetitionSection from "./competition-section"

/*******************************************************************************
 *
 * Competitions Page
 *
 ******************************************************************************/

export default function CompetitionsPage() {
    /***************************************************************************
     * State
     **************************************************************************/

    const [competitions, setCompetitions] = useState<Competition[]>([])
    const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    /***************************************************************************
     * Effects
     **************************************************************************/

    useEffect(() => {
        Promise.all([fetchCompetitions(), fetchMyCompetitionIds()])
            .then(([competitions, myCompetitionIds]) => {
                setCompetitions(competitions)
                setJoinedIds(new Set(myCompetitionIds))
            })
            .catch(() => {
                setError("Couldn't load competitions. Please try again.")
            })
            .finally(() => setLoading(false))
    }, [])

    /***************************************************************************
     * Render Variables
     **************************************************************************/

    const myCompetitions = competitions.filter(
        (competition) =>
            joinedIds.has(competition.id) && isCompetitionActive(competition),
    )
    const openCompetitions = competitions.filter(
        (competition) =>
            !joinedIds.has(competition.id) && isCompetitionActive(competition),
    )
    const pastCompetitions = competitions.filter(
        (competition) => !isCompetitionActive(competition),
    )

    /***************************************************************************
     * Render
     **************************************************************************/

    return (
        <div className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-16 font-sans dark:bg-black">
            <main className="flex w-full max-w-3xl flex-col gap-10">
                <div className="text-center">
                    <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
                        Competitions
                    </h1>
                    <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                        Track the competitions you've joined, or find a new one
                        to start predicting outcomes.
                    </p>
                </div>

                {loading && (
                    <p className="text-center text-zinc-500 dark:text-zinc-400">
                        Loading competitions...
                    </p>
                )}

                {error && (
                    <p className="text-center text-red-600 dark:text-red-400">
                        {error}
                    </p>
                )}

                {!loading && !error && (
                    <>
                        <CompetitionSection
                            title="My Competitions"
                            competitions={myCompetitions}
                            status="joined"
                        />
                        <CompetitionSection
                            title="Active Competitions"
                            competitions={openCompetitions}
                            status="open"
                        />
                        <CompetitionSection
                            title="Past Competitions"
                            competitions={pastCompetitions}
                            status="ended"
                        />

                        {competitions.length === 0 && (
                            <p className="text-center text-zinc-500 dark:text-zinc-400">
                                No competitions yet.
                            </p>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}
