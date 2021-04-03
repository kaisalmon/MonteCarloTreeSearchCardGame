import {Strategy} from "../MCTS/mcts";
import CardGame, {CardGameMove, CardGameState} from "./CardGame";
import _ from 'lodash';

export default class CardGameStrategy implements Strategy<CardGameState, CardGameMove>{
    mood = 'custom';

    pickMove(game: CardGame, state: CardGameState): CardGameMove[] | CardGameMove {
        const playerKey = state.activePlayer === 1 ? 'playerOne' : 'playerTwo';
        const winning = game.getHeuristic(state) * (state.activePlayer === 1 ? 1 : -1) > 0.1;
        const outOfCapital = state[playerKey].capital <= 0;
        const skipProb =    winning && outOfCapital ? 0.95 :
                            winning && !outOfCapital ? 0.7 :
                            outOfCapital ? 0.5 :  0.05;

        if(Math.random() < skipProb){
            return {type: 'end'}
        }
        const cardMove =  _.sample(game.getCardMoves(state));
        if(cardMove) return cardMove;
        return _.sample(game.getValidMoves(state))!
    }

}