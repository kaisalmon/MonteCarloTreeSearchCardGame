import {describe} from 'mocha'
import CardGame, {CardGameState} from "../cardgame/CardGame";
import assert from 'assert'
import _ from 'lodash';
import {Card, ItemCard} from '../cardgame/Card';
import {ExecutionContext} from "../cardgame/Components/TextTemplate";

class IdentityCard extends Card{

    getName(): string {
        return "IC";
    }

    getText(): string {
        return "";
    }

    applyEffect(state: CardGameState, playerKey: "playerOne" | "playerTwo"): CardGameState {
        return {...state, log:[...(state.log||[]), "Played IdentityCard CardDisplay"]};
    }
}

describe("Basic CardDisplay Game Stuff", ()=>{
    describe("Basic Sanitiy Tests", ()=>{
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
            assert.equal(state.playerOne.hand.length, 7)
        })
        it("Is in discard step", ()=>{
            assert.equal(state.step, "draw")
        })
        it("Player one should have 7 less cards in deck than player 2", ()=>{
            assert.equal(state.playerOne.deck.length + 7, state.playerTwo.deck.length)
        })
        describe("Get Valid Moves", ()=>{
            it("exists", ()=>assert.ok(game.getValidMoves))
            it("Gives correct response", ()=>{
                const result = game.getValidMoves(state);
                const counts = _.countBy(result, 'type');
                assert.equal(counts.discard, 7);
            })
        })
         describe("Apply End Turn", ()=>{
            it("Gives correct response", ()=>{
                const newState = game.applyMove(state, {type:"end"});
                assert.equal(newState.activePlayer, 2)
                assert.equal(newState.step, "draw")
                assert.equal(newState.playerOne.hand.length, 7)
                assert.equal(newState.playerTwo.hand.length, 7)
                assert.equal(newState.playerOne.deck.length, newState.playerTwo.deck.length)
            })
        })
         describe("Apply CardDisplay Play", ()=>{
            it("Gives correct response", ()=>{
                const newState = game.applyMove(state, {type:"play", cardNumber:0});
                assert.equal(newState.activePlayer, 1)
                assert.equal(newState.playerOne.hand.length, 6)
                assert.equal(newState.playerOne.discardPile.length, 1)
            })
            it("Gives correct response for second player too", ()=>{
                const endTurnState = game.applyMove(state, {type:"end"});
                const newState = game.applyMove(endTurnState, {type:"play", cardNumber:0});
                assert.equal(newState.activePlayer, 2)
                assert.equal(newState.playerTwo.hand.length, 6)
                assert.equal(newState.playerTwo.discardPile.length, 1)
            })
        })
    })
})