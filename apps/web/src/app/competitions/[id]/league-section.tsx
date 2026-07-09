"use client"

import type { League } from "@premonition/types"
import { useEffect, useState } from "react"
import { fetchMyLeagues } from "@/lib/leagues"
import CreateLeagueForm from "./create-league-form"
import JoinLeagueForm from "./join-league-form"
import LeagueListItem from "./league-list-item"

/*******************************************************************************
 *
 * League Section
 *
 ******************************************************************************/

type LeagueSectionProps = {
    competitionId: string
    hasJoined: boolean
}

export default function LeagueSection(props: LeagueSectionProps) {
    /***************************************************************************
     * State
     **************************************************************************/

    const [leagues, setLeagues] = useState<League[]>([])
    const [loading, setLoading] = useState(props.hasJoined)

    /***************************************************************************
     * Effects
     **************************************************************************/

    useEffect(() => {
        if (!props.hasJoined) {
            return
        }
        fetchMyLeagues(props.competitionId)
            .then(setLeagues)
            .finally(() => setLoading(false))
    }, [props.competitionId, props.hasJoined])

    /***************************************************************************
     * Callbacks
     **************************************************************************/

    function handleLeagueAdded(league: League) {
        setLeagues((current) =>
            current.some((l) => l.id === league.id)
                ? current
                : [...current, league],
        )
    }

    /***************************************************************************
     * Short Circuits
     **************************************************************************/

    if (!props.hasJoined) {
        return null
    }

    /***************************************************************************
     * Render
     **************************************************************************/

    return (
        <section className="flex flex-col gap-4 border-t border-zinc-200 pt-8 dark:border-zinc-800">
            <h2 className="text-xl font-semibold tracking-tight text-black dark:text-zinc-50">
                Leagues
            </h2>

            {!loading && leagues.length > 0 && (
                <ul className="flex flex-col gap-3">
                    {leagues.map((league) => (
                        <LeagueListItem key={league.id} league={league} />
                    ))}
                </ul>
            )}

            {!loading && leagues.length === 0 && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    You haven&apos;t joined a league in this competition yet.
                </p>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <CreateLeagueForm
                    competitionId={props.competitionId}
                    onCreated={handleLeagueAdded}
                />
                <JoinLeagueForm onJoined={handleLeagueAdded} />
            </div>
        </section>
    )
}
