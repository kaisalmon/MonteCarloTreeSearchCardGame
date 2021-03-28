import CardGame, {CardGameState} from "./CardGame";
import {Ability, Effect, Fizzle} from "./Components/TextTemplate";

export type PlayerKey = 'playerOne'|'playerTwo'

export abstract class Card{
    abstract getName():string;
    abstract getText():string;
    abstract applyEffect(state:CardGameState, playerKey:PlayerKey, game:CardGame):CardGameState;

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

    play(state:CardGameState, cardNumber:number, game:CardGame):CardGameState{
        const playerKey = state.activePlayer  === 1 ? 'playerOne' : 'playerTwo';
        try{
            const afterPreEffect = this.preEffect(state,cardNumber,playerKey);
            const afterEffect = this.applyEffect(afterPreEffect, playerKey, game);
            return this.postEffect(afterEffect,cardNumber,playerKey);
        }catch(e){
            if(!Fizzle.isFizzle(e)) throw e;
            return this.postEffect(e.returnState, cardNumber, playerKey)
        }
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
    applyEffect(state: CardGameState, playerKey:PlayerKey, game:CardGame): CardGameState {
        const ctx = {
            playerKey
        }
        return this.effect.applyEffect(state, ctx, game)
    }
}

export class ItemCard extends Card{
    ability: Ability;
    name: string;
    text: string;
    getName(): string {
        return this.name;
    }

    getText(): string {
        return this.text;
    }
    constructor(ability:Ability, text:string, name:string) {
        super();
        this.ability = ability;
        this.text = text;
        this.name = name;
    }

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

    static isItemCard(c:Card):c is ItemCard{
        return (c as Object).hasOwnProperty('ability')
    }
}
