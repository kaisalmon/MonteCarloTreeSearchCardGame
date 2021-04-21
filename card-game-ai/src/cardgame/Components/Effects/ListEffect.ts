import TextTemplate, {Effect, ExecutionContext} from "../TextTemplate";
import CardGame, {CardGameState} from "../../CardGame";
import {Icon, PlayerKey} from "../../Card";

export default class ListEffect extends Effect{
    a:Effect;
    b:Effect;
    constructor(a:Effect, b:Effect) {
        super();
        this.a = a;
        this.b = b;
    }
    applyEffect(state: CardGameState, ctx:ExecutionContext, game:CardGame): CardGameState {
        const afterA = this.a.applyEffect(state, ctx, game);
        return this.b.applyEffect(afterA, ctx, game);
    }

    getIcon(): Icon {
        return this.b.getIcon();
    }
}

export function setupListEffects(){
    new TextTemplate('Eff', '%Eff and %Eff', (a:Effect, b:Effect)=>new ListEffect(a,b));
    new TextTemplate('Eff', '%Eff, and %Eff', (a:Effect, b:Effect)=>new ListEffect(a,b));
    new TextTemplate('Eff', '%Eff, %Eff', (a:Effect, b:Effect)=>new ListEffect(a,b));
    new TextTemplate('Eff', '%Eff twice', (a:Effect)=>new ListEffect(a,a));
    new TextTemplate('Eff', '%Eff\\. %Eff', (a:Effect, b:Effect)=>new ListEffect(a,b));
    new TextTemplate('Eff', '%Eff then %Eff', (a:Effect, b:Effect)=>new ListEffect(a,b));
    new TextTemplate('Eff', '%Eff, then %Eff', (a:Effect, b:Effect)=>new ListEffect(a,b));
}