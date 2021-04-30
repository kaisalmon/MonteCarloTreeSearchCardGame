import CardGame, {CardGameMove, CardGameState} from "../../cardgame/CardGame";
import {Card} from "../../cardgame/Card";
import loadExampleDeck from "../../cardgame/Data/ExampleDecks";
import {MCTSStrategy, MoveFromGame, RandomStrategy, StateFromGame} from "../../mcts/mcts";
import setupEffects from "../../cardgame/Components/setup";
import CardGameStrategy from "../../cardgame/CardGameStrategy";


export type WorkerResponse = {
  move: CardGameMove|CardGameMove[],
  mood: string
}

setupEffects();
const cardIndex:Record<number, Card> = loadExampleDeck()
const game = new CardGame(cardIndex)
const strategy:MCTSStrategy<StateFromGame<typeof game>, MoveFromGame<typeof game>> = new MCTSStrategy(700,30, game.getHeuristic.bind(game), new CardGameStrategy())

strategy.useCache = true;
strategy.usePruning = true;
strategy.pruningPeriod = 3;


export function processData(state: CardGameState): WorkerResponse {
  const move =  strategy.pickMove(game, state);
  const {mood} = strategy;
  return {mood, move};
}