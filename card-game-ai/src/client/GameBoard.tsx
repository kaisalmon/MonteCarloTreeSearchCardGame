import CardGame, {CardGameMove, CardGamePlayerState, CardGameState} from "../cardgame/CardGame";
import React, {CSSProperties, FunctionComponent, useEffect} from "react";
import CardDisplay  from "./CardDisplay";

import FlipMove from 'react-flip-move';

type GameBoardProps = {
    gamestate: CardGameState;
    game: CardGame,
    lastmove: CardGameMove;
    onCardClick: (n:number)=>void;
}
type PlayerDisplayProps = {
    isHidden: boolean;
    isActive: boolean;
    lastmove?: CardGameMove;
    player: CardGamePlayerState;
    gamestate: CardGameState;
    game: CardGame;
    onCardClick: (n:number)=>void;
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

const PILE_STYLE:CSSProperties = {
    border: '1px solid black',
    fontSize: 10,
    borderRadius: 3,
    width: 40,
    height: 60,
    margin: 5,
    display: 'inline-block'
}

const HAND_STYLE = {
    display: 'inline-flex',
    minWidth: 400,
    justifyContent:'center'
}
const HEALTH_WRAPPER_STYLE:CSSProperties = {
    fontSize: 60,
    position: "relative",
}
const HEALTH_STYLE:CSSProperties = {
    position: "absolute",
    bottom:25,
    left: 18,
    width: 20,
    fontSize: 16,
    color: "white",
    textAlign: 'center'
}

const PlayerDisplay:FunctionComponent<PlayerDisplayProps> = ({onCardClick, game, player, isActive, isHidden, lastmove, gamestate})=>{
    const [showingTempCards, setShowingTempCards] = React.useState(true)
    const cardsBeingPlayed = lastmove && lastmove.type === 'play' ? [lastmove.cardNumber] : []


    const displayHand = [...player.hand, ...cardsBeingPlayed].sort((a,b)=>a-b)

    return <div style={isActive ? ACTIVE_WRAPPER_STYLE : WRAPPER_STYLE}>
        <div style={HEALTH_WRAPPER_STYLE}>
            ❤
           <div style={HEALTH_STYLE}>
            {player.health}
        </div>
        </div>
        <FlipMove style={{...HAND_STYLE}}>
            {displayHand.length === 0 &&  (<pre>(Empty Hand)</pre>)}
            {displayHand.map(n=>(showingTempCards || !cardsBeingPlayed.includes(n)) && <div key={n}>
                <CardDisplay
                    onClick={()=>onCardClick(n)}
                    card={game.cardIndex[n]}
                    canBePlayed={isActive && !isHidden && gamestate.step === 'play' && !cardsBeingPlayed.includes(n)}
                    canBeDiscarded={isActive && !isHidden && gamestate.step === 'draw' && !cardsBeingPlayed.includes(n)}
                    beingPlayed={cardsBeingPlayed.includes(n)}
                />
            </div>)}
        </FlipMove>
        <div style={PILE_STYLE}>
            Deck
            <div>{player.deck.length}</div>
        </div>
        <div style={PILE_STYLE}>
            Discard
            <div>{player.discardPile.length}</div>
        </div>
    </div>
}

const GameBoard:FunctionComponent<GameBoardProps> = (props)=>{
    const {gamestate, game, lastmove, onCardClick} = props;
    return <>
        <div>
            Step: {gamestate.step}
        </div>
        <PlayerDisplay onCardClick={()=>{}} game={game} gamestate={gamestate} player={gamestate.playerTwo} lastmove={gamestate.activePlayer === 2 ? lastmove: undefined} isActive={gamestate.activePlayer === 2} isHidden={true}/>
        <div style={{height: "50vh"}}></div>
        <PlayerDisplay onCardClick={onCardClick} game={game} gamestate={gamestate} player={gamestate.playerOne} lastmove={gamestate.activePlayer === 1 ? lastmove: undefined} isActive={gamestate.activePlayer === 1} isHidden={false}/>
    </>
}

export default GameBoard;