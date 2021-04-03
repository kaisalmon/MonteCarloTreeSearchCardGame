import {Game, GameStatus} from "../MCTS/mcts";
import chalk from 'chalk'
import {Card, ChoiceActionCard, EffectCard, ItemCard, PlayerKey} from "./Card";
import {DrawCardEffect} from "./Components/Effects/RandomTransferEffect";
import {resolveActivePlayer, resolveOpponent} from "./Components/setup";
import {ChoiceAction, Fizzle} from "./Components/TextTemplate";
import {ConditionalEffect} from "./Components/Effects/ConditionalEffect";
import {EventParams, EventType, OnEventAbility} from "./Components/Abilities/OnEventAbility";
import _ from 'lodash'

export type CardGameChain = CardGameMove|CardGameMove[]

export interface CardGamePlayerState {
    readonly popularity: number;
    readonly capital: number;
    readonly position: {readonly x: number,  readonly y: number};
    readonly hand: readonly number[];
    readonly board: readonly number[];
    readonly discardPile: readonly number[];
    readonly deck: readonly number[];
}

export interface CardGameState {
    readonly activePlayer: 1|2;
    readonly isFirstTurn: boolean;
    readonly step: 'draw'|'play'|'choice'
    readonly roundsUntilElection: number;
    readonly cardPlayedThisTurn: boolean;
    readonly endRoundAfterThisTurn: boolean;
    readonly demographics: readonly {x:number, y:number}[]
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
    static STARTING_HAND_SIZE: number = 6;

    constructor(cardIndex:Record<number,Card>, deckOne?:number[], deckTwo?:number[]){
        super();
        this.cardIndex = cardIndex;
        this.deckOne = deckOne ? deckOne : Object.keys(this.cardIndex).map(i=>parseFloat(i));
        this.deckTwo = deckTwo ? deckTwo : this.deckOne;
    }

    applyMove(state: CardGameState, move: CardGameMove): CardGameState {
        if(move.type === "end"){
            return this.onTurnEnd(state);
        }else if(move.type === "play"){
            return this.applyCardPlay(state, move.cardNumber);
        }else if(move.type === "discard"){
            return this.applyCardDiscard(state, move.cardNumber)
        }else if(move.type === "choice"){
            return this.applyChoiceMove(state, move)
        }
        throw new Error("Unknown move")
    }

    getSensibleMoves(state: CardGameState): CardGameChain[] {
        if(state.roundsUntilElection === 1 && state.endRoundAfterThisTurn){
            const votes = this.getVotes(state);
            if(votes[state.activePlayer] > votes[(3-state.activePlayer) as 1|2]) return [{type:'end'}]
        }
        if(state.cardPlayedThisTurn) return [{type:'end'}]
        return this.getCardMoves(state).filter((chain)=>{
            const cardNumber = Array.isArray(chain) ? chain[0].cardNumber : chain.cardNumber;
            if(!this.cardIndex[cardNumber]){
               throw new Error("Can't find card "+cardNumber)
            }
            const {effect} = (this.cardIndex[cardNumber] as EffectCard);
            if(effect?.constructor.name !== "ConditionalEffect") {
                return true;
            }
            const {condition} = (effect as ConditionalEffect)
            const playerKey = state.activePlayer === 1 ? 'playerOne' : 'playerTwo';
            return condition.resolveValue(state,{playerKey}, this)
        })
    }

    getDemographicVote(state:CardGameState, pos:{x:number, y:number}):1|2|undefined{
        const bPop = state.playerOne.popularity;
        const rPop = state.playerTwo.popularity;

        const bdistSquared = Math.pow(state.playerOne.position.x - pos.x, 2) +  Math.pow(state.playerOne.position.y - pos.y, 2)
        const rdistSquared = Math.pow(state.playerTwo.position.x - pos.x, 2) +  Math.pow(state.playerTwo.position.y - pos.y, 2)
        const rScore =  rPop/100.0 - rdistSquared;
        const bScore =  bPop/100.0 -  bdistSquared;

        if(bScore > rScore && bScore > 0.0) return 1;
        if(rScore > bScore && rScore > 0.0) return 2;
        return undefined;
    }

    getVotes(state:CardGameState):{1:number, 2:number}{
        const votes =  _.chain(state.demographics)
            .map(pos=>this.getDemographicVote(state, pos))
            .filter(_.identity)
            .countBy()
            .value() as {1:number, 2:number}
        return {
            1: votes[1]||0,
            2: votes[2]||0
        };
    }

