import {Game, GameStatus} from "../MCTS/mcts";
import chalk from 'chalk'
import {Card, EffectCard} from "./Card";
import {DrawCardEffect} from "./Components/Effects/RandomTransferEffect";
import {resolveActivePlayer} from "./Components/setup";
import {Fizzle} from "./Components/TextTemplate";
import {ConditionalEffect} from "./Components/Effects/ConditionalEffect";

export interface CardGamePlayerState {
    readonly health: number;
    readonly hand: readonly number[];
    readonly board: readonly number[];
    readonly discardPile: readonly number[];
    readonly deck: readonly number[];
}

export interface CardGameState {
    readonly activePlayer: 1|2;
    readonly step: 'draw'|'play'
    readonly playerOne: CardGamePlayerState
    readonly playerTwo: CardGamePlayerState;
    readonly log?:string[],
}

interface CardGamePlayCardMove {type:"play"; cardNumber:number}
interface CardGameDiscardCardMove{type:"discard"; cardNumber:number}
interface CardGameEndMove {type:"end"}
export type CardGameMove = CardGameEndMove | CardGamePlayCardMove | CardGameDiscardCardMove;


export default class CardGame implements Game<CardGameState, CardGameMove>{

    cardIndex:Record<number, Card>;
    deckOne:number[];
    deckTwo:number[];
    static MAX_HAND_SIZE: number = 6;

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
        }else if(move.type === "discard"){
            return this.applyCardDiscard(state, move.cardNumber)
        }
        throw new Error("Unknown move")
    }

    getSensibleMoves(state: CardGameState): CardGameMove[] {
        return this.getCardMoves(state).filter(({cardNumber})=>{
            const {effect} = (this.cardIndex[cardNumber] as EffectCard)
            if(effect.constructor.name !== "ConditionalEffect") {
                return true;
            }
            const {condition} = (effect as ConditionalEffect)
            const playerKey = state.activePlayer === 1 ? 'playerOne' : 'playerTwo';
            return condition.resolveValue(state,{playerKey})
        });
    }

    getStatus(state: CardGameState): GameStatus {
        const p1Dead =  state.playerOne.health <= 0;
        const p2Dead =  state.playerTwo.health <= 0;
        if(p1Dead && p2Dead) return GameStatus.DRAW;
        if(p1Dead) return GameStatus.LOSE;
        if(p2Dead) return GameStatus.WIN;
        return GameStatus.IN_PLAY;
    }

    getValidMoves(state: CardGameState): CardGameMove[] {
        if(state.step === 'draw'){
            return this.getDiscardMoves(state);
        }
        return [{type:"end"}, ...this.getCardMoves(state)]
    }

    newGame(): CardGameState {
        const newPlayer = {
            hand:[],
            health: 25,
            discardPile:[],
            board:[]
        }
        const preGame:CardGameState = {
            activePlayer: 1,
            step: 'play',
            playerOne:{
                deck: this.deckOne,
                ...newPlayer
            },
            playerTwo:{
                deck: this.deckTwo,
                ...newPlayer
            }
        };
        const drawCardsEffect = new DrawCardEffect(resolveActivePlayer, CardGame.MAX_HAND_SIZE);
        const p1Draw =  drawCardsEffect.applyEffect(preGame,{playerKey: "playerOne"});
        return drawCardsEffect.applyEffect(p1Draw,{playerKey: "playerTwo"});
    }

    print( {playerOne, playerTwo, ...state}: CardGameState): void {
        console.log(chalk.white(JSON.stringify(state,null,4)))
        console.log(chalk.blue(JSON.stringify(playerOne,null,4)))
        console.log(chalk.red(JSON.stringify(playerTwo,null,4)))
    }

    randomizeHiddenInfo(state: CardGameState): CardGameState {
        const opponentKey = state.activePlayer === 1 ? 'playerTwo' : 'playerOne'

        // Put their hand back into the deck, then draw up to the same number
        const deck = [...state[opponentKey].deck, ...state[opponentKey].hand];
        const hand = []
        for(let i = 0; i < state[opponentKey].hand.length; i++){
           const drawIndex = Math.floor(Math.random() * deck.length);
            hand.push(...deck.splice(drawIndex, 1))
        }

        return {
            ...state,
            [opponentKey]:{
                ...state[opponentKey],
                hand,
                deck
            }
        };
    }

    private getCardMoves(state: CardGameState):CardGamePlayCardMove[] {
        const activePlayer = state.activePlayer === 1 ? state.playerOne : state.playerTwo;
        return activePlayer.hand.map(cardNumber=>({type:"play", cardNumber}))
    }
   private getDiscardMoves(state: CardGameState):CardGameDiscardCardMove[] {
        const activePlayer = state.activePlayer === 1 ? state.playerOne : state.playerTwo;
        return activePlayer.hand.map(cardNumber=>({type:"discard", cardNumber}))
    }

    private applyEndMove(state: CardGameState):CardGameState {
        const activePlayer = state.activePlayer === 1 ? 2 : 1;
        const playerKey = activePlayer  === 1 ? 'playerOne' : 'playerTwo';
        const newState:CardGameState =  {
            ...state,
            step: 'play',
            activePlayer,
        }
        try{
            return new DrawCardEffect(resolveActivePlayer, 1).applyEffect(newState,{playerKey})
        }catch(e){
            if(Fizzle.isFizzle(e)){
                return e.returnState
            }
            throw e;
        }
    }

    private applyCardPlay(state: CardGameState, cardNumber: number):CardGameState {
        const card = this.cardIndex[cardNumber];
        return card.play(state, cardNumber)
    }
    private applyCardDiscard(state: CardGameState, cardNumber: number):CardGameState {
        const playerKey = state.activePlayer  === 1 ? 'playerOne' : 'playerTwo';
        const player = state[playerKey];

        const hand = [...player.hand];
        const discardPile = [...player.discardPile];
        discardPile.push(...hand.splice(hand.indexOf(cardNumber), 1))
        return {
            ...state,
            step: hand.length > CardGame.MAX_HAND_SIZE ? 'draw' :'play',
            [playerKey]:{
                ...player,
                hand,
                discardPile
            }
        }
    }

    getHeuristic(state: CardGameState):number {
        const bluePoints = Math.max(0, state.playerOne.health * state.playerOne.deck.length * (1+state.playerOne.hand.length))
        const redPoints = Math.max(0, state.playerTwo.health* state.playerTwo.deck.length * (1+state.playerTwo.hand.length))
        if(bluePoints === redPoints) return 0;
        return (bluePoints-redPoints)/(redPoints+bluePoints)
    }
}