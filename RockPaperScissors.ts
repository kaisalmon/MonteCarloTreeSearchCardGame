import {Game, GameStatus} from "./mcts";
import chalk from "chalk";
import _ from 'lodash';

type RPSMove = 'rock'|'paper'|'scissors'

type RPSState = {
    activePlayer: 1|2,
    blueMove?: RPSMove,
    redMove?: RPSMove
}

export class RockPaperScissorsGame implements Game<RPSState, RPSMove>{
    applyMove(state: RPSState, move: RPSMove): RPSState {
        return {
            ...state,
            activePlayer: state.activePlayer === 1 ? 2 : 1,
            [state.activePlayer === 1 ? 'blueMove' : 'redMove']: move,
        }
    }

    getSensibleMoves(state: RPSState): RPSMove[] {
        return ['rock', 'paper', 'scissors'];
    }

    getStatus(state: RPSState): GameStatus {
        if(state.blueMove === undefined || state.redMove === undefined) return GameStatus.IN_PLAY;
        if(state.blueMove === state.redMove) return GameStatus.DRAW;
        if(state.blueMove === 'rock' && state.redMove==='scissors') return GameStatus.WIN;
        if(state.blueMove === 'scissors' && state.redMove==='paper') return GameStatus.WIN;
        if(state.blueMove === 'paper' && state.redMove==='rock') return GameStatus.WIN;
        return GameStatus.LOSE;
    }

    getValidMoves(state: RPSState): RPSMove[] {
        return ['rock', 'paper', 'scissors'];
    }

    newGame(): RPSState {
        return {activePlayer:1}
    }

    print(state: RPSState): void {
        console.log(chalk.blue(state.blueMove), chalk.red(state.redMove))
    }

    randomizeHiddenInfo(state: RPSState): RPSState{
        let overrides:Partial<RPSState> = {};
        if(state.activePlayer === 2){
            if(state.blueMove !== undefined){
                overrides = {
                    blueMove: _.sample(['rock', 'paper', 'scissors'])
                }
            }
        }
        return {
            ...state,
            ...overrides,
        };
    }

}