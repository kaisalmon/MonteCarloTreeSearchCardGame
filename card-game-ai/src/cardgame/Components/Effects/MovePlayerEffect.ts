import TextTemplate, {Effect, ExecutionContext, PlayerTarget, ResolveConstant, Resolver} from "../TextTemplate";
import CardGame, {CardGamePlayerState, CardGameState} from "../../CardGame";
import {Icon, PlayerKey} from "../../Card";
import {MoveDemographicEffect} from "./MoveDemographicEffect";

type KeysMatching<T, V> = {[K in keyof T]-?: T[K] extends V ? K : never}[keyof T];
export abstract class MovePlayerEffect extends Effect{
    target:PlayerTarget
    protected constructor(target:PlayerTarget) {
        super();
        this.target=target;
    }

    abstract shift(pos:{x:number, y:number},state:CardGameState, ctx:ExecutionContext, game:CardGame): {x:number, y: number};
    abstract getIcon(): Icon;

    applyEffect(state: CardGameState, ctx:ExecutionContext, game:CardGame): CardGameState {
        const playerKey = this.target.resolveValue(state, ctx, game);

        return   {
            ...state,
            [playerKey]: {
                ...state[playerKey],
                position: this.shift(state[playerKey].position, state, ctx, game)
            }
        }
    }
}
const MIN_DISTANCE = 0.01;
export class MovePlayerTowardsPointEffect extends MovePlayerEffect{
    point:Resolver<{x:number, y:number}>
    stepSize:number;
    constructor(target:PlayerTarget, point:Resolver<{x:number, y:number}>,stepSize:number) {
        super(target);
        this.point = point;
        this.stepSize = stepSize;
    }
     static shiftTowardsPoint(point:Resolver<{x:number, y:number}>, stepSize: number, pos: { x: number; y: number }, state:CardGameState, ctx: ExecutionContext, game: CardGame): { x: number; y: number } {
        const target = point.resolveValue(state, ctx, game)
        const deltaX = target.x - pos.x;
        const deltaY = target.y - pos.y;
        const deltaMag = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
        const clampedStepSize = stepSize > 0 ? Math.min(deltaMag - MIN_DISTANCE, stepSize) : stepSize;
        const clamp = (n:number)=>Math.max(-1, Math.min(1, n));
        return {
            x: clamp(pos.x + deltaX/deltaMag * clampedStepSize),
            y: clamp(pos.y + deltaY/deltaMag * clampedStepSize),
        }
    }
    shift(pos: { x: number; y: number }, state:CardGameState, ctx: ExecutionContext, game: CardGame): { x: number; y: number } {
        return MovePlayerTowardsPointEffect.shiftTowardsPoint(this.point, this.stepSize, pos, state, ctx, game);
    }
    getIcon(): Icon{
        return {
            icon: 'move',
            modifier: MoveDemographicEffect.getIconModiferFromPoint(this.point)
        }
    }

}
export function setupMovePlayer(){
    new TextTemplate('Eff',
        '%Player shift towards %Position',
        (playerTarget:PlayerTarget, point:Resolver<{x:number, y:number}>)=>new MovePlayerTowardsPointEffect(playerTarget, point, 2/21));
    new TextTemplate('Eff',
        '%Player shift away from %Position',
        (playerTarget:PlayerTarget, point:Resolver<{x:number, y:number}>)=>new MovePlayerTowardsPointEffect(playerTarget, point, -2/21));

}