import {CardGameState} from "./CardGame";
import {Effect} from "./Components/TextTemplate";

export type PlayerKey = 'playerOne'|'playerTwo'

export abstract class Card{
    abstract getName():string;
    abstract getText():string;
    abstract applyEffect(state:CardGameState, playerKey:PlayerKey):CardGameState;

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
        const afterEffect = this.applyEffect(afterPreEffect, playerKey);
        return this.postEffect(afterEffect,cardNumber,playerKey);
    }
}

export class EffectCard extends Card{
    effect: Effect;
    name: string;
    text: string;
    getName(): string {
        return this.name;
    }

    getText(): string {
        return this.text;
    }
    constructor(effect:Effect, text:string, name:string) {
        super();
        this.effect = effect;
        this.text = text;
        this.name = name;
    }
    applyEffect(state: CardGameState, playerKey:PlayerKey): CardGameState {
        const ctx = {
            playerKey
        }
        return this.effect.applyEffect(state, ctx)
    }
}

export abstract class ItemCard extends Card{
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
    abstract getName():string;
    abstract getText():string;
}
