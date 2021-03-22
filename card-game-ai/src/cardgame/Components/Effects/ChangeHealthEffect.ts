import TextTemplate, {Effect, PlayerTarget} from "../../TextTemplate";
import {CardGameState} from "../../CardGame";
import {PlayerKey} from "../../Card";

class ChangeHealthEffect implements Effect{
    target:PlayerTarget
    amount:number;
    constructor(target:PlayerTarget, amount:number) {
        this.target=target;
        this.amount=amount;
    }
    applyEffect(state: CardGameState, playerKey:PlayerKey): CardGameState {
        const targetKey = this.target.resolvePlayerKey(state, playerKey);
        return {
            ...state,
            [targetKey]:{
                ...state[targetKey],
                health:state[targetKey].health + this.amount
            }
        }
    }
}

export default function setup(){
    new TextTemplate('Eff', 'deal %N damage to %Player', (n:number, target:PlayerTarget)=>new ChangeHealthEffect(target, -n));
    new TextTemplate('Eff', 'remove %N damage to %Player', (n:number, target:PlayerTarget)=>new ChangeHealthEffect(target, n));
    new TextTemplate('Eff', '%Player loses? %N health', (target:PlayerTarget, n:number)=>new ChangeHealthEffect(target, -n));
    new TextTemplate('Eff', '%Player gains? %N health', (target:PlayerTarget, n:number)=>new ChangeHealthEffect(target, n));
}