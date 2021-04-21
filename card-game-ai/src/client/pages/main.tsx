import CardGame, {CardGameChain, CardGameMove, CardGameState} from "../../cardgame/CardGame";
import {GameStatus} from "../../mcts/mcts";
import GameBoard from "../GameBoard";
import {WorkerResponse} from "../worker/worker";
import Worker from "../worker";
import {Card} from "../../cardgame/Card";
import setupEffects from "../../cardgame/Components/setup";
import {useMemo} from "react";
import * as React from "react";
import getExampleDeck from "../../cardgame/Data/ExampleDecks";
import './App.css';
import delay from "delay";


type CombinedGameState = {
    state: CardGameState,
    lastMove?: CardGameChain
}

function getMoveFromCardClick(gamestate:CardGameState, cardNumber:number):CardGameMove{
    if(gamestate.step==='draw')return {type:'discard', cardNumber};
    else return {type:'play', cardNumber}
}

const WATCH_MODE = false;

const worker = new Worker();

function Main() {
    setupEffects();
  const cardIndex:Record<number, Card> = useMemo(()=>getExampleDeck(), []);
  const game = useMemo(()=>new CardGame(cardIndex), [cardIndex]);

  const [combinedGameState, setCombinedGameState] = React.useState<CombinedGameState>({
      state: game.newGame()
  });
  const status = useMemo(()=>game.getStatus(combinedGameState.state),[game, combinedGameState.state])

  const [mood, setMood] = React.useState('...');
  const [previewState, setPreviewState] = React.useState<CardGameState|undefined>()

    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(()=>{
        let nextTimeout:number = 0;
        const loop = async ()=>{
            if((combinedGameState.state.activePlayer === 2 || WATCH_MODE) && !isLoading && game.getStatus(combinedGameState.state) === GameStatus.IN_PLAY){
                setIsLoading(true)
                const delay_time = (combinedGameState.lastMove as CardGameMove)?.type === 'end' ? 1000 : 1500;
                const [{mood, move}]:[WorkerResponse, void] = await Promise.all([worker.processData(combinedGameState.state), delay(delay_time)])
                const newState = game.applyMoveChain(combinedGameState.state, move);
                setMood(mood)
                setIsLoading(false)
                setPreviewState(undefined)
                setCombinedGameState({
                    state:newState,
                    lastMove: Array.isArray(move) ? move[0] : move
                })
            }
        }
        nextTimeout = window.setTimeout(loop,0);
        return ()=>window.clearTimeout(nextTimeout);
    },[combinedGameState, game, isLoading])
    const lastmove  = (Array.isArray(combinedGameState.lastMove)?combinedGameState.lastMove[0] : combinedGameState.lastMove )||{type:'end'}
    const canEndTurn = game.getValidMoves(combinedGameState.state).find(m=>!Array.isArray(m) && m.type==="end");

  return (
    <div className="App">
        {status !== GameStatus.IN_PLAY && <h1>{status}</h1>}
      <GameBoard
          gamestate={combinedGameState.state}
          game={game}
          lastmove={lastmove}
          previewState={previewState}
          onCardClick={(n)=>{
              if(status !== GameStatus.IN_PLAY)return;
              const move = getMoveFromCardClick(combinedGameState.state,n)
              const newState = game.applyMove(combinedGameState.state, move);
              setPreviewState(undefined)
            setCombinedGameState({
                state:newState,
                lastMove: move
            })
          }}
          onChoiceClick={(move)=>{
              if(status !== GameStatus.IN_PLAY)return;
              const newState = game.applyMove(combinedGameState.state, move);
              setPreviewState(undefined)
            setCombinedGameState({
                state:newState,
                lastMove: move
            })
          }}
          setPreview={move=>setPreviewState( move && game.applyMove(combinedGameState.state, move))}
      />

      <button
          disabled={status!==GameStatus.IN_PLAY || combinedGameState.state.activePlayer === 2 || !canEndTurn}
          onClick={()=>{
              const move:CardGameMove = {type:"end"}
              const newState = game.applyMove(combinedGameState.state, move);
            setCombinedGameState({
                state:newState,
                lastMove: move
            })
          }}
      >
          {combinedGameState.state.endRoundAfterThisTurn ? 'End Round' : 'End Turn'}
      </button>

        <div>
            {mood}
        </div>
        {isLoading && 'loading'}
    </div>
  );
}

export default Main;
