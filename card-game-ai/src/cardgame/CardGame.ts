import {Game, GameStatus} from "../MCTS/mcts";
import chalk from 'chalk'
import {Card, ChoiceActionCard, EffectCard, ItemCard, PlayerKey} from "./Card";
import {DrawCardEffect} from "./Components/Effects/RandomTransferEffect";
import {resolveActivePlayer} from "./Components/setup";
import {Fizzle} from "./Components/TextTemplate";
import {ConditionalEffect} from "./Components/Effects/ConditionalEffect";
import {EventParams, EventType, OnEventAbility} from "./Components/Abilities/OnEventAbility";
import _ from 'lodash'

export type CardGameChain = CardGameMove|CardGameMove[]

export interface CardGamePlayerState {
    readonly health: number;
    readonly hand: readonly number[];
    readonly board: readonly number[];
    readonly discardPile: readonly number[];
    readonly deck: readonly number[];
}

export interface CardGameState {
    readonly activePlayer: 1|2;
    readonly step: 'draw'|'play'|'choice'
    readonly playerOne: CardGamePlayerState
    readonly playerTwo: CardGamePlayerState;
    readonly cardBeingPlayed?:number,
    readonly log?:string[],
}

interface CardGamePlayCardMove {type:"play"; cardNumber:number}
interface CardGameDiscardCardMove{type:"discard"; cardNumber:number}
interface CardGameEndMove {type:"end"}
export interface CardGameChoiceMove {type:"choice", choice:number}
export type CardGameMove = CardGameEndMove | CardGamePlayCardMove | CardGameDiscardCardMove | CardGameChoiceMove;


export default class CardGame extends Game<CardGameState, CardGameMove>{

    cardIndex:Record<number, Card>;
    deckOne:number[];
    deckTwo:number[];
    static MAX_HAND_SIZE: number = 6;

    constructor(cardIndex:Record<number,Card>, deckOne?:number[], deckTwo?:number[]){
        super();
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
        }else if(move.type === "choice"){
            return this.applyChoiceMove(state, move)
        }
        throw new Error("Unknown move")
    }

    getSensibleMoves(state: CardGameState): CardGameChain[] {
        return this.getCardMoves(state).filter((chain)=>{
            const cardNumber = Array.isArray(chain) ? chain[0].cardNumber : chain.cardNumber;
            if(!this.cardIndex[cardNumber]){
               throw new Error("Can't find card "+cardNumber)
            }
            const {effect} = (this.cardIndex[cardNumber] as EffectCard)
            if(effect?.constructor.name !== "ConditionalEffect") {
                return true;
            }
            const {condition} = (effect as ConditionalEffect)
            const playerKey = state.activePlayer === 1 ? 'playerOne' : 'playerTwo';
            return condition.resolveValue(state,{playerKey})
        })
    }

    getStatus(state: CardGameState): GameStatus {
        const p1Dead =  state.playerOne.health <= 0;
        const p2Dead =  state.playerTwo.health <= 0;
        if(p1Dead && p2Dead) return GameStatus.DRAW;
        if(p1Dead) return GameStatus.LOSE;
        if(p2Dead) return GameStatus.WIN;
        return GameStatus.IN_PLAY;
    }

    getValidMoves(state: CardGameState): (CardGameChain)[] {
        if(state.cardBeingPlayed!==undefined){
            const playerKey = state.activePlayer  === 1 ? 'playerOne' : 'playerTwo';
            const card = this.cardIndex[state.cardBeingPlayed];
            if(!ChoiceActionCard.is(card)) throw new Error("Not a choice card!")
            return card.choiceAction.getChoices(state, {playerKey}, this);
        }
        if(state.step === 'draw') return this.getDiscardMoves(state);
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
        const p1Draw =  drawCardsEffect.applyEffect(preGame,{playerKey: "playerOne"}, this);
        return drawCardsEffect.applyEffect(p1Draw,{playerKey: "playerTwo"}, this);
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

    private getCardMoves(state: CardGameState):(CardGamePlayCardMove|[CardGamePlayCardMove,CardGameChoiceMove])[] {
        if(state.step != 'play') return [];
        const playerKey = state.activePlayer === 1 ? 'playerOne' : 'playerTwo';
        const activePlayer = state[playerKey];
        return _.flatMap(activePlayer.hand, cardNumber=>{
            const playMove:CardGamePlayCardMove = {type:"play", cardNumber};
            const card = this.cardIndex[cardNumber];
            if(ChoiceActionCard.is(card)){
                const choices:CardGameChoiceMove[] =  card.choiceAction.getChoices(state, {playerKey} , this);
                const chain = choices.map(choice => [playMove, choice] as [CardGamePlayCardMove,CardGameChoiceMove])
                return chain as (CardGamePlayCardMove|[CardGamePlayCardMove,CardGameChoiceMove])[]
            }
            return [playMove];
        })
    }
   private getDiscardMoves(state: CardGameState):CardGameDiscardCardMove[] {
        if(state.step != 'draw') return [];
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
        const postEventsState = this.processEvent(newState, 'turn_start',{player:playerKey})
        try{
            return new DrawCardEffect(resolveActivePlayer, 1).applyEffect(postEventsState,{playerKey}, this)
        }catch(e){
            if(Fizzle.isFizzle(e)){
                return e.returnState
            }
            throw e;
        }
    }

    private applyCardPlay(state: CardGameState, cardNumber: number):CardGameState {
        const card = this.cardIndex[cardNumber];
        return card.play(state, cardNumber, this)
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


    processEvent<E extends EventType>(baseState:CardGameState, eventType:E, eventParams: EventParams<E>):CardGameState{
        if(this.getStatus(baseState) != GameStatus.IN_PLAY) return baseState

        let state = baseState;
        const playerKeys:PlayerKey[] = ['playerOne', 'playerTwo'];
        playerKeys.forEach((playerKey:PlayerKey)=>{
            const itemCardsInPlay = baseState[playerKey].board
                .map(n=>this.cardIndex[n])
                .filter(c=>ItemCard.isItemCard(c)) as ItemCard[]

            const listeners = itemCardsInPlay
                .map(c=>c.ability)
                .filter(a=>OnEventAbility.isOnEventAbility(a, eventType)) as OnEventAbility<E>[]

            listeners.forEach(listener=>{
                try{
                    state = listener.trigger(state, eventParams, {playerKey}, this);
                }catch(e){
                    if(!Fizzle.isFizzle(e)) throw e;
                    state = e.returnState;
                }
            })
        })

        return state;
    }

    private applyChoiceMove(state: CardGameState, move: CardGameChoiceMove):CardGameState {
        const playerKey = state.activePlayer  === 1 ? 'playerOne' : 'playerTwo';
        const card = this.cardIndex[state.cardBeingPlayed!];
        if(!ChoiceActionCard.is(card)) {
            throw new Error(`${state.cardBeingPlayed} Not a choice card!`)
        }
        const stateAfterEffects = (()=>{
            try{
                return card.choiceAction.applyEffect(move, state, {playerKey}, this);
            }catch(e){
                if(!Fizzle.isFizzle(e))throw e;
                return e.returnState;
            }
        })();
        return {
            ...stateAfterEffects,
            step: 'play',
            cardBeingPlayed: undefined
        }
    }
}