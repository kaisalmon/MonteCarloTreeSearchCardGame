import TextTemplate, {Effect, ExecutionContext, PlayerTarget, Resolver} from "../TextTemplate";
import CardGame, {CardGamePlayerState, CardGameState} from "../../CardGame";
import {PlayerKey} from "../../Card";

export class PlayerInQuadrantCondition implements Resolver<boolean>{
    target:PlayerTarget;
    extreme: Resolver<{x:number, y:number}>;
    constructor(target:PlayerTarget, extreme: Resolver<{x:number, y:number}>) {
        this.target = target;
        this.extreme = extreme;
    }
    resolveValue(state: CardGameState, ctx: ExecutionContext, game:CardGame){
        const quad = this.extreme.resolveValue(state, ctx, game);
        const playerKey = this.target.resolveValue(state, ctx, game);
        const {position} = state[playerKey];
        return Math.sign(position.x) === Math.sign(quad.x) && Math.sign(position.y) === Math.sign(quad.y)
    }
}

export default function setupPlayerPositionCondition(){
    new TextTemplate(
        'Cond',
        '%Player (?:is|are) in %Position',
        (target:PlayerTarget, pos:Resolver<{x:number, y:number}>) => new PlayerInQuadrantCondition(target, pos)
    );
}