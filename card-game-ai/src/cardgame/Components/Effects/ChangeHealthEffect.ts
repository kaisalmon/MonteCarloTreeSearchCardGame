import TextTemplate, {Effect, ExecutionContext, PlayerTarget} from "../TextTemplate";
import CardGame, {CardGameState} from "../../CardGame";
import {PlayerKey} from "../../Card";

export class ChangeHealthEffect implements Effect{
    target:PlayerTarget
    amount:number;
    constructor(target:PlayerTarget, amount:number) {
        this.target=target;
        this.amount=amount;
    }
    applyEffect(state: CardGameState, ctx:ExecutionContext, game:CardGame): CardGameState {
        const targetKey = this.target.resolveValue(state, ctx);
        const s =  {
            ...state,
            [targetKey]:{
                ...state[targetKey],
                health:state[targetKey].health + this.amount
            }
        }
        return game.processEvent(s, 'player_take_damage', {
            amount: this.amount,
            player: targetKey
        })
    }
}

export default function setup(){
    new TextTemplate('Eff', '%Player takes? %N damage', ( target:PlayerTarget, n:number)=>new ChangeHealthEffect(target, -n));
    new TextTemplate('Eff', 'deal %N damage to %Player', (n:number, target:PlayerTarget)=>new ChangeHealthEffect(target, -n));
    new TextTemplate('Eff', '%Player loses? %N health', (target:PlayerTarget, n:number)=>new ChangeHealthEffect(target, -n));

    new TextTemplate('Eff', 'remove %N damage to %Player', (n:number, target:PlayerTarget)=>new ChangeHealthEffect(target, n));
    new TextTemplate('Eff', '%Player gains? %N health', (target:PlayerTarget, n:number)=>new ChangeHealthEffect(target, n));
}