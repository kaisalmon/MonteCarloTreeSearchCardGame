import React, {useMemo} from 'react';
import './App.css';
import {Card} from "./cardgame/Card";
import loadExampleDeck from "./cardgame/Data/ExampleDecks";
import CardGame, {CardGameMove, CardGameState} from "./cardgame/CardGame";
import {GameStatus, MCTSStrategy, MoveFromGame, RandomStrategy, StateFromGame, Strategy} from "./MCTS/mcts";
import GameBoard from "./client/GameBoard";

function getMoveFromCardClick(gamestate:CardGameState, cardNumber:number):CardGameMove{
    if(gamestate.step=='draw')return {type:'discard', cardNumber}
    else return {type:'play', cardNumber}
}

function App() {
  const cardIndex:Record<number, Card> = useMemo(()=>loadExampleDeck(), []);
  const deck = useMemo(()=>Object.keys(cardIndex).map(n=>parseInt(n)), [cardIndex]);
  const game = useMemo(()=>new CardGame(cardIndex, deck), [cardIndex, deck]);
  const playerStrat:Strategy<StateFromGame<typeof game>, MoveFromGame<typeof game>> = new RandomStrategy()
  const greedyStrat:Strategy<StateFromGame<typeof game>, MoveFromGame<typeof game>> = new MCTSStrategy(1,1,(gs)=>game.getHeuristic(gs));
  const opponentStrat:Strategy<StateFromGame<typeof game>, MoveFromGame<typeof game>> = new MCTSStrategy(45,45,(gs)=>game.getHeuristic(gs), greedyStrat)
  const [gamestate, setGamestate] = React.useState(game.newGame());
  const status = useMemo(()=>game.getStatus(gamestate),[game, gamestate])

  const [t, setT] = React.useState(NaN);
  const [mood, setMood] = React.useState(opponentStrat.mood);
  const [lastmove, setLastMove] = React.useState<CardGameMove>({type:"end"});

  return (
    <div className="App">
        {status !== GameStatus.IN_PLAY && <h1>{status}</h1>}
      <GameBoard
          gamestate={gamestate}
          game={game}
          lastmove={lastmove}
          onCardClick={(n)=>{
              if(status !== GameStatus.IN_PLAY)return;
              const move = getMoveFromCardClick(gamestate,n)
              const newState = game.applyMove(gamestate, move);
              setGamestate(newState)
              setLastMove(move)
          }}
      />
      <button
          disabled={status!==GameStatus.IN_PLAY || gamestate.activePlayer === 1}
          onClick={()=>{
              const t = performance.now()
              const strat = (gamestate.activePlayer === 1 ? playerStrat : opponentStrat);
              const move = strat.pickMove(game,gamestate)
              setT(performance.now() - t)
              const newState = game.applyMove(gamestate, move);
              setGamestate(newState)
              setMood(strat.mood)
              setLastMove(move)
          }}
      >
          step AI {t ? `(${t.toFixed(2)} ms)` : ''}
      </button>

      <button
          disabled={status!==GameStatus.IN_PLAY || gamestate.activePlayer === 2 || !game.getValidMoves(gamestate).find(m=>m.type==="end")}
          onClick={()=>{
              const move:CardGameMove = {type:"end"}
              const newState = game.applyMove(gamestate, move);
              setGamestate(newState)
              setLastMove(move)
          }}
      >
         End Turn
      </button>
        <div>
            {mood}
        </div>
    </div>
  );
}

export default App;