    getStatus(state: CardGameState): GameStatus {
        if(state.roundsUntilElection > 0) return GameStatus.IN_PLAY;
        const votes = this.getVotes(state);
        if(votes[1] > votes[2]) return GameStatus.WIN;
        if(votes[1] < votes[2]) return GameStatus.LOSE;
        return GameStatus.DRAW;
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
            discardPile:[],
            board:[],
            capital: 3,
        }
        const preGame:CardGameState = {
            activePlayer: 1,
            roundsUntilElection: 4,
            demographics: new Array(50).fill(0).map(()=>({x:(Math.random()+Math.random())-1, y:Math.random()+Math.random()-1})),
            endRoundAfterThisTurn: false,
            cardPlayedThisTurn: false,
            step: 'play',
            isFirstTurn: true,
            playerOne:{
                ...newPlayer,
                deck: this.deckOne,
                popularity: 10,
                position:{x:0.2, y:0},
            },
            playerTwo:{
                deck: this.deckTwo,
                position:{x:-0.2, y:0},
                popularity: 10,
                ...newPlayer
            }
        };
        const blueDrawCardsEffect = new DrawCardEffect(resolveActivePlayer, CardGame.STARTING_HAND_SIZE - 1);
        const redDrawCardsEffect = new DrawCardEffect(resolveActivePlayer, CardGame.STARTING_HAND_SIZE);
        const p1Draw =  blueDrawCardsEffect.applyEffect(preGame,{playerKey: "playerOne"}, this);
        return redDrawCardsEffect.applyEffect(p1Draw,{playerKey: "playerTwo"}, this);
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

     getCardMoves(state: CardGameState):(CardGamePlayCardMove|[CardGamePlayCardMove,CardGameChoiceMove])[] {
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

    private onTurnEnd(state: CardGameState):CardGameState {
        const activePlayer = state.activePlayer === 1 ? 2 : 1;
        const playerKey = activePlayer  === 1 ? 'playerOne' : 'playerTwo';
        const roundEnding = state.endRoundAfterThisTurn;
        const afterRoundUpdateState =  roundEnding ? this.onRoundEnd(state) : state;
        const drawEffect = new DrawCardEffect(resolveOpponent,1);
        const afterDraw =  !roundEnding && !state.cardPlayedThisTurn ? drawEffect.applyEffectNoThrow(afterRoundUpdateState, {playerKey}, this) : afterRoundUpdateState;
        const afterTurnEndState:CardGameState =  {
            ...afterDraw,
            step: 'play',
            cardPlayedThisTurn: false,
            isFirstTurn: false,
            endRoundAfterThisTurn: !state.cardPlayedThisTurn && !roundEnding,
            activePlayer,
        }
        return this.processEvent(afterTurnEndState, 'turn_start',{player:playerKey})
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
            step: hand.length > CardGame.STARTING_HAND_SIZE ? 'draw' :'play',
            [playerKey]:{
                ...player,
                hand,
                discardPile
            }
        }
    }

    getHeuristic(state: CardGameState):number {
        const votes = this.getVotes(state)
        const bluePoints = votes[1] + 2 * state.playerOne.capital + 0.1 * state.playerOne.hand.length;
        const redPoints = votes[2] + 2 * state.playerOne.capital + 0.1 * state.playerOne.hand.length;
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

    private onRoundEnd(state: CardGameState):CardGameState {
        const updatePlayer = (player:CardGamePlayerState) => ({
            ...player,
            capital: player.capital + 1,
            hand: []
        })
        const newState = {
            ...state,
            endRoundIfNoCardPlayedThisTurn: false,
            roundsUntilElection: state.roundsUntilElection - 1,
            playerOne: updatePlayer(state.playerOne),
            playerTwo: updatePlayer(state.playerTwo),
        }
        if(state.roundsUntilElection === 1) return newState;
        const drawEffect = new DrawCardEffect(resolveActivePlayer, 6)
        return drawEffect.applyEffectNoThrow(drawEffect.applyEffectNoThrow(newState, {playerKey:'playerTwo'}, this), {playerKey:'playerOne'}, this);
    }

    getActiveActionChoice(state:CardGameState): ChoiceAction|undefined{
        if(state.cardBeingPlayed === undefined) return undefined;
        const card = this.cardIndex[state.cardBeingPlayed];
        if(!ChoiceActionCard.is(card)) throw new Error("Not a choice card!")
        return card.choiceAction
    }
}