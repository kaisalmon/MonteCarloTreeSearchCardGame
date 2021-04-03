import TextTemplate, {Effect, ExecutionContext, PlayerTarget} from "../TextTemplate";
import CardGame, {CardGamePlayerState, CardGameState} from "../../CardGame";
import {PlayerKey} from "../../Card";

type KeysMatching<T, V> = {[K in keyof T]-?: T[K] extends V ? K : never}[keyof T];
export class ChangePlayerValue extends Effect{
    target:PlayerTarget
    amount:number;
    field: KeysMatching<CardGamePlayerState, number>;
    constructor(target:PlayerTarget, amount:number, field: KeysMatching<CardGamePlayerState, number>) {
        super();
        this.target=target;
        this.amount=amount;
        this.field=field;
    }
    applyEffect(state: CardGameState, ctx:ExecutionContext, game:CardGame): CardGameState {
        const {field} = this;
        const targetKey = this.target.resolveValue(state, ctx, game);
        return   {
            ...state,
            [targetKey]:{
                ...state[targetKey],
                [field]:state[targetKey][field] + this.amount
            }
        }
        /*return game.processEvent(s, 'player_take_damage', {
            amount: this.amount,
            player: targetKey
        })*/
    }
}

export default function setup(){

    new TextTemplate('Eff', '%Player loses? %N popularity', (target:PlayerTarget, n:number)=>new ChangePlayerValue(target, -n, 'popularity'));
    new TextTemplate('Eff', '%Player gains? %N popularity', (target:PlayerTarget, n:number)=>new ChangePlayerValue(target, n, 'popularity'));
    new TextTemplate('Eff', '%Player gains? %N political capital', (target:PlayerTarget, n:number)=>new ChangePlayerValue(target, n, 'capital'));
    new TextTemplate('Eff', '%Player loses? %N political capital', (target:PlayerTarget, n:number)=>new ChangePlayerValue(target, -n, 'capital'));

}