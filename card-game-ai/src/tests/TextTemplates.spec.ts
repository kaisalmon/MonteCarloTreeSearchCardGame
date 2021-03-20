import setupEffects from '../cardgame/Components/Effects/setup'
import assert from 'assert';
import TextTemplate, {Effect} from "../cardgame/TextTemplate";
import {CardGameState} from "../cardgame/CardGame";

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

    });
    it("Can Exec 'deal one damage to your opponent, then deal one damage to yourself'", ()=>{
        const effect:Effect = TextTemplate.parse('Eff', 'deal one damage to your opponent, then deal one damage to yourself');
        const state:CardGameState = {
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
        const newState = effect.applyEffect(state, "playerOne");
        assert.equal(newState.playerOne.health, 9);
        assert.equal(newState.playerTwo.health, 9);
    });
});