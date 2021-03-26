import TextTemplate, {Effect, ExecutionContext, PlayerTarget, Resolver} from "../TextTemplate";
import {CardGameState} from "../../CardGame";
import {PlayerKey} from "../../Card";
import {hasTarget, resolvePlayerContextually} from "../setup";

export class ConditionalEffect implements Effect{
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
    const reversedConditionalFactory = (eff:Effect, cond:Resolver<boolean>)=>{
        if(hasTarget(eff) && hasTarget(cond) && cond.target === resolvePlayerContextually){
            cond.target = eff.target;
            eff.target = resolvePlayerContextually;
        }
        return new ConditionalEffect(eff,cond)
    };
    new TextTemplate('Eff', '%Eff, if %Cond', reversedConditionalFactory);
    new TextTemplate('Eff', '%Eff if %Cond', reversedConditionalFactory);
    new TextTemplate('Eff', 'If %Cond, %Eff', (cond:Resolver<boolean>, eff:Effect)=>new ConditionalEffect(eff,cond));
}