import {
    Game,
    GameStatus,
} from "./mcts";
import chalk from 'chalk';
import _ from 'lodash'

type Coord = {x:number, y:number}
interface RiskState {
    activePlayer: 1|2,
    troopsInHand: number,
   // step: 'attack'|'fortify'
    ownership: (1|2|0)[][],
    reinforcements: number[][],
    eventLog?:string[],
}
type RiskReinforceMove =  {type:"reinforce", to:Coord, n:number}
type RiskAttackMove =  {type:"attack", to:Coord, n:number}
type RiskEndMove = {type: "end"};

type RiskMove = RiskReinforceMove | RiskEndMove | RiskAttackMove;

const DIRS = [
    {x: 1, y:0},
    {x: -1, y:0},
    {x: 0, y:1},
    {x: 0, y:-1},
]

export class RiskGame implements Game<RiskState, RiskMove>{
    applyMove(state: RiskState, move: RiskMove): RiskState {
        if(move.type === 'end') return this.applyEndTurnMove(move, state);
        if(move.type === 'reinforce') return this.applyReinforceMove(move, state);
        if(move.type === 'attack') return this.applyAttackMove(move, state);
        throw new Error("Unknown type")
    }

    getSensibleMoves(state: RiskState): RiskMove[] {
        if(state.troopsInHand > 0) return [...this.getValidReinforcementMoves(state), ...this.getValidAttackMoves(state)];
        return [];
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
        }, ...this.getValidReinforcementMoves(state), ...this.getValidAttackMoves(state)]
    }

    getValidReinforcementMoves(state: RiskState):RiskReinforceMove[] {
        if(state.troopsInHand === 0) return [];
        return this.getCoords(state)
            .filter(({x,y})=>state.ownership[x][y]===state.activePlayer)
            .map(to=>({
                type: "reinforce",
                n:1,
                to
             }))
    }

    getValidAttackMoves(state: RiskState):RiskAttackMove[] {
        if(state.troopsInHand === 0) return [];
        const attackTargets =  this.getCoords(state)
            .filter(({x,y})=>state.ownership[x][y]!==state.activePlayer) //Doesn't belong to player
            .filter(({x,y})=>DIRS.some(delta=>
                (x+delta.x) >= 0
                && (x+delta.x) < state.ownership.length
                && state.ownership[x+delta.x][y+delta.y] === state.activePlayer)
            ) //Next to active player
        const validAttackNumbers = [1,2,3].filter(n => n <= state.troopsInHand)
        return _.flatMap(validAttackNumbers, n=> attackTargets
            .map(to=>({
                type: "attack",
                n,
                to
             })))
    }

    newGame(): RiskState {
        return {
            activePlayer: 1,
            troopsInHand: 3,
            ownership: [
                [1,0,0,0],
                [0,0,0,0],
                [0,0,0,0],
                [0,0,0,2],
            ],
            reinforcements:[
                [0,0,0,0],
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
         const playerInvertedColors = {
            0:  chalk.bgWhite,
            1: chalk.bold.blue,
            2: chalk.bold.red
        };

        let str = playerColors[state.activePlayer](`${state.activePlayer}'s turn (${state.troopsInHand} troops in hand)\n`)
        for(let y = 0; y < state.ownership[0].length; y++){
            for(let x = 0; x < state.ownership.length; x++){
                const owner = state.ownership[x][y];
                const color = this.tileGivesBonusTroops({x,y}) ? playerInvertedColors[owner] : playerColors[owner];
                str += color(`${state.ownership[x][y] !== 0 ? state.reinforcements[x][y] + 1 : '.'} `)
            }
            str += '\n'
        }
        if(state.eventLog){
            state.eventLog.forEach(event=>str+=`> ${event}\n`)
        }
        str += '\n'
        console.log(str)
    }

    private applyEndTurnMove(_: RiskEndMove, state:RiskState):RiskState {
        const nextPlayer = state.activePlayer === 1 ? 2 : 1;
        const troopsInHandFromMap = this.getCoords(state)
            .filter(({x,y})=>state.ownership[x][y]===nextPlayer)
            .map(({x,y})=>state.reinforcements[x][y])
            .reduce((total, val)=>total+val)
        const reinforcements = state.reinforcements.map(row=>[...row]);
        this.getCoords(state)
            .filter(({x,y})=>state.ownership[x][y]===nextPlayer)
            .forEach(({x,y})=>{
                reinforcements[x][y] = 0;
            })
        const bonusTroops = this.getCoords(state)
            .filter(({x,y})=>state.ownership[x][y]===nextPlayer)
            .filter(({x,y})=>this.tileGivesBonusTroops({x,y}))
            .length;

        return {
            activePlayer: nextPlayer,
            troopsInHand: troopsInHandFromMap + bonusTroops,
            reinforcements,
            ownership: state.ownership.map(row=>[...row]),
        };
    }

    private applyReinforceMove({to, n}: RiskReinforceMove, state: RiskState): RiskState {
        const reinforcements = state.reinforcements.map(row=>[...row])
        reinforcements[to.x][to.y] += n;
        return {
            activePlayer: state.activePlayer,
            troopsInHand: state.troopsInHand - n,
            reinforcements,
            ownership: state.ownership.map(row=>[...row]),
        };
    }

    private tileGivesBonusTroops({x,y}:Coord):boolean {
        return (x==0 && y==0)||(x==3&&y==3)
    }

    private applyAttackMove({to:{x,y}, n}: RiskAttackMove, state: RiskState):RiskState {
        const eventLog = [`Attacking ${x},${y}`]
        const isDefended = state.ownership[x][y] !== 0;
        let isSuccessful = true;
        if(isDefended){
            const defendingDice = state.reinforcements[x][y] ? 2 : 1;
            const attackingDice = n;
            let defendingScore = 0;
            let attackingScore = 0;
            for(let i = 0; i < defendingDice; i++){
                defendingScore += Math.floor(Math.random()*6)
            }
            for(let i = 0; i < attackingDice; i++){
                attackingScore += Math.floor(Math.random()*6)
            }
            eventLog.push(`${attackingDice}d6 = ${attackingScore} vs ${defendingDice}d6 = ${defendingScore}`)
            if(attackingScore <= defendingScore){
                isSuccessful = false;
                eventLog.push('Defender Victory')
            }else{
                 eventLog.push('Attacker Victory')
            }
        }
        if(isSuccessful){
            const troopsInHand = state.troopsInHand - 1;
            const reinforcements = state.reinforcements.map(row=>[...row])
            const ownership = state.ownership.map(row=>[...row])
            ownership[x][y] = state.activePlayer;
            reinforcements[x][y] = 0;
            return {
                activePlayer: state.activePlayer,
                troopsInHand,
                ownership,
                reinforcements,
                eventLog
            }
        }else{
            const troopsInHand = state.troopsInHand - n;
            return {
                activePlayer: state.activePlayer,
                troopsInHand,
                ownership: state.ownership.map(row=>[...row]),
                reinforcements: state.reinforcements.map(row=>[...row]),
                eventLog
            }
        }
    }
}
