import TextTemplate, {Effect, ExecutionContext, Resolver} from "../TextTemplate";
import {CardGameState} from "../../CardGame";
import {PlayerKey} from "../../Card";

class ConditionalEffect implements Effect{
    eff:Effect;
    condition:Resolver<boolean>;
    constructor(eff:Effect, condition:Resolver<boolean>) {
        this.eff = eff;
        this.condition = condition;
    }
    applyEffect(state: CardGameState, ctx:ExecutionContext): CardGameState {
        if(this.condition.resolveValue(state, ctx)){
            return this.eff.applyEffect(state, ctx);
        }
        return state;
    }
}

export default function setup(){
    new TextTemplate('Eff', '%Eff if %Cond', (eff:Effect, cond:Resolver<boolean>)=>new ConditionalEffect(eff,cond));
    new TextTemplate('Eff', '%Eff, if %Cond', (eff:Effect, cond:Resolver<boolean>)=>new ConditionalEffect(eff,cond));
    new TextTemplate('Eff', 'If %Cond, %Eff', (cond:Resolver<boolean>, eff:Effect)=>new ConditionalEffect(eff,cond));
    new TextTemplate('Eff', 'If %Cond %Eff', (cond:Resolver<boolean>, eff:Effect)=>new ConditionalEffect(eff,cond));
}