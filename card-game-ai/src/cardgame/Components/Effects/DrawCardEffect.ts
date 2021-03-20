import TextTemplate, {Effect} from "../../TextTemplate";
import {CardGameState} from "../../CardGame";
import {PlayerKey} from "../../Card";

class DrawCardEffect implements Effect{
    applyEffect(state: CardGameState, playerKey:PlayerKey): CardGameState {
        const player = state[playerKey];
        const deck = [...player.deck];
        const hand = [...player.hand];
        const drawIndex = Math.floor(Math.random() * deck.length);
        hand.push(...deck.splice(drawIndex, 1))
        return {
            ...state,
            [playerKey]:{
                ...player,
                hand,
                deck
            }
        }
    }
}

export default function setup(){
    new TextTemplate('Eff', 'draw a card', ()=>new DrawCardEffect());
    new TextTemplate('Eff', 'draw the top card of your deck', ()=>new DrawCardEffect());
    new TextTemplate('Eff', 'draw a card from your deck', ()=>new DrawCardEffect());
}