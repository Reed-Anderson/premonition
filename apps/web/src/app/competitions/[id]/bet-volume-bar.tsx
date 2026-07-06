import type { BetVolume } from "@premonition/types"
import { getBetVolumeShare } from "@premonition/types"

/*******************************************************************************
 *
 * Bet Volume Bar
 *
 ******************************************************************************/

type BetVolumeBarProps = {
    volume: BetVolume
    homeTeam: string
    awayTeam: string
}

export default function BetVolumeBar(props: BetVolumeBarProps) {
    const total = props.volume.home + props.volume.away
    const share = getBetVolumeShare(props.volume)
    const homePercent = Math.round(share.home * 100)
    const awayPercent = total > 0 ? 100 - homePercent : 0

    return (
        <div className="flex flex-col gap-1">
            <div
                className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900"
                role="img"
                aria-label={
                    total > 0
                        ? `Betting volume: ${homePercent}% on ${props.homeTeam}, ${awayPercent}% on ${props.awayTeam}`
                        : "No bets placed yet"
                }
            >
                {total > 0 && (
                    <>
                        <div
                            className="h-full bg-primary-600 transition-[flex-grow] duration-500 ease-out dark:bg-primary-500"
                            style={{ flexGrow: props.volume.home }}
                        />
                        <div
                            className="h-full bg-secondary-600 transition-[flex-grow] duration-500 ease-out"
                            style={{ flexGrow: props.volume.away }}
                        />
                    </>
                )}
            </div>

            {total > 0 ? (
                <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span>
                        {props.volume.home.toLocaleString()} credits on{" "}
                        {props.homeTeam}
                    </span>
                    <span>
                        {props.volume.away.toLocaleString()} credits on{" "}
                        {props.awayTeam}
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
