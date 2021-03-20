import TextTemplate, {Effect} from "../../TextTemplate";
import {CardGameState} from "../../CardGame";
import {PlayerKey} from "../../Card";

class ListEffect implements Effect{
    a:Effect;
    b:Effect;
    constructor(a:Effect, b:Effect) {
        this.a = a;
        this.b = b;
    }
    applyEffect(state: CardGameState, playerKey:PlayerKey): CardGameState {
        const afterA = this.a.applyEffect(state, playerKey);
        return this.b.applyEffect(afterA, playerKey);
    }
}

export default function setup(){
    new TextTemplate('Eff', '%Eff and %Eff', (a:Effect, b:Effect)=>new ListEffect(a,b));
    new TextTemplate('Eff', '%Eff, and %Eff', (a:Effect, b:Effect)=>new ListEffect(a,b));
    new TextTemplate('Eff', '%Eff, %Eff', (a:Effect, b:Effect)=>new ListEffect(a,b));
    new TextTemplate('Eff', '%Eff then %Eff', (a:Effect, b:Effect)=>new ListEffect(a,b));
    new TextTemplate('Eff', '%Eff, then %Eff', (a:Effect, b:Effect)=>new ListEffect(a,b));
}