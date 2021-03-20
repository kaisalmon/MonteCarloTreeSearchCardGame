import {describe} from 'mocha'
import CardGame, {Card, CardGamePlayerState, CardGameState} from "../cardgame/CardGame";
import assert from 'assert'
import _ from 'lodash';

class IdentityCard implements Card{
    play(state: CardGameState): CardGameState {
        return {...state, log:[...(state.log||[]), "Played IdentityCard Card"]};
    }
}

describe("Basic Card Game Stuff", ()=>{
    describe("Smoke Test", ()=>{
        let game:CardGame;
        let state:CardGameState;
        before(()=>{
            const cardIndex:Record<number, Card> = {
                0: new IdentityCard(),
            }
            game = new CardGame(cardIndex, new Array(20).fill(0));
        })
        beforeEach(()=>{
            state = game.newGame();
        })
        it("The active player should be 1", ()=>{
            assert(state.activePlayer === 1)
        })
        it("Player one should have 6 cards in hand", ()=>{
            assert.equal(state.playerOne.hand.length, 6)
        })
        it("Player one should have 6 less cards in deck than player 2", ()=>{
            assert.equal(state.playerOne.deck.length + 6, state.playerTwo.deck.length)
        })
        describe("Get Valid Moves", ()=>{
            it("exists", ()=>assert.ok(game.getValidMoves))
            it("Gives correct response", ()=>{
                const result = game.getValidMoves(state);
                const counts = _.countBy(result, 'type');
                assert.equal(counts.play, 6);
                assert.equal(counts.end, 1);
            })
        })
         describe("Apply End Turn", ()=>{
            it("Gives correct response", ()=>{
                const newState = game.applyMove(state, {type:"end"});
                assert.equal(newState.activePlayer, 2)
                assert.equal(newState.playerOne.hand.length, 6)
                assert.equal(newState.playerTwo.hand.length, 6)
                assert.equal(newState.playerOne.deck.length, newState.playerTwo.deck.length)
            })
        })
         describe("Apply Card Play", ()=>{
            it("Gives correct response", ()=>{
                const newState = game.applyMove(state, {type:"play", cardNumber:0});
                console.log(newState);
                assert.equal(newState.activePlayer, 1)
                assert.deepEqual(newState.log, ["Played IdentityCard Card"])
                assert.equal(newState.playerOne.hand.length, 5)
                assert.equal(newState.playerOne.discardPile.length, 1)
            })
        })
    })
})