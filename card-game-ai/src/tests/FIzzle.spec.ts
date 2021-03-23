import {before, describe, it} from "mocha";
import setupEffects from "../cardgame/Components/setup";
import TextTemplate, {Effect} from "../cardgame/Components/TextTemplate";
import assert from "assert";
import {CardGameState} from "../cardgame/CardGame";

const EXAMPLE_STATE:CardGameState = {
      activePlayer: 1,
        step: "play",
      playerOne: {
        deck: [10],
        hand: [ 10 ],
        health: 10,
        discardPile: [],
        board: []
      },
      playerTwo: {
        deck: [
           12
        ],
        hand: [],
        health: 10,
        discardPile: [],
        board: []
      }
};

describe("Text Template - Fizzling", ()=> {
    before(() => {
        setupEffects();
    })
    after(() => {
        TextTemplate.clear();
    })
    it("Drawing one card works", () => {
        const effect:Effect = TextTemplate.parse('Eff', 'draw one card')
        const state = effect.applyEffect(EXAMPLE_STATE, {playerKey: "playerOne"});
        assert.equal(state.playerOne.hand.length, 2);
    });
    it("Drawing two cards fizzles, but the return state includes the drawing of the first card", () => {
        const effect:Effect = TextTemplate.parse('Eff', 'draw two cards')
        assert.throws( () => effect.applyEffect(EXAMPLE_STATE, {playerKey: "playerOne"}), (e)=>{
             assert.equal(e.returnState.playerOne.hand.length, 2);
            return true;
        })
    });
});