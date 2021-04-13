import setupList from './Effects/ListEffect';
import setupDraw from './Effects/RandomTransferEffect';
import setupDamage from './Effects/ChangePlayerValue';
import setupConditional from './Effects/ConditionalEffect'
import setupLessThan from './GameConditions/PlayerLessThanCondition'
import {setup as setupEventAbilities} from './Abilities/OnEventAbility'
import TextTemplate, {ExecutionContext, PlayerTarget} from "./TextTemplate";
import {PlayerKey} from "../Card";
import numberToWords from 'number-to-words';
import {setupChooseAPlayer} from "./ChoiceActions/ChooseAPlayer";
import {setupMoveDemographics} from './Effects/MoveDemographicEffect'
import {setupMovePlayer} from "./Effects/MovePlayerEffect";
import {setupChooseAnExtreme} from "./ChoiceActions/ChooseAnExtreme";
import {setupChooseOne} from "./ChoiceActions/ChooseOne";
import setupPlayerPositionCondition from "./GameConditions/PlayerPositionCondition";

export interface HasTarget{
    target: PlayerTarget;
}

export function hasTarget(x:any):x is HasTarget{
    return x.hasOwnProperty("target");
}

export const resolveActivePlayer:PlayerTarget = {
    resolveValue(_, ctx:ExecutionContext):PlayerKey {
        ctx.lastPlayer = ctx.playerKey;
        return ctx.playerKey;
    }
}
export const resolveOpponent:PlayerTarget = {
    resolveValue(_, ctx):PlayerKey {
        const target =  ctx.playerKey === 'playerOne' ? 'playerTwo' : 'playerOne';
        ctx.lastPlayer = target;
        return target;
    }
}
export const resolvePlayerContextually:PlayerTarget = {
    resolveValue(_, ctx):PlayerKey {
        return ctx.lastPlayer || ctx.playerKey
    }
}


export default function () {
        new TextTemplate('N',`a`,()=>1)
    for(let n = 0; n < 25;n++){
        new TextTemplate('N',numberToWords.toWords(n),()=>n)
        new TextTemplate('N',`${n}`,()=>n)
    }
    new TextTemplate('Player','yourself',()=>resolveActivePlayer)
    new TextTemplate('Player','you',()=>resolveActivePlayer)
    new TextTemplate('Player','your',()=>resolveActivePlayer)
    new TextTemplate('Player','your opponent',()=>resolveOpponent)
    new TextTemplate('Player','your opponent\'?s',()=>resolveOpponent)
    new TextTemplate('Player','the other player',()=>resolveOpponent)
    new TextTemplate('Player','they',()=>resolvePlayerContextually)
    new TextTemplate('Player','them',()=>resolvePlayerContextually)
    new TextTemplate('Player','their',()=>resolvePlayerContextually)
    new TextTemplate('Player','that player',()=>resolvePlayerContextually)
    new TextTemplate('Player','',()=>resolvePlayerContextually)
    setupList();
    setupDraw();
    setupDamage();
    setupConditional();
    setupLessThan();
    setupEventAbilities();
    setupMoveDemographics();
    setupChooseAPlayer();
    setupMovePlayer();
    setupChooseAnExtreme();
    setupChooseOne()
    setupPlayerPositionCondition()
}