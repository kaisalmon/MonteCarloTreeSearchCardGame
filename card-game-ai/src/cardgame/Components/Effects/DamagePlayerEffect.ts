import TextTemplate, {Effect, PlayerTarget} from "../../TextTemplate";
import {CardGameState} from "../../CardGame";
import {PlayerKey} from "../../Card";
import {Simulate} from "react-dom/test-utils";
import play = Simulate.play;

class DamagePlayerEffect implements Effect{
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
                health:state[targetKey].health - this.amount
            }
        }
    }
}

export default function setup(){
    new TextTemplate('Eff', 'deal one damage to %Player', (target:PlayerTarget)=>new DamagePlayerEffect(target, 1));
}