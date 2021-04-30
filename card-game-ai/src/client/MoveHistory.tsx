import CardGame, {CardGameMove} from "../cardgame/CardGame";
import FlipMove from "react-flip-move";
import {IconComponent} from "./CardComponent";
import React from "react";
import Tooltip from "./Tooltip";

export type MoveHistoryEntry = {player:1|2, move:CardGameMove}
export type MoveHistoryElementProps =MoveHistoryEntry & {game:CardGame};
type MoveHistoryProps = {
    game: CardGame,
    moveHistory: MoveHistoryEntry[]
}

function MoveHistoryElement({move, player, game}:MoveHistoryElementProps){
    if(move.type !== "play") return null;
    const card = game.cardIndex[move.cardNumber];
    const icon = card.getIcon()
    const iconName = typeof icon === 'string' ? icon : icon.icon;
    return <div className={`player-${player}`}>
        <Tooltip
            opts={{placement:'right'}}
            target={
                <IconComponent
                    icon={iconName}
                    hsv={[0,0,0]}
                    size="30px"
                />
            }
        >
            <div style={{width: 300}}>
                <b>
                    {card.getName()}
                </b>
            </div>
            {card.getText()}
        </Tooltip>
    </div>
}

function MoveHistory({moveHistory, game}:MoveHistoryProps){
    return <div className="move-history-wrapper">
        <FlipMove className="move-history">
        {moveHistory.map(m=><div>
            <MoveHistoryElement player={m.player} move={m.move} game={game}/>
        </div>)}
    </FlipMove>
    </div>
}

export default MoveHistory