import {describe} from "mocha";
import CardGame from "../cardgame/CardGame";
import loadExampleDeck from "../cardgame/Data/ExampleDecks";
import {Card} from "../cardgame/Card";
import _ from 'lodash'
import {GameStatus, MCTSStrategy, MoveFromGame, RandomStrategy, StateFromGame, Strategy} from "../mcts/mcts";
import setupEffects from '../cardgame/Components/setup'
import TextTemplate from "../cardgame/Components/TextTemplate";

describe("Smoketest", ()=> {

    it("Can run a full game", () => {
        const cardIndex:Record<number, Card> = loadExampleDeck();
        const game = new CardGame(cardIndex);
        const initialState = game.newGame();

        const p1Strat:Strategy<StateFromGame<typeof game>, MoveFromGame<typeof game>> = new MCTSStrategy(3,3)
        const p2Strat:Strategy<StateFromGame<typeof game>, MoveFromGame<typeof game>> = new MCTSStrategy(3,3)
        let moves = 0;
        let max_len = 100;
        let state = initialState;
        while (game.getStatus(state) === GameStatus.IN_PLAY && moves < max_len) {
            moves += 1;
            const activeStrat = state.activePlayer === 1 ? p1Strat : p2Strat;
            const move = activeStrat.pickMove(game, state);
            state = game.applyMoveChain(state, move);
        }
    })

    before(()=>setupEffects())
    after(()=>TextTemplate.clear())
});