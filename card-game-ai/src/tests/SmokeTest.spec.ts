import {describe} from "mocha";
import CardGame from "../cardgame/CardGame";
import loadExampleDeck from "../cardgame/Data/ExampleDecks";
import {Card} from "../cardgame/Card";
import _ from 'lodash'
import {GameStatus, MCTSStrategy, MoveFromGame, RandomStrategy, StateFromGame, Strategy} from "../MCTS/mcts";
import assert from 'assert'

describe("Smoketest", ()=> {

    it("Can run a full game", () => {
        const cardIndex:Record<number, Card> = loadExampleDeck();
        const deck = _.flatMap([1,2,3,4].map(()=>Object.keys(cardIndex).map(n=>parseInt(n))));
        const game = new CardGame(cardIndex, deck);
        const initialState = game.newGame();

        const p1Strat:Strategy<StateFromGame<typeof game>, MoveFromGame<typeof game>> = new MCTSStrategy(100,100,(state)=>game.getHeuristic(state))
        const p2Strat:Strategy<StateFromGame<typeof game>, MoveFromGame<typeof game>> = new MCTSStrategy(10,10,(state)=>game.getHeuristic(state))
        let moves = 0;
        let max_len = 1000;
        let state = initialState;
        while (game.getStatus(state) === GameStatus.IN_PLAY && moves++ < max_len) {
                const activeStrat = state.activePlayer === 1 ? p1Strat : p2Strat;
                const move = activeStrat.pickMove(game, state);
                state = game.applyMove(state, move);
        }
        console.log(game.getStatus(state))
        if(game.getStatus(state)===GameStatus.IN_PLAY){
            assert.fail("Game should have ended")
        }
    }, 10000)
});