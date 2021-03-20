import {Game, GameStatus} from "../MCTS/mcts";
import chalk from 'chalk'
import {Card} from "./Card";

export interface CardGamePlayerState {
    readonly health: number;
    readonly hand: readonly number[];
    readonly board: readonly number[];
    readonly discardPile: readonly number[];
    readonly deck: readonly number[];
}

export interface CardGameState {
    readonly activePlayer: 1|2;
    readonly playerOne: CardGamePlayerState
    readonly playerTwo: CardGamePlayerState;
    readonly log?:string[],
}

interface CardGamePlayCardMove {type:"play"; cardNumber:number}
interface CardGameEndMove {type:"end"}
export type CardGameMove = CardGameEndMove | CardGamePlayCardMove;

export default class CardGame implements Game<CardGameState, CardGameMove>{

    cardIndex:Record<number, Card>;
    deckOne:number[];
    deckTwo:number[];

    constructor(cardIndex:Record<number,Card>, deckOne?:number[], deckTwo?:number[]){
        this.cardIndex = cardIndex;
        this.deckOne = deckOne ? deckOne : Object.keys(this.cardIndex).map(i=>parseInt(i));
        this.deckTwo = deckTwo ? deckTwo : this.deckOne;
    }

    applyMove(state: CardGameState, move: CardGameMove): CardGameState {
        if(move.type === "end"){
            return this.applyEndMove(state);
        }else if(move.type === "play"){
            return this.applyCardPlay(state, move.cardNumber)
        }
        throw new Error("Unknown move")
    }

    getSensibleMoves(state: CardGameState): CardGamePlayCardMove[] {
        return [];
    }

    getStatus(state: CardGameState): GameStatus {
        const p1Dead = state.playerOne.deck.length === 0 ||  state.playerOne.health < 0;
        const p2Dead = state.playerTwo.deck.length === 0 ||  state.playerTwo.health < 0;
        if(p1Dead && p2Dead) return GameStatus.DRAW;
        if(p1Dead) return GameStatus.LOSE;
        if(p2Dead) return GameStatus.WIN;
        return GameStatus.IN_PLAY;
    }

    getValidMoves(state: CardGameState): CardGameMove[] {
        return [{type:"end"}, ...this.getCardMoves(state)]
    }

    newGame(): CardGameState {
        const newPlayer = {
            hand:[],
            health: 10,
            discardPile:[],
            board:[]
        }
        const preGame:CardGameState = {
            activePlayer: 2, //Will flip when we run end turn logic
            playerOne:{
                deck: this.deckOne,
                ...newPlayer
            },
            playerTwo:{
                deck: this.deckTwo,
                ...newPlayer
            }
        };
        return this.applyEndMove(preGame);
    }

    print( {playerOne, playerTwo, ...state}: CardGameState): void {
        console.log(chalk.white(JSON.stringify(state,null,4)))
        console.log(chalk.blue(JSON.stringify(playerOne,null,4)))
        console.log(chalk.red(JSON.stringify(playerTwo,null,4)))
    }

    randomizeHiddenInfo(state: CardGameState): CardGameState {
        return state;
    }

    private getCardMoves(state: CardGameState):CardGamePlayCardMove[] {
        const activePlayer = state.activePlayer === 1 ? state.playerOne : state.playerTwo;
        return activePlayer.hand.map(cardNumber=>({type:"play", cardNumber}))
    }

    private applyEndMove(state: CardGameState):CardGameState {
        const HAND_SIZE = 6;

        const activePlayer = state.activePlayer === 1 ? 2 : 1;
        const playerKey = activePlayer  === 1 ? 'playerOne' : 'playerTwo';
        const player = state[playerKey];

        const deck = [...player.deck];
        const hand = [...player.hand];

        while(hand.length < HAND_SIZE && deck.length > 0){
            const drawIndex = Math.floor(Math.random() * deck.length);
            hand.push(...deck.splice(drawIndex, 1))
        }

        const newPlayer:CardGamePlayerState = {
            ...player,
            deck,
            hand
        }

        return {
            ...state,
            [playerKey]: newPlayer,
            activePlayer,
        }
    }

    private applyCardPlay(state: CardGameState, cardNumber: number):CardGameState {
        const card = this.cardIndex[cardNumber];
        return card.play(state, cardNumber)
    }
}