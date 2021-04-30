import CardGame, {CardGameChoiceMove, CardGameMove, CardGamePlayerState, CardGameState} from "../cardgame/CardGame";
import React, {CSSProperties, FunctionComponent, useEffect} from "react";
import CardWrapper  from "./CardWrapper";
import DemographicDisplay from "./DemographicDisplay";

import _ from 'lodash'

import FlipMove from 'react-flip-move';
import CardPile from "./CardPile";
import ChoiceArrow from "./ChoiceArrow";
import {ChoiceActionCard} from "../cardgame/Card";
import PlayerHand from "./PlayerHand";
import {isA} from "../../node_modules.deltemetoo/expect/build/jasmineUtils";
import MoveHistory, {MoveHistoryElementProps, MoveHistoryEntry} from "./MoveHistory";

type GameBoardProps = {
    gamestate: CardGameState;
    game: CardGame,
    lastmove: CardGameMove;
    previewState?: CardGameState;
    onCardClick: (n:number)=>void;
    setPreview: (move?:CardGameMove)=>void,
    onChoiceClick: (move:CardGameChoiceMove)=>void,
    moveHistory:MoveHistoryEntry[],

}
type PlayerDisplayProps = {
    isHidden: boolean;
    isActive: boolean;
    lastmove?: CardGameMove;
    player: CardGamePlayerState;
    gamestate: CardGameState;
    game: CardGame;
    onCardClick: (n:number)=>void;
    setPreview: (move?:CardGameMove)=>void,
}

const WRAPPER_STYLE:CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    placeContent: 'center',
}

const ACTIVE_WRAPPER_STYLE = {
    ...WRAPPER_STYLE,
    background: 'gold',
}

const HEALTH_WRAPPER_STYLE:CSSProperties = {
    fontSize: 80,
    position: "relative",
}
const HEALTH_STYLE:CSSProperties = {
    position: "absolute",
    bottom:40,
    left: 25,
    width: 20,
    fontSize: 16,
    color: "white",
    textAlign: 'center'
}

const PLAYER_BOARD_STYLE:CSSProperties = {
    height: 200,
    display: 'flex',
    justifyContent:'center',
    alignItems: 'center',
    placeContent: 'center',

}

const PlayerDisplay:FunctionComponent<PlayerDisplayProps> = ({onCardClick, setPreview, game, player, isActive, isHidden, lastmove, gamestate})=>{
    const cardsBeingPlayed = lastmove && lastmove.type === 'play' ? [lastmove.cardNumber] : []

    const displayHand = [...player.hand, ...cardsBeingPlayed].sort((a,b)=>a-b);

    const board = <div >
        <FlipMove style={{...PLAYER_BOARD_STYLE}}>
            {player.board.map(n=><div key={n+' '+game.cardIndex[n].getName()}>
                <CardWrapper
                    gamestate={gamestate}
                    game={game}
                    onClick={()=>{}}
                    setPreview={()=>{}}
                    isOpponent={isHidden}
                    isHidden={false}
                    card={game.cardIndex[n]}
                    canBePlayed={false}
                    canBeDiscarded={false}
                    beingPlayed={false}
                    onBoard={true}
                />
            </div>)}
        </FlipMove>
    </div>

    return <div style={isActive ? ACTIVE_WRAPPER_STYLE : WRAPPER_STYLE}>
            <div style={HEALTH_WRAPPER_STYLE}>
                🟆
                <div style={HEALTH_STYLE}>
                    {player.capital}
                </div>
            </div>
            <div style={HEALTH_WRAPPER_STYLE}>
                🟊
                <div style={HEALTH_STYLE}>
                    {player.popularity}
                </div>
            </div>
            <PlayerHand
                game={game}
                displayHand={displayHand}
                gamestate={gamestate}
                onCardClick={onCardClick}
                setPreview={setPreview}
                isOpponent={isHidden}
                isActive={isActive}
                player={player}
                cardsBeingPlayed={cardsBeingPlayed}
            />
            <CardPile
                label="deck"
                cards={player.deck.map(n=>isHidden ? '?' : game.cardIndex[n] )}
            />
            <CardPile
                label="discard"
                cards={player.discardPile.map(n=>game.cardIndex[n])}
            />
        </div>
}

const GameBoard:FunctionComponent<GameBoardProps> = (props)=>{
    const {gamestate, game, lastmove, onCardClick, onChoiceClick, setPreview, previewState, moveHistory} = props;
    return <>
        <div>
            Step: {gamestate.step}
        </div>
        <MoveHistory moveHistory={moveHistory} game={game}/>
        <PlayerDisplay onCardClick={()=>{}} setPreview={()=>{}} game={game} gamestate={gamestate} player={gamestate.playerTwo} lastmove={gamestate.activePlayer === 2 ? lastmove: undefined} isActive={gamestate.activePlayer === 2} isHidden={true}/>
        <DemographicDisplay
            gamestate={gamestate}
            game={game}
            previewState={previewState}
            onChoiceClick={onChoiceClick}
            setPreview={setPreview}
        />
        <PlayerDisplay onCardClick={onCardClick} setPreview={setPreview} game={game} gamestate={gamestate} player={gamestate.playerOne} lastmove={gamestate.activePlayer === 1 ? lastmove: undefined} isActive={gamestate.activePlayer === 1} isHidden={false}/>
    </>
}

export default GameBoard;