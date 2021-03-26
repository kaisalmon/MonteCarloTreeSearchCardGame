import _ from 'lodash';
import promptSync from 'prompt-sync'
const prompt = promptSync();

export enum GameStatus{
    IN_PLAY='IN_PLAY',
    LOSE='RED_WIN',
    WIN='BLUE_WIN',
    DRAW='DRAW'
}

const getPlayerGoal = (player:1|2) => player === 1 ? GameStatus.WIN : GameStatus.LOSE;

interface GameState{
    activePlayer: 1|2,
}

export interface Game<STATE extends GameState, T>{
    newGame():STATE;
     getValidMoves(state:STATE):T[];
     print(state:STATE):void;
     getSensibleMoves(state:STATE):T[];
     randomizeHiddenInfo(state:STATE):STATE;
     applyMove(state:STATE, move:T):STATE;
     getStatus(state:STATE):GameStatus;
}

export interface Strategy<STATE extends GameState, T>{
    mood: string;
    pickMove(game:Game<STATE,T>, state:STATE):T;
}

export type StateFromGame<G> = G extends Game<infer U,any> ?  U : never;
export type MoveFromGame<G> = G extends Game<any, infer U> ?  U : never;

export class RandomStrategy<STATE extends GameState, T> implements Strategy<STATE, T>{
    mood = "none";
    pickMove(game:Game<STATE, T>, state: STATE): T {
        const sensibleMove = _.sample(game.getSensibleMoves(state))
        if (sensibleMove){
            this.mood = "Sensible"
            return sensibleMove;
        }else{
            this.mood = "Not Sensible"
        }
        const validMove = _.sample(game.getValidMoves(state))
        if (validMove) {
            return validMove;
        }
        throw new Error('No valid moves')
    }
}

export class InputStrategy<STATE extends GameState, T> implements Strategy<STATE, T> {
    mood="player"
    transform:(str:string)=>T;
    constructor(transform:(str:string)=>T) {
        this.transform = transform;
    }

    pickMove(game: Game<STATE, T>, state: STATE): T {
        game.print(state);
        return this.transform(prompt("What's your move?"))
    }

}
export class GreedyStrategy<STATE extends GameState, T> extends RandomStrategy<STATE, T> {
    mood = "greedy"
    pickMove(game: Game<STATE, T>, state: STATE): T {
        const playerGoal = getPlayerGoal(state.activePlayer);
        const winningMove = game.getValidMoves(state).find(move=>game.getStatus(game.applyMove(state,move)) === playerGoal)
        if(winningMove) {
            return winningMove;
        }
        return super.pickMove(game, state);
    }
}

export class MCTSStrategy<STATE extends GameState, T>implements Strategy<STATE, T>{
    mood = "waiting..."
    simulationStrategy: Strategy<STATE, T>;
    samples:number;
    depth:number;
    inPlayHeuristic:(state:STATE)=>number;

    pruningThreshold?:number=undefined;

    constructor(samples=60, depth=100, inPlayHeuristic: (state:STATE)=>number = ()=>0, simulationStrategy:Strategy<STATE, T> = new RandomStrategy()) {
        this.simulationStrategy = simulationStrategy;
        this.depth = depth;
        this.samples = samples;
        this.inPlayHeuristic = inPlayHeuristic;
    }

    pickMove(game:Game<STATE, T>, state: STATE): T {
        let evaluations = game.getValidMoves(state).map(move=>({move, score:0, outOf:0, depth: 0,unfinished:0}));
        if(evaluations.length === 0) throw new Error('No valid moves')
        const playerGoal = getPlayerGoal(state.activePlayer);
        const iterations = Math.ceil(this.samples/evaluations.length);
        for(let i = 0; i < iterations; i++){
            evaluations.forEach(evaluation=>{
                const stateWithScrambledUnknowns = game.randomizeHiddenInfo(state);
                const newState = game.applyMove(stateWithScrambledUnknowns, evaluation.move);
                const simulation = this.simulateGame(game, newState) ;
                evaluation.outOf++;
                if(simulation.status === playerGoal){
                    evaluation.score++;
                }else if(simulation.status !== GameStatus.DRAW && simulation.status !== GameStatus.IN_PLAY){
                    evaluation.score--;
                }else if(simulation.heuristic !== undefined){
                    const desire = state.activePlayer === 1 ? 1 : -1;
                    evaluation.score += simulation.heuristic * desire ;
                    evaluation.unfinished++;
                }
                evaluation.depth += simulation.length;
            })
            if(this.pruningThreshold !== undefined && i % 10 == 9){
                 const highestEval =  _.maxBy(evaluations, 'score')!;
                 const highestScore = (highestEval.score / highestEval.outOf)/2 + 0.5; //Rescaled to 0 - 1
                 const maxDifference = this.pruningThreshold * 1/Math.pow(i,0.3);
                 evaluations = evaluations.filter(evaluation=> {
                    const score = (evaluation.score/evaluation.outOf)/2 + 0.5; //Rescaled to 0 - 1
                    const difference = highestScore - score;
                    return difference <= maxDifference;
                 });
            }
            if(evaluations.length === 1){
                break;
            }
        }
        const highestEval =  _.maxBy(evaluations, 'score')!;
        const highestScore = highestEval.score / highestEval.outOf
        const bestMoves = evaluations.filter(({score,outOf})=>(score/outOf) > highestScore - 0.01)

        if(highestScore > 0.9) {
            const result = _.minBy(bestMoves, 'depth')!
            this.mood = JSON.stringify({
                score: (result.score/result.outOf).toFixed(2),
                goal: 'Minimizing Length to Victory',
                depth: (result.depth / result.outOf).toFixed(2),
                unfinished: (result.unfinished / result.outOf).toFixed(2)
            })
            return result.move;
        }else if(highestScore < -0.9){
            const result = _.maxBy(bestMoves, 'depth')!
            this.mood = JSON.stringify({
                score: (result.score/result.outOf).toFixed(2),
                goal: 'Delaying time till loss',
                depth: (result.depth / result.outOf).toFixed(2),
                unfinished: (result.unfinished / result.outOf).toFixed(2)
            })
            return result.move;
        }else{
            const result =  _.maxBy(bestMoves, 'score')!
            this.mood = JSON.stringify({
                score: (result.score / result.outOf).toFixed(3),
                depth: (result.depth / result.outOf).toFixed(2),
                unfinished: (result.unfinished / result.outOf).toFixed(2)
            })
            return  result.move;
        }
    }
    simulateGame(game:Game<STATE, T>, state:STATE):{status:GameStatus, length:number, heuristic?:number}{
        let curState = state;
        for(let i = 0; i < this.depth; i++){
            const status = game.getStatus(curState);
            if(status !== GameStatus.IN_PLAY) return {status, length: i};
            try{
                const move = this.simulationStrategy.pickMove(game, curState);
                if(!move) return {status: GameStatus.DRAW, length: i};
                curState = game.applyMove(curState, move);
            }catch(e){
                if(e.message.includes('No valid move')) return {status: GameStatus.DRAW, length: i};
                throw e;
            }
        }
        return {status: GameStatus.IN_PLAY, length: this.depth, heuristic: this.inPlayHeuristic(curState)};
    }
}

