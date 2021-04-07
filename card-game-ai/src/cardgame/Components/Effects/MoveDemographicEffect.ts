import TextTemplate, {Effect, ExecutionContext, PlayerTarget, ResolveConstant, Resolver} from "../TextTemplate";
import CardGame, {CardGamePlayerState, CardGameState} from "../../CardGame";
import {MovePlayerTowardsPointEffect} from "./MovePlayerEffect";
import {ContextualExtreme} from "../ChoiceActions/ContextualExtreme";

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
}
export class MoveDemographicTowardsPointEffect extends MoveDemographicEffect{
    point:Resolver<{x:number, y:number}>
    stepSize:number;
    constructor(demos:Resolver<number[]>, point:Resolver<{x:number, y:number}>,stepSize:number) {
        super(demos);
        this.point = point;
        this.stepSize = stepSize;
    }

    shift(pos: { x: number; y: number }, state:CardGameState, ctx: ExecutionContext, game: CardGame): { x: number; y: number } {
        return MovePlayerTowardsPointEffect.shiftTowardsPoint(this.point, this.stepSize, pos, state, ctx, game);
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

class resolveQuadrantDemographics implements Resolver<number[]>{
    point:Resolver<{x:number, y:number}>
    constructor(point:Resolver<{x:number, y:number}>) {
        this.point = point
    }
    resolveValue(state: CardGameState, ctx: ExecutionContext, game:CardGame){
        const {x,y} = this.point.resolveValue(state, ctx, game);
        return state.demographics
            .map((demo,i)=>({demo, i}))
            .filter(({demo})=> Math.sign(x)===Math.sign(demo.x) && Math.sign(y)===Math.sign(demo.y))
            .map(({i})=>i)
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
    new TextTemplate('Demos', 'All demographics', () => new resolveAllDemographics());
    new TextTemplate('Demos', '%Player followers', (playerTarget:PlayerTarget) => new resolveFollowers(playerTarget));
    new TextTemplate('Demos', 'undecided voters', () => new resolveUndecided());
    new TextTemplate('Demos', `(?:all) demographics in that quadrant`, () => new resolveQuadrantDemographics(new ContextualExtreme()));


    Object.entries(EXTREMES).forEach(([extreme, position]) => {
        new TextTemplate('Position', `the ${extreme} extreme`, () => new ResolveConstant(position, 'lastExtreme'));
        new TextTemplate('Demos', `demographics in the ${extreme} quadrant`, () => new resolveQuadrantDemographics(new ResolveConstant(position, 'lastExtreme')))
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