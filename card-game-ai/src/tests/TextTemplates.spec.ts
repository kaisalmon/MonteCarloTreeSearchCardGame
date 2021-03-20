import setupEffects from '../cardgame/Components/Effects/setup'
import assert from 'assert';
import TextTemplate, {Effect} from "../cardgame/TextTemplate";

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
    it("Can parse 'draw a card, then draw a card'", ()=>{
        const effect:Effect = TextTemplate.parse('Eff', 'Draw a card, then draw a card');
        assert.equal(effect.constructor.name, 'ListEffect')
        assert.equal((effect as any).a.constructor.name, 'DrawCardEffect')
        assert.equal((effect as any).b.constructor.name, 'DrawCardEffect')
    });
});