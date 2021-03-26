import {Card} from "../cardgame/Card";
import loadExampleDeck from "../cardgame/Data/ExampleDecks";
import _ from "lodash";
import {GameStatus, MCTSStrategy, MoveFromGame, RandomStrategy, StateFromGame, Strategy} from "./mcts";
import {performance} from 'perf_hooks';
import setupEffects from '../cardgame/Components/setup'
import CardGame, {CardGameState} from "../cardgame/CardGame";



export function main(){



    setupEffects();
    const cardIndex:Record<number, Card> = loadExampleDeck();
    const game = new CardGame(cardIndex)

    const blueStrat:Strategy<StateFromGame<typeof game>, MoveFromGame<typeof game>> = new RandomStrategy()
    const redStrat:MCTSStrategy<StateFromGame<typeof game>, MoveFromGame<typeof game>> = new MCTSStrategy(320,1000, game.getHeuristic)

    const wins:Record<GameStatus, number> = {
        [GameStatus.WIN]: 0,
        [GameStatus.LOSE]: 0,
        [GameStatus.DRAW]: 0,
        [GameStatus.IN_PLAY]: 0,
    };
    const ends = {
        "blue_t":0,
        "red_t":0,
    };

    for(let i = 0; i < 150; i++) {
        const max_len = 300;
        let moves = 0;
        let state = game.newGame()
        if(Math.random() > 0.5) {
            state = {
                ...state,
                activePlayer: 2
            }
        }
        try {
            while (game.getStatus(state) === GameStatus.IN_PLAY && moves++ < max_len) {
                const activeStrat = state.activePlayer === 1 ? blueStrat : redStrat;
                const start = performance.now();
                const move = activeStrat.pickMove(game, state);
                const t = performance.now() - start;
                ends[state.activePlayer === 1? 'blue_t' : 'red_t']+= t;
                state = game.applyMove(state, move);
                /*
                console.log(activeStrat.mood)
                game.print(state)
                 */
            }
            const status = game.getStatus(state);
            wins[status] += 1

        } catch (e) {
            wins[GameStatus.IN_PLAY] += 1
            console.error(e)
            if(e.message.includes('No valid moves')){
            }else{
                throw e
            }
        }
        //game.print(state)
        const endsAvg = _.mapValues(ends, v=>(v/(i+1)).toFixed(3))
        console.log({...wins, ...endsAvg})
    }
}
main();