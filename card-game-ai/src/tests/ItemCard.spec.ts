import {describe} from "mocha";
import {Card, ItemCard} from "../cardgame/Card";
import assert from 'assert';
import CardGame, {CardGameState} from "../cardgame/CardGame";
/*
describe("Item CardDisplay", ()=>{
    it("Is added to the board, not the discard", ()=>{
         const cardIndex:Record<number, Card> = {
                42: new ItemCard(),
                105: new ItemCard(),
         }
         const game = new CardGame(cardIndex, [...new Array(20).fill(42),...new Array(20).fill(105)]);
         const state:CardGameState = {
              activePlayer: 1,
             step:"play",
              playerOne: {
                deck: [
                   42,  42,  42,  42,  42,  42,  42,  42,
                   42,  42,  42,  42,  42,  42,  42,  42,
                   42,  42, 105, 105, 105, 105, 105, 105,
                  105, 105, 105, 105, 105, 105, 105, 105,
                  105, 105
                ],
                hand: [ 105, 105, 42, 42, 105, 105 ],
                health: 10,
                discardPile: [],
                board: []
              },
              playerTwo: {
                deck: [
                   42,  42,  42,  42,  42,  42,  42,  42,  42,
                   42,  42,  42,  42,  42,  42,  42,  42,  42,
                   42,  42, 105, 105, 105, 105, 105, 105, 105,
                  105, 105, 105, 105, 105, 105, 105, 105, 105,
                  105, 105, 105, 105
                ],
                hand: [],
                health: 10,
                discardPile: [],
                board: []
              }
        };
        const newState = game.applyMove(state,{type:"play", cardNumber:42})
        assert.equal(newState.playerOne.discardPile.length,0)
        assert.deepEqual(newState.playerOne.board, [42])
        assert.deepEqual(newState.playerOne.hand, [105, 105, 42, 105, 105 ])
    })
});

 */