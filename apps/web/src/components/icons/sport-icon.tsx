import type { Sport } from "@premonition/types"
import { GiAmericanFootballHelmet, GiHockey, GiSoccerBall } from "react-icons/gi"
import type { IconType } from "react-icons"

/*******************************************************************************
 *
 * Sport Icon
 *
 ******************************************************************************/

type SportIconProps = {
    sport: Sport
    className?: string
}

export default function SportIcon(props: SportIconProps) {
    const Icon = SPORT_ICONS[props.sport]
    return <Icon className={props.className} />
}

const SPORT_ICONS: Record<Sport, IconType> = {
    SOCCER: GiSoccerBall,
    FOOTBALL: GiAmericanFootballHelmet,
    HOCKEY: GiHockey,
}
