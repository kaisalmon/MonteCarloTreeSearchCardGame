import {describe, it, before} from 'mocha'

import setupEffects, {
    resolveActivePlayer,
    resolveOpponent,
    resolvePlayerContextually
} from '../cardgame/Components/setup'
import assert from 'assert';
import TextTemplate, {Effect} from "../cardgame/Components/TextTemplate";
import CardGame, {CardGameState} from "../cardgame/CardGame";
import {ConditionalEffect} from "../cardgame/Components/Effects/ConditionalEffect";
import {PlayerLessThanCondition} from "../cardgame/Components/GameConditions/PlayerLessThanCondition";
import {ChangeHealthEffect} from "../cardgame/Components/Effects/ChangeHealthEffect";
import createStubGame from "./createStubGame";

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
    let game: CardGame;
    before(()=>{
        setupEffects();
        game = createStubGame();
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
    it("Can parse 'Deal three damage to your opponent if they have less than ten health'", ()=>{
        const effect:Effect = TextTemplate.parse('Eff', 'Deal three damage to your opponent if they have less than ten health');
        assert.equal(effect.constructor.name, 'ConditionalEffect')
        assert.equal((effect as ConditionalEffect).eff.constructor.name, 'ChangeHealthEffect')
    });
        it("Can parse 'If you have less than two cards in your hand, draw two cards'", ()=>{
        const effect:Effect = TextTemplate.parse('Eff', 'If you have less than two cards in your hand, draw two cards',);
        assert.equal(effect.constructor.name, 'ConditionalEffect')
        assert.equal((effect as ConditionalEffect).eff.constructor.name, 'DrawCardEffect')
    });
    it("Can parse 'Your opponent draws a card'", ()=>{
        const effect:Effect = TextTemplate.parse('Eff', 'Your opponent draws a card')
        const state = effect.applyEffect(EXAMPLE_STATE, {playerKey: "playerOne"}, game);
        assert.equal(state.playerTwo.hand.length, 1);
        assert.equal(state.playerTwo.deck.length, 0);
    });
    it("Can parse and exec 'Your opponent draws a card then takes 5 damage'", ()=>{
        const effect:Effect = TextTemplate.parse('Eff', 'Your opponent draws a card then takes 5 damage')
        const state = effect.applyEffect(EXAMPLE_STATE, {playerKey: "playerOne"}, game);
        assert.equal(state.playerTwo.hand.length, 1);
        assert.equal(state.playerTwo.deck.length, 0);
        assert.equal(state.playerTwo.health, 5);
    });
    it("Can Exec 'deal one damage to your opponent, and deal one damage to yourself'", ()=>{
        const effect:Effect = TextTemplate.parse('Eff', 'deal three damage to your opponent, and deal one damage to yourself');

        const state = effect.applyEffect(EXAMPLE_STATE, {playerKey: "playerOne"}, game);
        assert.equal(state.playerOne.health, 9);
        assert.equal(state.playerTwo.health, 7);
    });
    it("Can Exec 'deal one damage to your opponent, and they take one damage'", ()=>{
        const effect:Effect = TextTemplate.parse('Eff', 'deal three damage to your opponent, and they take one damage');

        const state = effect.applyEffect(EXAMPLE_STATE, {playerKey: "playerOne"}, game);
        assert.equal(state.playerTwo.health, 6);
    });
    it("Can Exec 'gain 4 health if you have less than 5 health', when the players has over 5 health", ()=>{
        const effect:Effect = TextTemplate.parse('Eff', 'gain 4 health if you have less than 5 health');
        const state = effect.applyEffect(EXAMPLE_STATE, {playerKey: "playerOne"}, game);
        assert.equal(state.playerOne.health, 10);
    });
    it("Can Exec 'gain 4 health if you have less than 5 health', when the players has less than 5 health", ()=>{
            const stateWithLessThan5Health = {
                ...EXAMPLE_STATE,
                playerOne:{
                    ...EXAMPLE_STATE.playerOne,
                    health: 3
                }
            }
        const effect:Effect = TextTemplate.parse('Eff', 'gain 4 health if you have less than 5 health');
        const state = effect.applyEffect(stateWithLessThan5Health, {playerKey: "playerOne"}, game);
        assert.equal(state.playerOne.health, 7);
    });
    describe('"Deal three damage to your opponent if they have less than ten health"', ()=>{
        let effect:null|Effect = null;
        before(()=>{
            effect = TextTemplate.parse("Eff", "Deal three damage to your opponent if they have less than ten health")
        })
        it("Parses correctly", ()=>{
            if(!effect) return assert.fail("Effect null")
            assert.strictEqual(effect.constructor.name, 'ConditionalEffect')
            assert.strictEqual((effect as ConditionalEffect).eff.constructor.name, 'ChangeHealthEffect')
            assert.strictEqual(((effect as ConditionalEffect).eff as ChangeHealthEffect).target, resolvePlayerContextually)
            assert.strictEqual((effect as ConditionalEffect).condition.constructor.name, 'PlayerLessThanCondition')
            assert.strictEqual(((effect as ConditionalEffect).condition as PlayerLessThanCondition).target, resolveOpponent)
        })
        it("Executes when condition false", ()=>{
            if(!effect) return assert.fail("Effect null")
            const state:CardGameState = {...EXAMPLE_STATE}
            const result = effect.applyEffect(state,{playerKey:'playerOne'}, game)
            assert.strictEqual(result.playerOne.health, 10)
            assert.strictEqual(result.playerTwo.health, 10)
        })
        it("Executes when condition true", ()=>{
            if(!effect) return assert.fail("Effect null")
            const state:CardGameState = {
                ...EXAMPLE_STATE,
                playerTwo:{
                    ...EXAMPLE_STATE.playerTwo,
                    health: 5
                }
            }
            const result = effect.applyEffect(state,{playerKey:'playerOne'}, game)
            assert.strictEqual(result.playerOne.health, 10)
            assert.strictEqual(result.playerTwo.health, 2)
        })
    })
    describe("Error Handling", ()=>{
        it("Response with the correct error message", ()=>{
            assert.throws(()=>TextTemplate.parse("Eff", "Deal three damage to fred"), err=>{
                assert.equal(err.message, 'Invalid text for slot Player: fred')
                return true;
            })
        })
    })
});