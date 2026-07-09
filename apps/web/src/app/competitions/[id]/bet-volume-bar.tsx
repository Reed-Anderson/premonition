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
    allowsTie: boolean
}

export default function BetVolumeBar(props: BetVolumeBarProps) {
    const total =
        props.volume.home +
        props.volume.away +
        (props.allowsTie ? props.volume.tie : 0)
    const share = getBetVolumeShare(props.volume)
    const homePercent = Math.round(share.home * 100)
    const tiePercent = props.allowsTie ? Math.round(share.tie * 100) : 0
    const awayPercent = Math.round(share.away * 100)

    return (
        <div className="flex flex-col gap-1">
            <div
                className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900"
                role="img"
                aria-label={
                    total > 0
                        ? `Betting volume: ${homePercent}% on ${props.homeTeam}${props.allowsTie ? `, ${tiePercent}% on a tie` : ""}, ${awayPercent}% on ${props.awayTeam}`
                        : "No bets placed yet"
                }
            >
                {total > 0 && (
                    <>
                        <div
                            className="h-full bg-primary-600 transition-[flex-grow] duration-500 ease-out dark:bg-primary-500"
                            style={{ flexGrow: props.volume.home }}
                        />
                        {props.allowsTie && (
                            <div
                                className="h-full bg-zinc-400 transition-[flex-grow] duration-500 ease-out dark:bg-zinc-600"
                                style={{ flexGrow: props.volume.tie }}
                            />
                        )}
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
                    {props.allowsTie && (
                        <span>{props.volume.tie.toLocaleString()} credits on Tie</span>
                    )}
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
