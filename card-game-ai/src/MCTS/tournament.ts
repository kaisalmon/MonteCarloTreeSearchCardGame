import {Card} from "../cardgame/Card";
import loadExampleDeck from "../cardgame/Data/ExampleDecks";
import {Game, GameStatus, MCTSStrategy, MoveFromGame, RandomStrategy, StateFromGame, Strategy} from "./mcts";
import {performance} from 'perf_hooks';
import setupEffects from '../cardgame/Components/setup'
import CardGame from "../cardgame/CardGame";
import _ from 'lodash'
import cliProgress from 'cli-progress';


type TournamentSettings<G extends Game<any, any>> = {
    game: G,
    strategies: Record<string,
       Strategy<StateFromGame<G>, MoveFromGame<G>>
    >,
    enableMirrorMatches: boolean,
    maxGameLength: number,
    gamesPerMatchUp: number,
    onGameEnd?:(state:StateFromGame<G>)=>Record<string, number>|void,
    eloConstant: number,
}

type TournamentResults = {
    matchUpWins:Record<string, Record<string, number>>,
    summary: Record<GameStatus, number>
    strategiesSummaries: Record<string, StrategySummary>
}

type StrategySummary = {
    t: number,
    wins: number,
    elo: number,
    games: number
}

type MatchUpResult<G> = {
    status: GameStatus,
    blue_t: number,
    red_t: number,
    length: number,
    state: StateFromGame<G>
}

export function runTournament<G extends Game<any, any>>(settings:TournamentSettings<G>):TournamentResults{
    const {strategies, enableMirrorMatches, maxGameLength, gamesPerMatchUp, eloConstant, onGameEnd} = settings;

    const pairings:string[][] = _.keys(strategies).flatMap(blueStratName => _.keys(strategies).map(redStratName => [blueStratName, redStratName]))
        .filter(([blueStratName, redStratName])=>blueStratName!=redStratName||enableMirrorMatches)

    const result:TournamentResults = {
        matchUpWins: _.mapValues(strategies, ()=> _.mapValues(strategies, ()=>0)),
        summary: {
            [GameStatus.WIN]: 0,
            [GameStatus.LOSE]: 0,
            [GameStatus.DRAW]: 0,
            [GameStatus.IN_PLAY]: 0,
        },
        strategiesSummaries: _.mapValues(strategies, ()=>({
            t: 0,
            wins: 0,
            elo: 400,
            games: 0
        }))
    }

    for(let i = 0; i < gamesPerMatchUp; i++) {
        pairings.forEach(([blueStratName, redStratName])=>{
            const matchResult = runMatch(settings, blueStratName, redStratName);
            if(matchResult.status === GameStatus.WIN) {
                result.matchUpWins[blueStratName][redStratName]++;
                result.strategiesSummaries[blueStratName].wins++;
            }else if(matchResult.status === GameStatus.LOSE){
                result.strategiesSummaries[redStratName].wins++;
            }
            if(matchResult.status === GameStatus.LOSE) result.strategiesSummaries[redStratName].wins++;
            result.strategiesSummaries[blueStratName].t += matchResult.blue_t / matchResult.length;
            result.strategiesSummaries[redStratName].t += matchResult.red_t / matchResult.length;;
            result.strategiesSummaries[redStratName].games++;
            result.strategiesSummaries[blueStratName].games++;
            result.summary[matchResult.status]++;

            if(redStratName != blueStratName){
                const blueElo = result.strategiesSummaries[blueStratName].elo;
                const redElo = result.strategiesSummaries[redStratName].elo;
                const pBlue = 1 / (1 + Math.pow(10, ((redElo-blueElo) / eloConstant)))
                const pRed = 1 - pBlue;
                const actual = matchResult.status === GameStatus.WIN ? 1
                        : matchResult.status === GameStatus.LOSE ? 0
                        : 0.5;
                result.strategiesSummaries[blueStratName].elo = blueElo + eloConstant*(actual - pBlue)
                result.strategiesSummaries[redStratName].elo = redElo + eloConstant*(pRed - actual)
            }

            onGameEnd && onGameEnd(matchResult.state)
        })
    }
    return {
        ...result,
        strategiesSummaries: _.mapValues(result.strategiesSummaries, summary=>({
            ...summary,
            t: (summary.t / summary.games)
        }))
    };
}

