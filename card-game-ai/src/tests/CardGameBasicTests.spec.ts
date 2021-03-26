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
    describe("Basic Sanitiy Tests", ()=> {
        let game: CardGame;
        let state: CardGameState;
        before(() => {
            const cardIndex: Record<number, Card> = {
                0: new IdentityCard(),
            }
            game = new CardGame(cardIndex, new Array(20).fill(0));
        })
        beforeEach(() => {
            state = game.newGame();
        })
        it("The active player should be 1", () => {
            assert(state.activePlayer === 1)
        })
    });
})