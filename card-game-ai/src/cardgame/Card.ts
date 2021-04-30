import CardGame, {CardGameState} from "./CardGame";
import {Ability, ChoiceAction, Effect, Fizzle} from "./Components/TextTemplate";

export type PlayerKey = 'playerOne'|'playerTwo'

export type IconModifier = 'plus'|'minus'|'hearts'|'clubs'|'spades'|'diamonds'
export type Icon = string|{icon:string, modifier?:IconModifier}

export abstract class Card{
    cardNumber: number;
    cost: number;
    abstract getName():string;
    abstract getText():string;

    abstract getIcon():Icon;

    abstract applyEffect(state:CardGameState, playerKey:PlayerKey, game:CardGame):CardGameState;

    constructor(cardNumber: number, cost:number) {
        this.cardNumber = cardNumber;
        this.cost = cost;
    }


    protected preEffect(state:CardGameState, playerKey:PlayerKey):CardGameState{
        const player = state[playerKey];
        const hand = [...player.hand]
        const capitalCost = Math.min(player.capital, this.cost);
        const popCost = this.cost - capitalCost
        hand.splice(hand.indexOf(this.cardNumber), 1);
        return {
            ...state,
            endRoundAfterThisTurn: false,
            [playerKey]: {
                ...player,
                popularity: player.popularity - popCost,
                capital: player.capital - capitalCost,
                hand
            }
        }
    }

    protected postEffect(state:CardGameState, playerKey:PlayerKey):CardGameState{
        return {
            ...state,
            cardPlayedThisTurn: true,
            endRoundAfterThisTurn: false,
            [playerKey]: {
                ...state[playerKey],
                discardPile: [this.cardNumber, ...state[playerKey].discardPile]
            }
        }
    }

    play(state:CardGameState, cardNumber:number, game:CardGame):CardGameState{
        const playerKey = state.activePlayer  === 1 ? 'playerOne' : 'playerTwo';
        try{
            const afterPreEffect = this.preEffect(state,playerKey);
            const afterEffect = this.applyEffect(afterPreEffect, playerKey, game);
            return this.postEffect(afterEffect,playerKey);
        }catch(e){
            if(!Fizzle.isFizzle(e)) throw e;
            return this.postEffect(e.returnState, playerKey)
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

    getIcon(): Icon {
        return this.effect.getIcon();
    }

    constructor(effect:Effect, text:string, name:string, cardNumber:number, cost=1) {
        super(cardNumber, cost);
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
export class ChoiceActionCard extends Card{
    choiceAction: ChoiceAction;
    name: string;
    text: string;
    getName(): string {
        return this.name;
    }

    getText(): string {
        return this.text;
    }
    constructor(choiceAction:ChoiceAction, text:string, name:string,cardNumber:number, cost=1) {
        super(cardNumber, cost);
        this.choiceAction = choiceAction;
        this.text = text;
        this.name = name;
    }
    protected preEffect(state:CardGameState, playerKey:PlayerKey):CardGameState {
        return {
            ...super.preEffect(state,playerKey),
            cancelState: state
        };
    }
    applyEffect(state: CardGameState, playerKey:PlayerKey, game:CardGame): CardGameState {
        return {
            ...state,
            step:'choice',
            endRoundAfterThisTurn: false,
            cardPlayedThisTurn: true,
            cardBeingPlayed: this.cardNumber,
        }
    }
    protected postEffect(state:CardGameState, playerKey:PlayerKey):CardGameState {
        return state;
    }
    static is(c:Card): c is ChoiceActionCard{
        if(!c) return false;
        return (c as Record<string, any>).hasOwnProperty('choiceAction')
    }
    getIcon(){
        return "overhead";
    }

    cancel(state:CardGameState):CardGameState {
        if(!state.cancelState){
            throw new Error("No cancel state to return to")
        }
        return state.cancelState;
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
    constructor(ability:Ability, text:string, name:string, cardNumber:number, cost=1) {
        super(cardNumber, cost);
        this.ability = ability;
        this.text = text;
        this.name = name;
    }

    applyEffect(state: CardGameState): CardGameState {
        return state;
    }

    protected postEffect(state:CardGameState, playerKey:PlayerKey):CardGameState{
        return {
            ...state,
            cardPlayedThisTurn: true,
            endRoundAfterThisTurn: false,
            [playerKey]: {
                ...state[playerKey],
                board: [this.cardNumber, ...state[playerKey].board]
            }
        }
    }

    static isItemCard(c:Card):c is ItemCard{
        return (c as Object).hasOwnProperty('ability')
    }

    getIcon(){
        return "quill-ink";
    }
}
