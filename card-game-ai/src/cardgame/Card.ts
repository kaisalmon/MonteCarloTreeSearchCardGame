import {CardGameState} from "./CardGame";

export type PlayerKey = 'playerOne'|'playerTwo'

export abstract class Card{
    abstract applyEffect(state:CardGameState):CardGameState;

    private preEffect(state:CardGameState, cardNumber:number, playerKey:PlayerKey):CardGameState{
        const player = state[playerKey];
        const hand = [...player.hand]
        hand.splice(hand.indexOf(cardNumber), 1);
        return {
            ...state,
            [playerKey]: {
                ...player,
                hand
            }
        }
    }

    protected postEffect(state:CardGameState, cardNumber:number, playerKey:PlayerKey):CardGameState{
        return {
            ...state,
            [playerKey]: {
                ...state[playerKey],
                discardPile: [cardNumber, ...state[playerKey].discardPile]
            }
        }
    }

    play(state:CardGameState, cardNumber:number):CardGameState{
        const playerKey = state.activePlayer  === 1 ? 'playerOne' : 'playerTwo';
        const afterPreEffect = this.preEffect(state,cardNumber,playerKey);
        const afterEffect = this.applyEffect(afterPreEffect);
        return this.postEffect(afterEffect,cardNumber,playerKey);
    }
}
export class ItemCard extends Card{
    applyEffect(state: CardGameState): CardGameState {
        return state;
    }

    protected postEffect(state:CardGameState, cardNumber:number, playerKey:PlayerKey):CardGameState{
        return {
            ...state,
            [playerKey]: {
                ...state[playerKey],
                board: [cardNumber, ...state[playerKey].board]
            }
        }
    }

}