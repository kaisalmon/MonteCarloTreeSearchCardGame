import _ from 'lodash';
import promptSync from 'prompt-sync'
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
     pickMove(game:Game<STATE,T>, state:STATE):T;
}

export type StateFromGame<G> = G extends Game<infer U,any> ?  U : never;
export type MoveFromGame<G> = G extends Game<any, infer U> ?  U : never;

export class RandomStrategy<STATE extends GameState, T> implements Strategy<STATE, T>{
    pickMove(game:Game<STATE, T>, state: STATE): T {
        const sensibleMove = _.sample(game.getSensibleMoves(state))
        if (sensibleMove) return sensibleMove;
        const validMove = _.sample(game.getValidMoves(state))
        if (validMove) {
            return validMove;
        }
        throw new Error('No valid moves')
    }
}

export class InputStrategy<STATE extends GameState, T> implements Strategy<STATE, T> {
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
    simulationStrategy: Strategy<STATE, T>;

    constructor(simulationStrategy:Strategy<STATE, T> = new RandomStrategy()) {
        this.simulationStrategy = simulationStrategy;
    }

    pickMove(game:Game<STATE, T>, state: STATE): T {
        const N = 100;
        const evaluations = game.getValidMoves(state).map(move=>({move, score:0, outOf:0}));
        if(evaluations.length === 0) throw new Error('No valid moves')
        const playerGoal = getPlayerGoal(state.activePlayer);
        for(let i = 0; i < N; i++){
            evaluations.forEach(evaluation=>{
                const newState = game.applyMove(state, evaluation.move);
                evaluation.outOf++;
                evaluation.score += this.simulateGame(game, newState) === playerGoal ? 1 : -1;
            })
        }
        return _.maxBy(evaluations, 'score')!.move;
    }
    simulateGame(game:Game<STATE, T>, state:STATE):GameStatus{
        const MAX_LEN = 100;
        let curState = state;
        for(let i = 0; i < MAX_LEN; i++){
            const status = game.getStatus(curState);
            if(status !== GameStatus.IN_PLAY) return status;
            try{
                const move = this.simulationStrategy.pickMove(game, curState);
                if(!move) return GameStatus.DRAW;
                curState = game.applyMove(curState, move);
            }catch(e){
                if(e.message.includes('No valid move')) return GameStatus.IN_PLAY;
                throw e;
            }
        }
        return GameStatus.IN_PLAY;
    }
}

type ConnectFourMove = {col:number}
type ConnectFourState = {activePlayer: 1|2, rows:(1|2|undefined)[][]}
class ConnectFourGame implements Game<ConnectFourState, ConnectFourMove> {
    applyMove(state: ConnectFourState, move: ConnectFourMove): ConnectFourState {
        const newRows = _.cloneDeep(state.rows);
        newRows[move.col].push(state.activePlayer)
        return {
            activePlayer: state.activePlayer === 1 ? 2 : 1,
            rows: newRows
        }
    }

    getSensibleMoves(state: ConnectFourState): ConnectFourMove[] {
        return this.getValidMoves(state)
    }

    getStatus(state: ConnectFourState): GameStatus {
        const highestCol = _.maxBy(state.rows, row=>row.length)!.length
        for(let x = 0; x < state.rows.length; x++){
            for(let y = 0; y < highestCol-1; y++){
                const statusFromThisCoord = this.getStatusFromCoords(state, x,y);
                if(statusFromThisCoord) return  statusFromThisCoord;
            }
        }
        return GameStatus.IN_PLAY;
    }

    getStatusFromCoords(state: ConnectFourState, x:number, y:number): GameStatus|undefined{
        return this.getStatusFromCoordsHoz(state, x, y)
            || this.getStatusFromCoordsVert(state, x, y)
          || this.getStatusFromCoordsDiagDown(state, x, y)
          || this.getStatusFromCoordsDiagUp(state, x, y)
    }

    getStatusFromCoordsHoz(state: ConnectFourState, x:number, y:number): GameStatus|undefined{
        const player = state.rows[x][y]
        if(player===undefined) return undefined;
        if(x<state.rows.length - 4) {
            if (state.rows[x + 1][y] !== player) return undefined;
            if (state.rows[x + 2][y] !== player) return undefined;
            if (state.rows[x + 3][y] !== player) return undefined;
            return player === 1 ? GameStatus.WIN : GameStatus.LOSE;
        }
    }

    getStatusFromCoordsVert(state: ConnectFourState, x:number, y:number): GameStatus|undefined{
        const player = state.rows[x][y]
        if(player===undefined) return undefined;
        if(state.rows[x][y+1]!==player) return undefined;
        if(state.rows[x][y+2]!==player) return undefined;
        if(state.rows[x][y+3]!==player) return undefined;
        return player === 1 ? GameStatus.WIN : GameStatus.LOSE;
    }

    getStatusFromCoordsDiagDown(state: ConnectFourState, x:number, y:number): GameStatus|undefined{
        const player = state.rows[x][y]
        if(player===undefined) return undefined;
        if(x<state.rows.length - 4) {
            if (state.rows[x + 1][y - 1] !== player) return undefined;
            if (state.rows[x + 2][y - 2] !== player) return undefined;
            if (state.rows[x + 3][y - 3] !== player) return undefined;
            return player === 1 ? GameStatus.WIN : GameStatus.LOSE;
        }
    }

    getStatusFromCoordsDiagUp(state: ConnectFourState, x:number, y:number): GameStatus|undefined{
        const player = state.rows[x][y]
        if(player===undefined) return undefined;
        if(x<state.rows.length - 4) {
            if (state.rows[x + 1][y + 1] !== player) return undefined;
            if (state.rows[x + 2][y + 2] !== player) return undefined;
            if (state.rows[x + 3][y + 3] !== player) return undefined;
            return player === 1 ? GameStatus.WIN : GameStatus.LOSE;
        }
    }

    getValidMoves(state: ConnectFourState): ConnectFourMove[] {
        return state.rows
            .map((row, index)=>({col:index}))
            .filter(({col})=>(state.rows[col].length < 7));

    }

    newGame(): ConnectFourState {
        return {
            activePlayer: 1,
            rows:[
                [],
                [],
                [],
                [],
                [],
                [],
                []
            ]
        };
    }

    print(state:ConnectFourState){
        console.log(state.rows.map((row, i)=>i+'|'+row.join(' ')).join('\n')+'\n--')
    }

}

