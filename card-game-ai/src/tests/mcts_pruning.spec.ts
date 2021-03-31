import {describe} from "mocha";
import {performance} from 'perf_hooks';
import {ConnectFourGame} from "../MCTS/ConnectFour";
import {MCTSStrategy} from "../MCTS/mcts";
import assert from "assert";

describe("MCTS - Pruning", ()=> {
    it("Doesn't explode",()=>{
        const game = new ConnectFourGame();
        const ai = new MCTSStrategy(100,100)
        ai.usePruning = true;
        ai.pickMove(game, game.newGame());
    })
    it("is faster than not",()=>{
        const game = new ConnectFourGame();
        const ai = new MCTSStrategy(1000,100)

        const start = performance.now();
        ai.pickMove(game, game.newGame());
        const t1 = performance.now() - start;

        ai.usePruning = true;

        const start2 = performance.now();
        ai.pickMove(game, game.newGame());
        const t2 = performance.now() - start2;

        console.log({t1,t2})

        assert(t1 > t2);
    })
});