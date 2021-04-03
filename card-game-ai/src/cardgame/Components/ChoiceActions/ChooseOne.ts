import TextTemplate, {ChoiceAction, Effect, ExecutionContext, Resolver} from "../TextTemplate";
import CardGame, {CardGameChoiceMove, CardGameState} from "../../CardGame";

export class ChooseOne implements ChoiceAction{
    a:Effect;
    b:Effect;
    aText:string;
    bText: string;
    constructor(a:Effect, b:Effect, aText:string, bText: string) {
        this.a = a;
        this.b = b;
        this.aText = aText;
        this.bText = bText;
    }

    applyEffect(move: CardGameChoiceMove, state: CardGameState, ctx: ExecutionContext, game: CardGame): CardGameState {
        const eff = move.choice === 1 ? this.a : this.b;
        return eff.applyEffect(state, ctx, game)
    }

    getChoices(state: CardGameState, ctx:ExecutionContext, game: CardGame):CardGameChoiceMove[]{
        return [{type: 'choice', choice:1}, {type: 'choice', choice: 2}];
    }
}

export function setupChooseOne(){
    new TextTemplate('ChoiceAction', 'Choose one: %Eff or %Eff', (a:Effect, b:Effect, [aText, bText]:string[])=> new ChooseOne(a, b, aText, bText))
}