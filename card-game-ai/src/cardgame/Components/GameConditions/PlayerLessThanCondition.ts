import TextTemplate, {Effect, ExecutionContext, PlayerTarget, Resolver} from "../TextTemplate";
import {CardGamePlayerState, CardGameState} from "../../CardGame";
import {PlayerKey} from "../../Card";

export class PlayerLessThanCondition implements Resolver<boolean>{
    target:PlayerTarget
    n:number
    mapping:(target:CardGamePlayerState)=>number
    constructor(target:PlayerTarget, n:number, mapping:(target:CardGamePlayerState)=>number) {
        this.target = target;
        this.n = n;
        this.mapping = mapping;
    }
    resolveValue(state: CardGameState, ctx: ExecutionContext){
        const targetKey = this.target.resolveValue(state, ctx);
        const player = state[targetKey];
        return this.mapping(player) < this.n;
    }
}

export default function setup(){
    new TextTemplate(
        'Cond',
        '%Player\\s?(?:has|have) less than %N cards in (?:their|your) hand',
        (target:PlayerTarget, n:number) => new PlayerLessThanCondition(target, n, player=>player.hand.length)
    );
    new TextTemplate(
        'Cond',
        '%Player\\s?(?:has|have) less than %N health',
        (target:PlayerTarget, n:number) => new PlayerLessThanCondition(target, n, player=>player.health)
    );
}