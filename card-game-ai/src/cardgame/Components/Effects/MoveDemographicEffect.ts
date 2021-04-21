import TextTemplate, {Effect, ExecutionContext, PlayerTarget, ResolveConstant, Resolver} from "../TextTemplate";
import CardGame, {CardGamePlayerState, CardGameState} from "../../CardGame";
import {MovePlayerTowardsPointEffect} from "./MovePlayerEffect";
import {ContextualExtreme} from "../ChoiceActions/ContextualExtreme";
import _ from 'lodash'
import {Icon, IconModifier} from "../../Card";

export type Point = {x:number, y:number};
export const EXTREMES = {
    hearts: {x:1, y:-1},
    clubs: {x:-1, y:-1},
    diamonds: {x:1, y:1},
    spades: {x:-1, y:1},
}

export abstract class MoveDemographicEffect extends Effect{
    demos:Resolver<number[]>
    protected constructor(demos:Resolver<number[]>) {
        super();
        this.demos=demos;
    }

    abstract shift(pos:{x:number, y:number},state:CardGameState, ctx:ExecutionContext, game:CardGame): {x:number, y: number};
    abstract getIcon(): Icon;

    applyEffect(state: CardGameState, ctx:ExecutionContext, game:CardGame): CardGameState {
        const indexes = this.demos.resolveValue(state, ctx, game);

        return   {
            ...state,
            demographics: state.demographics.map((demo, i)=>indexes.includes(i)
                ? this.shift(demo, state, ctx, game)
                : demo
            )
        }
    }

    static getIconModiferFromPoint(pointResolver: Resolver<Point>): IconModifier|undefined {
        if(!ResolveConstant.is(pointResolver)){
            return undefined;
        }
        return pointResolver.value === EXTREMES.clubs ? 'clubs' :
            pointResolver.value === EXTREMES.hearts ? 'hearts' :
            pointResolver.value === EXTREMES.diamonds ? 'diamonds' :
            pointResolver.value === EXTREMES.spades ? 'spades' :
            undefined;
    }
}
export class MoveDemographicTowardsPointEffect extends MoveDemographicEffect{
    point:Resolver<Point>;
    stepSize:number;
    constructor(demos:Resolver<number[]>, point:Resolver<{x:number, y:number}>,stepSize:number) {
        super(demos);
        this.point = point;
        this.stepSize = stepSize;
    }

    shift(pos: { x: number; y: number }, state:CardGameState, ctx: ExecutionContext, game: CardGame): { x: number; y: number } {
        return MovePlayerTowardsPointEffect.shiftTowardsPoint(this.point, this.stepSize, pos, state, ctx, game);
    }

    getIcon(): Icon {
        const icon = this.stepSize < 0 ? 'expand' : 'contract';

        const modifier = MoveDemographicEffect.getIconModiferFromPoint(this.point);
        return {
            icon,
            modifier
        };
    }

}

class resolveAllDemographics implements Resolver<number[]>{
    resolveValue(state: CardGameState, ctx: ExecutionContext){
        return state.demographics.map((_,i)=>i);
    }
}

class resolveFollowers implements Resolver<number[]>{
    playerTarget: PlayerTarget
    constructor(playerTarget: PlayerTarget) {
        this.playerTarget = playerTarget;
    }

    resolveValue(state: CardGameState, ctx: ExecutionContext, game:CardGame){
        const target = this.playerTarget.resolveValue(state, ctx, game) === 'playerOne' ? 1 : 2;
        return state.demographics
            .map((demo,i)=>({demo, i}))
            .filter(({demo})=>game.getDemographicVote(state,demo) === target)
            .map(({i})=>i)
    }
}

class resolveUndecided implements Resolver<number[]>{
    resolveValue(state: CardGameState, ctx: ExecutionContext, game:CardGame){
        return state.demographics
            .map((demo,i)=>({demo, i}))
            .filter(({demo})=>game.getDemographicVote(state,demo) === undefined)
            .map(({i})=>i)
    }
}
class ListDemographic implements Resolver<number[]>{
    a:Resolver<number[]>;
    b:Resolver<number[]>;

    constructor(a:Resolver<number[]>, b:Resolver<number[]>) {
        this.a = a;
        this.b = b;
    }

    resolveValue(state: CardGameState, ctx: ExecutionContext, game:CardGame){
        const aDemos = this.a.resolveValue(state, ctx, game);
        const bDemos = this.b.resolveValue(state, ctx, game);
        return _.uniq([...aDemos, ...bDemos]);
    }
}
class resolveQuadrantDemographics implements Resolver<number[]>{
    point:Resolver<{x:number, y:number}>
    demos:Resolver<number[]>;

    constructor(demos: Resolver<number[]>, point: Resolver<{ x: number; y: number }>) {
        this.point = point;
        this.demos = demos
    }
    resolveValue(state: CardGameState, ctx: ExecutionContext, game:CardGame){
        const {x,y} = this.point.resolveValue(state, ctx, game);
        const inQuad = state.demographics
            .map((demo,i)=>({demo, i}))
            .filter(({demo})=> Math.sign(x)===Math.sign(demo.x) && Math.sign(y)===Math.sign(demo.y))
            .map(({i})=>i)
        const inSource = this.demos.resolveValue(state, ctx, game);
        return _.intersectionWith(inQuad, inSource);
    }
}

export class ResolvePlayerPosition implements Resolver<{x:number, y:number}>{
        playerTarget: PlayerTarget
    constructor(playerTarget: PlayerTarget) {
        this.playerTarget = playerTarget;
    }

  resolveValue(state: CardGameState, ctx: ExecutionContext, game:CardGame) {
    const target = this.playerTarget.resolveValue(state, ctx, game)
    return state[target].position;
  }
}

export function setupMoveDemographics(){
    new TextTemplate('Demos', '(?:All )demographics', () => new resolveAllDemographics());
    new TextTemplate('Demos', '%Player followers', (playerTarget:PlayerTarget) => new resolveFollowers(playerTarget));
    new TextTemplate('Demos', 'undecided voters', () => new resolveUndecided());
    new TextTemplate('Demos', `%Demos in that quadrant`, (demos:Resolver<number[]>) => new resolveQuadrantDemographics(demos, new ContextualExtreme()));
    new TextTemplate('Demos', '%Demos and %Demos', (a:Resolver<number[]>, b:Resolver<number[]>) => new ListDemographic(a,b));


    Object.entries(EXTREMES).forEach(([extreme, position]) => {
        new TextTemplate('Position', `the ${extreme} (?:extreme|quadrant)`, () => new ResolveConstant(position, 'lastExtreme'));
        new TextTemplate('Demos', `%Demos in the ${extreme} quadrant`, (demos:Resolver<number[]>) => new resolveQuadrantDemographics(demos, new ResolveConstant(position, 'lastExtreme')))
    });

    new TextTemplate('Position', 'the cente?re?', () => new ResolveConstant({x:0, y:0}));
    new TextTemplate('Position', '%Player', (playerTarget:PlayerTarget) => new ResolvePlayerPosition(playerTarget));

    new TextTemplate('Eff',
        '%Demos shift towards %Position',
        (demos:Resolver<number[]>, point:Resolver<{x:number, y:number}>)=>new MoveDemographicTowardsPointEffect(demos, point, 2/21));
    new TextTemplate('Eff',
        '%Demos shift away from %Position',
        (demos:Resolver<number[]>, point:Resolver<{x:number, y:number}>)=>new MoveDemographicTowardsPointEffect(demos, point, -2/21));

}