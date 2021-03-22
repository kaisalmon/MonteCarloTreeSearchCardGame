import {Card} from "../cardgame/Card";
import loadExampleDeck from "../cardgame/Data/ExampleDecks";
import _ from "lodash";
import CardGame from "../cardgame/CardGame";
import {GameStatus, MCTSStrategy, MoveFromGame, RandomStrategy, StateFromGame, Strategy} from "./mcts";

export function main(){
    const cardIndex:Record<number, Card> = loadExampleDeck();
    const deck = _.flatMap([1,2,3,4].map(()=>Object.keys(cardIndex).map(n=>parseInt(n))));
    const game = new CardGame(cardIndex, deck);
    const greedyStrat:Strategy<StateFromGame<typeof game>, MoveFromGame<typeof game>> = new MCTSStrategy(1,1,(gs)=>game.getHeuristic(gs));
    const redStrat:Strategy<StateFromGame<typeof game>, MoveFromGame<typeof game>> = new MCTSStrategy(25,25,(gs)=>game.getHeuristic(gs))
    const blueStrat:Strategy<StateFromGame<typeof game>, MoveFromGame<typeof game>> = new MCTSStrategy(25,25,(gs)=>game.getHeuristic(gs), greedyStrat)

    const wins:Record<GameStatus, number> = {
        [GameStatus.WIN]: 0,
        [GameStatus.LOSE]: 0,
        [GameStatus.DRAW]: 0,
        [GameStatus.IN_PLAY]: 0,
    };
    const ends = {
        'no_health':0,
        'no_deck':0,
    };
    for(let i = 0; i < 300; i++) {
        const max_len = 300;
        let moves = 0;
        let state = game.newGame()
        try {
            while (game.getStatus(state) === GameStatus.IN_PLAY && moves++ < max_len) {
                const activeStrat = state.activePlayer === 1 ? blueStrat : redStrat;
                const move = activeStrat.pickMove(game, state);
                state = game.applyMove(state, move);
                /*
                console.log(activeStrat.mood)
                game.print(state)

                 */
            }
            const status = game.getStatus(state);
            wins[status] += 1
            if(state.playerOne.deck.length === 0 || state.playerTwo.deck.length===0){
                ends.no_deck++;
            }
            if(state.playerOne.health <= 0 || state.playerTwo.health <= 0){
                ends.no_health++;
            }
        } catch (e) {
            wins[GameStatus.IN_PLAY] += 1
            console.error(e)
            if(e.message.includes('No valid moves')){
            }else{
                throw e
            }
        }
        //game.print(state)
        console.log({...wins, ...ends})
    }
}
main();