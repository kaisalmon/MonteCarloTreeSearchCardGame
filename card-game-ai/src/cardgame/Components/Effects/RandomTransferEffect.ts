import TextTemplate, {Effect, ExecutionContext, Fizzle, PlayerTarget} from "../TextTemplate";
import CardGame, {CardGamePlayerState, CardGameState} from "../../CardGame";
import {PlayerKey} from "../../Card";
import {resolveActivePlayer} from "../setup";

type KeysMatching<T, V> = {[K in keyof T]-?: T[K] extends V ? K : never}[keyof T];

class RandomTransferEffect implements Effect{
    target:PlayerTarget
    from:KeysMatching<CardGamePlayerState, readonly number[]>;
    to:KeysMatching<CardGamePlayerState, readonly number[]>;
    n: number;
    constructor(target:PlayerTarget, from:KeysMatching<CardGamePlayerState, readonly number[]>, to:KeysMatching<CardGamePlayerState, readonly number[]>, n:number) {
        this.target = target;
        this.from = from;
        this.to = to;
        this.n = n;
    }

    applyEffect(state: CardGameState, ctx:ExecutionContext): CardGameState {
        let s = state;
        for(let i = 0; i<this.n;i++){
            s = this.transfer(s, ctx);
        }
        return s;
    }
    transfer(state: CardGameState, ctx:ExecutionContext): CardGameState {
        const targetKey = this.target.resolveValue(state, ctx);
        const player = state[targetKey];
        const fromPile = [...player[this.from]];
        const toPile = [...player[this.to]];
        if(fromPile.length === 0 || (this.to === 'hand' && toPile.length > CardGame.MAX_HAND_SIZE)){
            if(this.to === 'hand'){
                throw new Fizzle({...state, [targetKey]:{
                ...state[targetKey],
                    health: state[targetKey].health - 1
                }});
            }
            throw new Fizzle(state);
        }
        const drawIndex = Math.floor(Math.random() * fromPile.length);
        toPile.push(...fromPile.splice(drawIndex, 1))
        return {
            ...state,
            [targetKey]:{
                ...player,
                [this.to]:toPile,
                [this.from]:fromPile
            }
        }
    }
}
export class DrawCardEffect extends RandomTransferEffect{
    constructor(target:PlayerTarget, n:number) {
        super(target,'deck', 'hand', n);
    }
}

export default function setup(){
    new TextTemplate('Eff', '%Player draws? %N cards?', (target:PlayerTarget, n:number)=>new DrawCardEffect(target, n));
    new TextTemplate('Eff', '%Player discards? %N random cards?(?: from your hand)', (target:PlayerTarget, n:number)=>new RandomTransferEffect(target, 'hand','discardPile', n));
    new TextTemplate('Eff', '%Player discards? the top card (?:from|of) (?:their|your) deck', (target:PlayerTarget)=>new RandomTransferEffect(target, 'deck','discardPile', 1));
    new TextTemplate('Eff', '%Player discards? %N cards? from the top of (?:their|your) deck', (target:PlayerTarget, n:number)=>new RandomTransferEffect(target, 'deck','discardPile', n));
    new TextTemplate('Eff', '%Player draws? %N random cards? from (?:their|your) discard pile', (target:PlayerTarget, n:number)=>new RandomTransferEffect(target, 'discardPile','hand', n));
}