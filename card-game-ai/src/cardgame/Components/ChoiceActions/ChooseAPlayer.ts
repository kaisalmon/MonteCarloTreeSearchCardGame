import TextTemplate, {ChoiceAction, Effect, ExecutionContext, Resolver} from "../TextTemplate";
import CardGame, {CardGameChoiceMove, CardGameState} from "../../CardGame";

export class ChooseAPlayer implements ChoiceAction{
    eff:Effect;
    constructor(eff:Effect) {
        this.eff = eff;
    }

    applyEffect(move: CardGameChoiceMove, state: CardGameState, ctx: ExecutionContext, game: CardGame): CardGameState {
        return this.eff.applyEffect(state, {
            ...ctx,
            lastPlayer: move.choice === 1 ? 'playerOne' : 'playerTwo'
        }, game)
    }

    getChoices(state: CardGameState, ctx:ExecutionContext, game: CardGame):CardGameChoiceMove[]{
        return [{type: 'choice', choice:1}, {type: 'choice', choice: 2}];
    }

}

export function setupChooseAPlayer(){
    new TextTemplate('ChoiceAction', 'Choose a player. %Eff', (eff:Effect)=> new ChooseAPlayer(eff))
}