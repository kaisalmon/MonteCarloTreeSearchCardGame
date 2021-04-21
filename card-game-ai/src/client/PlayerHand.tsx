import CardWrapper from "./CardWrapper";
import FlipMove from "react-flip-move";
import React from "react";
import CardGame, {CardGameMove, CardGamePlayerState, CardGameState} from "../cardgame/CardGame";
import DelayHover from "./DelayHover";

const HAND_STYLE = {
    display: 'inline-flex',
    width: 1000,
    justifyContent:'center',
    zIndex: 2,
}

type PlayerHandProps = {
        game:CardGame,
        displayHand:number[],
        gamestate:CardGameState,
        onCardClick:(cardNumber:number)=>void,
        setPreview:(move?:CardGameMove)=>void,
        isOpponent:boolean,
        isActive:boolean,
        player:CardGamePlayerState,
        cardsBeingPlayed:number[],
}

function getTransform(i:number, outOf:number, reverse:boolean):string {
    const r = i/(outOf-1);
    const deg = (4*(1-r) - 4*r) * (reverse ? -1 : 1);
    return `scale(0.6) rotate(${deg}deg)`
}

function PlayerHand(props:PlayerHandProps){
    const {
        game,
        displayHand,
        gamestate,
        onCardClick,
        setPreview,
        isOpponent,
        isActive,
        player,
        cardsBeingPlayed
    } = props;
    return <FlipMove style={{...HAND_STYLE}}>
                {displayHand.map((n:number, i)=><div
                    key={n+' '+game.cardIndex[n].getName()}
                    style={{position: 'relative'} }
                    className="zoom-focus"
                >
                    <CardWrapper
                        gamestate={gamestate}
                        game={game}
                        onClick={()=>onCardClick(n)}
                        setPreview={setPreview}
                        isOpponent={isOpponent}
                        isHidden={isOpponent && !cardsBeingPlayed.includes(n)}
                        card={game.cardIndex[n]}
                        canBePlayed={isActive && !isOpponent && gamestate.step === 'play' && !cardsBeingPlayed.includes(n)}
                        canBeDiscarded={isActive && !isOpponent && gamestate.step === 'draw' && !cardsBeingPlayed.includes(n)}
                        beingPlayed={cardsBeingPlayed.includes(n)}
                        onBoard={player.board.includes(n)}
                    />
                </div>)}
            </FlipMove>
}

export default PlayerHand;