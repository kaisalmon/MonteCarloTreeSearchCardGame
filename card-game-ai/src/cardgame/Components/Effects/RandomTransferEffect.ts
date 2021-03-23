import TextTemplate, {Effect, ExecutionContext, PlayerTarget} from "../TextTemplate";
import {CardGamePlayerState, CardGameState} from "../../CardGame";
import {PlayerKey} from "../../Card";
import {resolveActivePlayer} from "./setup";

type KeysMatching<T, V> = {[K in keyof T]-?: T[K] extends V ? K : never}[keyof T];

class RandomTransferEffect implements Effect{
    target:PlayerTarget
    from:KeysMatching<CardGamePlayerState, readonly number[]>;
    to:KeysMatching<CardGamePlayerState, readonly number[]>;
    constructor(target:PlayerTarget, from:KeysMatching<CardGamePlayerState, readonly number[]>, to:KeysMatching<CardGamePlayerState, readonly number[]>) {
        this.target = target;
        this.from = from;
        this.to = to;
    }

    applyEffect(state: CardGameState, ctx:ExecutionContext): CardGameState {
        const targetKey = this.target.resolvePlayerKey(state, ctx);
        const player = state[targetKey];
        const fromPile = [...player[this.from]];
        const toPile = [...player[this.to]];
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
class DrawCardEffect extends RandomTransferEffect{
    constructor(target?:PlayerTarget) {
        super(target || resolveActivePlayer,'deck', 'hand');
    }
}

export default function setup(){
    new TextTemplate('Eff', '%Player draws? a card', (target:PlayerTarget)=>new DrawCardEffect(target));
    new TextTemplate('Eff', '%Player discards? a random card(?: from your hand)', (target:PlayerTarget)=>new RandomTransferEffect(target, 'hand','discardPile'));
    new TextTemplate('Eff', '%Player discards? the top card (?:from|of) (?:their|your) deck', (target:PlayerTarget)=>new RandomTransferEffect(target, 'deck','discardPile'));
}