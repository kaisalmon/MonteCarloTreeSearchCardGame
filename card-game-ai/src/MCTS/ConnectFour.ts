import _ from "lodash";
import {Game, GameStatus} from "./mcts";

export type ConnectFourMove = {col:number}
export type ConnectFourState = {activePlayer: 1|2, rows:readonly (readonly(1|2|undefined)[])[]}
export class ConnectFourGame implements Game<ConnectFourState, ConnectFourMove> {
    applyMove(state: ConnectFourState, move: ConnectFourMove): ConnectFourState {
        const newRows = state.rows.map(row=>[...row]);
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
            activePlayer: Math.random() > 0.5 ? 1 : 2,
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

    randomizeHiddenInfo(state: ConnectFourState): ConnectFourState {
        return state;
    }

}

