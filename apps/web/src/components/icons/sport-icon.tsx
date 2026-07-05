import type { Sport } from "@premonition/types"
import { GiAmericanFootballHelmet, GiHockey, GiSoccerBall } from "react-icons/gi"
import type { IconType } from "react-icons"

/*******************************************************************************
 *
 * Sport Icon
 *
 ******************************************************************************/

export default function SportIcon({
    sport,
    className,
}: {
    sport: Sport
    className?: string
}) {
    const Icon = SPORT_ICONS[sport]
    return <Icon className={className} />
}

const SPORT_ICONS: Record<Sport, IconType> = {
    SOCCER: GiSoccerBall,
    FOOTBALL: GiAmericanFootballHelmet,
    HOCKEY: GiHockey,
}
