import TextTemplate, {Effect, PlayerTarget} from "../../TextTemplate";
import {CardGameState} from "../../CardGame";
import {PlayerKey} from "../../Card";
import {resolveSelf} from "./setup";

class DrawCardEffect implements Effect{
    target:PlayerTarget
    constructor(target?:PlayerTarget) {
        this.target = target || resolveSelf;
    }

    applyEffect(state: CardGameState, playerKey:PlayerKey): CardGameState {
        const targetKey = this.target.resolvePlayerKey(state, playerKey);
        const player = state[targetKey];
        const deck = [...player.deck];
        const hand = [...player.hand];
        const drawIndex = Math.floor(Math.random() * deck.length);
        hand.push(...deck.splice(drawIndex, 1))
        return {
            ...state,
            [targetKey]:{
                ...player,
                hand,
                deck
            }
        }
    }
}

export default function setup(){
    new TextTemplate('Eff', '%Player draws? a card', (target:PlayerTarget)=>new DrawCardEffect(target));
    new TextTemplate('Eff', 'draw a card', ()=>new DrawCardEffect());
    new TextTemplate('Eff', 'draw the top card of your deck', ()=>new DrawCardEffect());
    new TextTemplate('Eff', 'draw a card from your deck', ()=>new DrawCardEffect());
}