import {Card} from "../cardgame/Card";
import loadExampleDeck from "../cardgame/Data/ExampleDecks";
import _ from "lodash";
import {GameStatus, MCTSStrategy, MoveFromGame, RandomStrategy, StateFromGame, Strategy} from "./mcts";
import {performance} from 'perf_hooks';
import setupEffects from '../cardgame/Components/setup'
import CardGame, {CardGameState} from "../cardgame/CardGame";
import {ConnectFourGame} from "./ConnectFour";



export function main(){

    setupEffects();
    const cardIndex:Record<number, Card> = loadExampleDeck();
    const game = new ConnectFourGame()

    const blueStrat:MCTSStrategy<StateFromGame<typeof game>, MoveFromGame<typeof game>> =new MCTSStrategy(320,1000)
    const redStrat:MCTSStrategy<StateFromGame<typeof game>, MoveFromGame<typeof game>> = new MCTSStrategy(320,1000)

    redStrat.useCache = true;

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
        let state:StateFromGame<typeof game> = {
            ...game.newGame(),
            activePlayer: Math.random() > 0.5 ? 1 : 2
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