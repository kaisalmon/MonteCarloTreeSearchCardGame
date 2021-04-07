import TextTemplate, {Effect, ExecutionContext, Fizzle, PlayerTarget} from "../TextTemplate";
import CardGame, {CardGamePlayerState, CardGameState} from "../../CardGame";
import _ from 'lodash';

type KeysMatching<T, V> = {[K in keyof T]-?: T[K] extends V ? K : never}[keyof T];

export type CardSource = KeysMatching<CardGamePlayerState, readonly number[]>;
export type CardDest = KeysMatching<CardGamePlayerState, readonly number[]>;

class RandomTransferEffect extends Effect{
    target:PlayerTarget;
    from:CardSource;
    to:CardDest;
    n: number;
    constructor(target:PlayerTarget, from:CardSource, to:CardDest, n:number) {
        super();
        this.target = target;
        this.from = from;
        this.to = to;
        this.n = n;
    }

    applyEffect(state: CardGameState, ctx:ExecutionContext, game:CardGame): CardGameState {
        let s = state;
        for(let i = 0; i<this.n;i++){
            s = this.transfer(s, ctx, game);
        }
        return s;
    }
    transfer(state: CardGameState, ctx:ExecutionContext, game:CardGame): CardGameState {
        const targetKey = this.target.resolveValue(state, ctx, game);
        const player = state[targetKey];
        const fromPile = [...player[this.from]];
        const toPile = [...player[this.to]];
        if(fromPile.length === 0 ){
            throw new Fizzle(state);
        }
        const drawIndex = Math.floor(Math.random() * fromPile.length);
        toPile.push(...fromPile.splice(drawIndex, 1))
        return  {
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
    transfer(state: CardGameState, ctx:ExecutionContext, game:CardGame): CardGameState {
        const s = super.transfer(state, ctx, game);
        const targetKey = this.target.resolveValue(state, ctx, game);
        if(!game)debugger
        return game.processEvent(s, 'player_draws', {
            player: targetKey,
            cardNumbers: _.xor(s[targetKey].hand, state[targetKey].hand),
            from: 'deck'
        })
    }
}


export default function setup(){
    new TextTemplate('Eff', '%Player draws? %N cards?', (target:PlayerTarget, n:number)=>new DrawCardEffect(target, n));
    new TextTemplate('Eff', '%Player draws? up to %N cards?', (target:PlayerTarget, n:number)=>new DrawCardEffect(target, n));
    new TextTemplate('Eff', '%Player discards? %N random cards?', (target:PlayerTarget, n:number)=>new RandomTransferEffect(target, 'hand','discardPile', n));
    new TextTemplate('Eff', '%Player discards? the top card (?:from|of) (?:their|your) deck', (target:PlayerTarget)=>new RandomTransferEffect(target, 'deck','discardPile', 1));
    new TextTemplate('Eff', '%Player discards? %N cards? from the top of (?:their|your) deck', (target:PlayerTarget, n:number)=>new RandomTransferEffect(target, 'deck','discardPile', n));
    new TextTemplate('Eff', '%Player draws? %N random cards? from (?:their|your) discard pile', (target:PlayerTarget, n:number)=>new RandomTransferEffect(target, 'discardPile','hand', n));
}