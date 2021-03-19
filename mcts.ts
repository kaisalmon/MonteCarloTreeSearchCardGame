import _ from 'lodash';
import promptSync from 'prompt-sync'
import {RiskGame} from "./risk";
import {ConnectFourGame} from "./ConnectFour";
import chalk from "chalk";
const prompt = promptSync();

export enum GameStatus{
    IN_PLAY='IN_PLAY',
    LOSE='LOSE',
    WIN='WIN',
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

    constructor(samples=60, depth=100,simulationStrategy:Strategy<STATE, T> = new RandomStrategy()) {
        this.simulationStrategy = simulationStrategy;
        this.depth = depth;
        this.samples = samples;
    }

    pickMove(game:Game<STATE, T>, state: STATE): T {
        const evaluations = game.getValidMoves(state).map(move=>({move, score:0, outOf:0, length: 0}));
        if(evaluations.length === 0) throw new Error('No valid moves')
        const playerGoal = getPlayerGoal(state.activePlayer);
        for(let i = 0; i < this.samples; i++){
            evaluations.forEach(evaluation=>{
                const newState = game.applyMove(state, evaluation.move);
                const simulation = this.simulateGame(game, newState) ;
                evaluation.outOf++;
                if(simulation.status === playerGoal){
                    evaluation.score++;
                }else if(simulation.status !== GameStatus.DRAW && simulation.status !== GameStatus.IN_PLAY){
                    evaluation.score--;
                }
                evaluation.length += simulation.length;
            })
        }
        const allEqual = _.every(evaluations, evaluation=>evaluation.score > evaluations[0].score*0.99 && evaluation.score < evaluations[0].score * 1.01);
        if(allEqual && evaluations[0].score > 0.99 * evaluations[0].outOf) {
            const result = _.minBy(evaluations, 'length')!
            this.mood = JSON.stringify({
                score: 1,
                minimizing: 'Length until victory',
                length: (result.length / result.outOf).toFixed(2)
            })
            return result.move;
        }else if(allEqual && evaluations[0].score < -0.99 * evaluations[0].outOf){
            const result =  _.maxBy(evaluations, 'length')!
            this.mood = JSON.stringify({score: -1, maximizing:'Length until victory', length:(result.length/result.outOf).toFixed(2)})
            return result.move;
        }else{
            const result =  _.maxBy(evaluations, 'score')!
            this.mood = JSON.stringify({score: (result.score/result.outOf).toFixed(3), length:(result.length/result.outOf).toFixed(2)})
            return  result.move;
        }
    }
    simulateGame(game:Game<STATE, T>, state:STATE):{status:GameStatus, length:number}{
        let curState = state;
        for(let i = 0; i < this.depth; i++){
            const status = game.getStatus(curState);
            if(status !== GameStatus.IN_PLAY) return {status, length: i};
            try{
                const move = this.simulationStrategy.pickMove(game, curState);
                if(!move) return {status: GameStatus.DRAW, length: i};
                curState = game.applyMove(curState, move);
            }catch(e){
                if(e.message.includes('No valid move')) return {status: GameStatus.IN_PLAY, length: i};
                throw e;
            }
        }
        return {status: GameStatus.IN_PLAY, length: this.depth};
    }
}

export function main(){
    const game = new RiskGame();
    const p1Strat:Strategy<StateFromGame<typeof game>, MoveFromGame<typeof game>> = new MCTSStrategy(10,500)
    const p2Strat:Strategy<StateFromGame<typeof game>,  MoveFromGame<typeof game>> = new MCTSStrategy(200,100);

    const wins:Record<GameStatus, number> = {
        [GameStatus.WIN]: 0,
        [GameStatus.LOSE]: 0,
        [GameStatus.DRAW]: 0,
        [GameStatus.IN_PLAY]: 0,
    };
    for(let i = 0; i < 100; i++) {
        const max_len = 1000;
        let moves = 0;
        let state = game.newGame()
        try {
            while (game.getStatus(state) === GameStatus.IN_PLAY && moves++ < max_len) {
                const activeStrat = state.activePlayer === 1 ? p1Strat : p2Strat;
                const move = activeStrat.pickMove(game, state);
                state = game.applyMove(state, move);
                console.log({p1:p1Strat.mood, p2:p2Strat.mood})
                game.print(state)
                console.log(wins)
            }
            const status = game.getStatus(state);
            wins[status] += 1
        } catch (e) {
            wins[GameStatus.IN_PLAY] += 1
            console.error(e)
            if(e.message.includes('No valid moves')){
            }else{
                throw e
            }
        }
        //game.print(state)
        console.log(wins)
    }
}
main();