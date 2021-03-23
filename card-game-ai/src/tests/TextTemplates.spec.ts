import {describe, it, before} from 'mocha'

import setupEffects from '../cardgame/Components/setup'
import assert from 'assert';
import TextTemplate, {Effect} from "../cardgame/Components/TextTemplate";
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

describe("Text Template", ()=>{
    before(()=>{
        setupEffects();
    })
    after(()=>{
        TextTemplate.clear();
    })
    it("TextTemplates has templates", ()=>{
        assert(TextTemplate.templates.Eff.length > 0);
    });
    it("Can parse 'Draw a card'", ()=>{
        const effect:Effect = TextTemplate.parse('Eff', 'Draw a card');
        assert.equal(effect.constructor.name, 'DrawCardEffect')
    });
    it("Can parse 'draw a card, and draw a card'", ()=>{
        const effect:Effect = TextTemplate.parse('Eff', 'Draw a card, and draw a card');
        assert.equal(effect.constructor.name, 'ListEffect')
        assert.equal((effect as any).a.constructor.name, 'DrawCardEffect')
        assert.equal((effect as any).b.constructor.name, 'DrawCardEffect')
    });
    it("Can parse 'deal one damage to your opponent, then deal one damage to yourself'", ()=>{
        const effect:Effect = TextTemplate.parse('Eff', 'deal one damage to your opponent, then deal one damage to yourself');
        assert.equal(effect.constructor.name, 'ListEffect')
        assert.equal((effect as any).a.constructor.name, 'ChangeHealthEffect')
        assert.equal((effect as any).b.constructor.name, 'ChangeHealthEffect')
    });
    it("Can parse 'Your opponent draws a card'", ()=>{
        const effect:Effect = TextTemplate.parse('Eff', 'Your opponent draws a card')
        const state = effect.applyEffect(EXAMPLE_STATE, {playerKey: "playerOne"});
        assert.equal(state.playerTwo.hand.length, 1);
        assert.equal(state.playerTwo.deck.length, 0);
    });
    it("Can parse and exec 'Your opponent draws a card then takes 5 damage'", ()=>{
        const effect:Effect = TextTemplate.parse('Eff', 'Your opponent draws a card then takes 5 damage')
        const state = effect.applyEffect(EXAMPLE_STATE, {playerKey: "playerOne"});
        assert.equal(state.playerTwo.hand.length, 1);
        assert.equal(state.playerTwo.deck.length, 0);
        assert.equal(state.playerTwo.health, 5);
    });
    it("Can Exec 'deal one damage to your opponent, and deal one damage to yourself'", ()=>{
        const effect:Effect = TextTemplate.parse('Eff', 'deal three damage to your opponent, and deal one damage to yourself');

        const state = effect.applyEffect(EXAMPLE_STATE, {playerKey: "playerOne"});
        assert.equal(state.playerOne.health, 9);
        assert.equal(state.playerTwo.health, 7);
    });
    it("Can Exec 'deal one damage to your opponent, and they take one damage'", ()=>{
        const effect:Effect = TextTemplate.parse('Eff', 'deal three damage to your opponent, and they take one damage');

        const state = effect.applyEffect(EXAMPLE_STATE, {playerKey: "playerOne"});
        assert.equal(state.playerTwo.health, 6);
    });
    it("Can Exec 'gain 4 health if you have less than 5 health', when the players has over 5 health", ()=>{
        const effect:Effect = TextTemplate.parse('Eff', 'gain 4 health if you have less than 5 health');
        const state = effect.applyEffect(EXAMPLE_STATE, {playerKey: "playerOne"});
        assert.equal(state.playerOne.health, 10);
    });
        it("Can Exec 'gain 4 health if you have less than 5 health', when the players has less than 5 health", ()=>{
            const stateWithLessThan5Health = {
                ...EXAMPLE_STATE,
                playerOne:{
                    ...EXAMPLE_STATE.playerOne,
                    health: 1
                }
            }
        const effect:Effect = TextTemplate.parse('Eff', 'gain 4 health if you have less than 5 health');
        const state = effect.applyEffect(stateWithLessThan5Health, {playerKey: "playerOne"});
        assert.equal(state.playerOne.health, 5);
    });
    describe("Error Handling", ()=>{
        it("Response with the correct error message", ()=>{
            assert.throws(()=>TextTemplate.parse("Eff", "Deal three damage to fred"), err=>{
                assert.equal(err.message, 'Invalid text for slot Player: fred')
                return true;
            })
        })
    })
});