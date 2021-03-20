import setupEffects from '../cardgame/Components/Effects/setup'
import assert from 'assert';
import TextTemplate, {Effect} from "../cardgame/TextTemplate";
import {CardGameState} from "../cardgame/CardGame";

const EXAMPLE_STATE:CardGameState = {
      activePlayer: 1,
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
        assert.equal((effect as any).a.constructor.name, 'DamagePlayerEffect')
        assert.equal((effect as any).b.constructor.name, 'DamagePlayerEffect')
    });
    it("Can parse 'Your opponent draws a card'", ()=>{
        const effect:Effect = TextTemplate.parse('Eff', 'Your opponent draws a card')
        const state = effect.applyEffect(EXAMPLE_STATE, "playerOne");
        assert.equal(state.playerTwo.hand.length, 1);
        assert.equal(state.playerTwo.deck.length, 0);
    });
    it("Can Exec 'deal one damage to your opponent, and deal one damage to yourself'", ()=>{
        const effect:Effect = TextTemplate.parse('Eff', 'deal three damage to your opponent, and deal one damage to yourself');

        const state = effect.applyEffect(EXAMPLE_STATE, "playerOne");
        assert.equal(state.playerOne.health, 9);
        assert.equal(state.playerTwo.health, 7);
    });
});