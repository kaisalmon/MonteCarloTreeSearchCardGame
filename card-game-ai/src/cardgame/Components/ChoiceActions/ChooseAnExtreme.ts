import TextTemplate, {ChoiceAction, Effect, ExecutionContext} from "../TextTemplate";
import CardGame, {CardGameChoiceMove, CardGameState} from "../../CardGame";
import {EXTREMES} from "../Effects/MoveDemographicEffect";
import {ContextualExtreme} from "./ContextualExtreme";

const EXTREMES_BY_ID = {
    1: EXTREMES.hearts,
    2: EXTREMES.clubs,
    3: EXTREMES.diamonds,
    4: EXTREMES.spades
};
export const ID_BY_EXTREME:Record<string, number> = {
    'hearts': 1,
    'clubs': 2,
    'diamonds':3,
    'spades': 4
}

export class ChooseAnExtreme implements ChoiceAction{
    eff:Effect;
    constructor(eff:Effect) {
        this.eff = eff;
    }

    applyEffect(move: CardGameChoiceMove, state: CardGameState, ctx: ExecutionContext, game: CardGame): CardGameState {
        return this.eff.applyEffect(state, {
            ...ctx,
            lastExtreme: EXTREMES_BY_ID[move.choice as 1|2|3|4]
        }, game)
    }

    getChoices(state: CardGameState, ctx:ExecutionContext, game: CardGame):CardGameChoiceMove[]{
        return [{type: 'choice', choice:1}, {type: 'choice', choice: 2},{type: 'choice', choice:3}, {type: 'choice', choice: 4}];
    }

}

export function setupChooseAnExtreme(){
    new TextTemplate('ChoiceAction', 'Choose an extreme. %Eff', (eff:Effect)=> new ChooseAnExtreme(eff))
    new TextTemplate('Position', 'that extreme', (e)=> new ContextualExtreme())
}