import type { BetVolume } from "@premonition/types"
import { getBetVolumeShare } from "@premonition/types"

/*******************************************************************************
 *
 * Bet Volume Bar
 *
 ******************************************************************************/

export default function BetVolumeBar({
    volume,
    homeTeam,
    awayTeam,
}: {
    volume: BetVolume
    homeTeam: string
    awayTeam: string
}) {
    const total = volume.home + volume.away
    const share = getBetVolumeShare(volume)
    const homePercent = Math.round(share.home * 100)
    const awayPercent = total > 0 ? 100 - homePercent : 0

    return (
        <div className="flex flex-col gap-1">
            <div
                className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900"
                role="img"
                aria-label={
                    total > 0
                        ? `Betting volume: ${homePercent}% on ${homeTeam}, ${awayPercent}% on ${awayTeam}`
                        : "No bets placed yet"
                }
            >
                {total > 0 && (
                    <>
                        <div
                            className="h-full bg-primary-600 transition-[flex-grow] duration-500 ease-out dark:bg-primary-500"
                            style={{ flexGrow: volume.home }}
                        />
                        <div
                            className="h-full bg-secondary-600 transition-[flex-grow] duration-500 ease-out"
                            style={{ flexGrow: volume.away }}
                        />
                    </>
                )}
            </div>

            {total > 0 ? (
                <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span>
                        {volume.home.toLocaleString()} credits on {homeTeam}
                    </span>
                    <span>
                        {volume.away.toLocaleString()} credits on {awayTeam}
                    </span>
                </div>
            ) : (
                <p className="text-xs text-zinc-400 dark:text-zinc-600">
                    No bets placed yet
                </p>
            )}
        </div>
    )
}
