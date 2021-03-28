import CardGame, {CardGameMove, CardGameState} from "../../cardgame/CardGame";
import {Card} from "../../cardgame/Card";
import loadExampleDeck from "../../cardgame/Data/ExampleDecks";
import {MCTSStrategy, MoveFromGame, StateFromGame} from "../../MCTS/mcts";
import setupEffects from "../../cardgame/Components/setup";


export type WorkerResponse = {
  move: CardGameMove,
  mood: string
}

setupEffects();
const cardIndex:Record<number, Card> = loadExampleDeck()
const game = new CardGame(cardIndex)
const strategy:MCTSStrategy<StateFromGame<typeof game>, MoveFromGame<typeof game>> = new MCTSStrategy(1000,100)

export function processData(state: CardGameState): WorkerResponse {
  const move =  strategy.pickMove(game, state);
  const {mood} = strategy;
  return {mood, move};
}