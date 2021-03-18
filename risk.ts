import {
    Game,
    GameStatus,
    InputStrategy,
    MCTSStrategy,
    MoveFromGame,
    RandomStrategy,
    StateFromGame,
    Strategy
} from "./mcts";
import chalk from 'chalk';
import _ from 'lodash'

type coord = {x:number, y:number}
interface RiskState {
    activePlayer: 1|2,
   // step: 'attack'|'fortify'
    ownership: (1|2|0)[][],
    spareTroops: number[][],
}
type RiskMovementMove =  {type:"move", from:coord, to:coord, n:number}

type RiskMove = RiskMovementMove | {type: 'end'};

const DIRS = [
    {x: 1, y:0},
    {x: -1, y:0},
    {x: 0, y:1},
    {x: 0, y:-1},
]

export class RiskGame implements Game<RiskState, RiskMove>{
    applyMove(state: RiskState, move: RiskMove): RiskState {
        if(move.type === 'end'){
            const nextPlayer = state.activePlayer === 1 ? 2 : 1;
            const spareTroops = state.spareTroops.map(row=>[...row]);
            if(state.ownership[0][0] === nextPlayer && spareTroops[0][0] < 9){
                spareTroops[0][0]++;
            }
            if(state.ownership[3][3] === nextPlayer && spareTroops[3][3] < 9){
                spareTroops[3][3]++;
            }
            return {
                activePlayer: nextPlayer,
                ownership: state.ownership.map(row=>[...row]),
                spareTroops,
            }
        }
        if(move.type == 'move'){
            const targetOwner = state.ownership[move.to.x][move.to.y];
            if(targetOwner === state.activePlayer){
                const ownership = state.ownership.map(row=>[...row]);
                const spareTroops = state.spareTroops.map(row=>[...row]);
                spareTroops[move.to.x][move.to.y] += move.n;
                spareTroops[move.from.x][move.from.y] -= move.n;
                return {
                    activePlayer: state.activePlayer,
                    ownership,
                    spareTroops
                }
            }else{
                const ownership = state.ownership.map(row=>[...row]);
                const spareTroops = state.spareTroops.map(row=>[...row]);
                ownership[move.to.x][move.to.y]=state.activePlayer;
                spareTroops[move.to.x][move.to.y]+=(move.n - 1);
                spareTroops[move.from.x][move.from.y]-=move.n;
                return {
                    activePlayer: state.activePlayer,
                    ownership,
                    spareTroops
                }
            }

        }
        throw new Error('Unknown move type')
    }

    getSensibleMoves(state: RiskState): RiskMove[] {
        return this.getValidMoves(state);
    }

    getStatus(state: RiskState): GameStatus {
        const p1HasPieces = state.ownership.find(row=>row.find(owner=>owner==1)) !== undefined;
        const p2HasPieces = state.ownership.find(row=>row.find(owner=>owner==2)) !== undefined;
        if(p1HasPieces && p2HasPieces) return GameStatus.IN_PLAY;
        if(p1HasPieces && !p2HasPieces) return GameStatus.WIN;
        if(!p1HasPieces && p2HasPieces) return GameStatus.LOSE;
        return GameStatus.DRAW;
    }

    getCoords(state:RiskState){
        const coords = []
          for(let y = 0; y < state.ownership[0].length; y++) {
              for (let x = 0; x < state.ownership.length; x++) {
                    coords.push({x,y})
              }
          }
          return coords;
    }

    getValidMoves(state: RiskState): RiskMove[] {
        return [{
            type: "end"
        }, ...this.getValidMovementMoves(state)]
    }

    getValidMovementMoves(state: RiskState):RiskMovementMove[] {
        const ownedTiles = this.getCoords(state).filter(coord=>state.ownership[coord.x][coord.y] === state.activePlayer);
        const withTroops = ownedTiles.filter(coord=>state.spareTroops[coord.x][coord.y] > 0);
        const possibleMovements:RiskMovementMove[] = _.flatMap(withTroops, from=>{
            return DIRS.map(dir=>({
                type: "move",
                from,
                to: {x:from.x+dir.x, y:from.y+dir.y},
                n:1
            }))
        })
        const validMovements = possibleMovements.filter(({to})=>to.x>=0 && to.x < state.ownership.length && to.y>=0 && to.y < state.ownership[to.x].length)
        return validMovements;
    }

    newGame(): RiskState {
        return {
            activePlayer: 1,
            ownership: [
                [1,0,0,0],
                [0,0,0,0],
                [0,0,0,0],
                [0,0,0,2],
            ],
            spareTroops:[
                [3,0,0,0],
                [0,0,0,0],
                [0,0,0,0],
                [0,0,0,3]
            ]
        }
    }

    print(state: RiskState): void {
        const playerColors = {
            0: chalk.white,
            1: chalk.blue,
            2: chalk.red
        };

        let str = playerColors[state.activePlayer](state.activePlayer+"'s turn\n")
        for(let y = 0; y < state.ownership[0].length; y++){
            for(let x = 0; x < state.ownership.length; x++){
                const owner = state.ownership[x][y];
                const color = playerColors[owner];

                str += color(`${state.ownership[x][y] !== 0 ? state.spareTroops[x][y] + 1 : '.'} `)
            }
            str += '\n'
        }
        str += '\n'
        console.log(str)
    }
}

export function main(){
    const game = new RiskGame();
    const p1Strat:Strategy<StateFromGame<typeof game>, MoveFromGame<typeof game>> = new RandomStrategy()
    const p2Strat:Strategy<StateFromGame<typeof game>,  MoveFromGame<typeof game>> = new MCTSStrategy();

    const wins:Record<GameStatus, number> = {
        [GameStatus.WIN]: 0,
        [GameStatus.LOSE]: 0,
        [GameStatus.DRAW]: 0,
        [GameStatus.IN_PLAY]: 0,
    };
    for(let i = 0; i < 300; i++) {
        const max_len = 1000;
        let moves = 0;
        let state = game.newGame()
        try {
            while (game.getStatus(state) === GameStatus.IN_PLAY && moves++ < max_len) {
                const activeStrat = state.activePlayer === 1 ? p1Strat : p2Strat;
                const move = activeStrat.pickMove(game, state);
                state = game.applyMove(state, move);
                game.print(state)
            }
            const status = game.getStatus(state);
            wins[status] += 1
        } catch (e) {
            wins[GameStatus.IN_PLAY] += 1
            console.error(e)
            if(e.message.includes('No valid moves')){
            }else{
                break
            }
        }
        //game.print(state)
        console.log(wins)
    }
}
main();