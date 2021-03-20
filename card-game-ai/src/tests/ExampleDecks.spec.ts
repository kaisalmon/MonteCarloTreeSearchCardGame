import {describe} from 'mocha';
import getExampleDeck from '../cardgame/Data/ExampleDecks'

describe("load example deck", ()=>{
    it("Works", ()=>{
        let cards = getExampleDeck();
    })
})