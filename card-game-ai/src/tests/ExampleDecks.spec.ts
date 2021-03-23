import {describe} from 'mocha';
import getExampleDeck from '../cardgame/Data/ExampleDecks'
import TextTemplate from "../cardgame/Components/TextTemplate";
import setupEffects from '../cardgame/Components/Effects/setup'

describe("load example deck", ()=>{
    before(()=>{
        setupEffects();
    })
    it("Works", ()=>{
        let cards = getExampleDeck();
    })
    after(()=>{
       TextTemplate.clear()
    })
})