function runMatch<G extends Game<any, any>>(
    settings:TournamentSettings<G>,
    blueStratName: string,
    redStratName: string
):MatchUpResult<G>{
    const {game, strategies, enableMirrorMatches, maxGameLength, gamesPerMatchUp, onGameEnd} = settings;
    let moves = 0;
    let state:StateFromGame<typeof game> = game.newGame()
    const blueStrat = strategies[blueStratName];
    const redStrat = strategies[redStratName];
    const result:MatchUpResult<G> = {
        status: GameStatus.IN_PLAY,
        blue_t: 0,
        red_t: 0,
        length:0,
        state
    }
    try {
        while (game.getStatus(state) === GameStatus.IN_PLAY && moves++ < maxGameLength) {
            const activeStrat = state.activePlayer === 1 ? blueStrat : redStrat;
            const start = performance.now();
            const move = activeStrat.pickMove(game, state);
            result.length++;
            const t = performance.now() - start;
            result[state.activePlayer === 1? 'blue_t' : 'red_t']+= t;
            state = game.applyMoveChain(state, move);
        }
        const status = game.getStatus(state);
        result.status = status;
        result.state = state;
        return result;
    } catch (e) {
        if(e.message.includes('No valid moves')){
            result.state = state;
            return result;
        }else{
            throw e
        }
    }
}

function main(){

    setupEffects();
    const cardIndex:Record<number, Card> = loadExampleDeck();
    const game = new CardGame(cardIndex)
    const heuristic = game.getHeuristic.bind(game);
    const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);


    let count = 0;

    const settings:TournamentSettings<typeof game> = {
        game,
        strategies:{
            'Basic AI': new RandomStrategy<StateFromGame<typeof game>, MoveFromGame<typeof game>>(),
            'True Random': new RandomStrategy<StateFromGame<typeof game>, MoveFromGame<typeof game>>(true),
            'MCTS Shallow': new MCTSStrategy<StateFromGame<typeof game>, MoveFromGame<typeof game>>(5,1, heuristic),
            'MCTS Medium': new MCTSStrategy<StateFromGame<typeof game>, MoveFromGame<typeof game>>(30,30, heuristic),
            'MCTS High Level': (()=>{
                const s =  new MCTSStrategy<StateFromGame<typeof game>, MoveFromGame<typeof game>>(270, 100, heuristic);
                s.useCache = true;
                s.usePruning = true;
                s.z = 0.8;
                s.pruningPeriod = 3;
                return s;
            })(),
            'MCTS Super High Level': (()=>{
                const s =  new MCTSStrategy<StateFromGame<typeof game>, MoveFromGame<typeof game>>(800, 100, heuristic);
                s.useCache = true;
                s.usePruning = true;
                s.z = 0.8;
                s.pruningPeriod = 3;
                return s;
            })(),
           'MCTS Nested': (()=>{
                const s =  new MCTSStrategy<StateFromGame<typeof game>, MoveFromGame<typeof game>>(10, 90, heuristic,   new MCTSStrategy(1,1, heuristic));
                s.useCache = true;
                s.usePruning = true;
                s.z = 0.8;
                s.pruningPeriod = 3;
                return s;
            })(),
        },
        enableMirrorMatches: false,
        maxGameLength: 200,
        gamesPerMatchUp: 50,
        eloConstant: 30,
        onGameEnd: ()=>{bar1.update(++count)}
    };
    bar1.start((Math.pow(_.keys(settings.strategies).length, 2) - (settings.enableMirrorMatches ? 0 : _.keys(settings.strategies).length)) * settings.gamesPerMatchUp, 0);
    const results = runTournament(settings)
    bar1.stop();

    console.log({
        ...results,
        strategiesSummaries: _.mapValues(results.strategiesSummaries, summary=>_.mapValues(summary, val => val.toPrecision(4)))
    })
}
main();