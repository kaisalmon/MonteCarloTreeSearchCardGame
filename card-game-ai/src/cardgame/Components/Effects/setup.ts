import setupList from './ListEffect';
import setupDraw from './RandomTransferEffect';
import setupDamage from './ChangeHealthEffect';
import TextTemplate, {PlayerTarget} from "../TextTemplate";
import {PlayerKey} from "../../Card";
import numberToWords from 'number-to-words';

export const resolveActivePlayer:PlayerTarget = {
    resolvePlayerKey(_, ctx):PlayerKey {
        ctx.lastPlayer = ctx.playerKey;
        return ctx.playerKey;
    }
}
export const resolveOpponent:PlayerTarget = {
    resolvePlayerKey(_, ctx):PlayerKey {
        const target =  ctx.playerKey === 'playerOne' ? 'playerTwo' : 'playerOne';
        ctx.lastPlayer = target;
        return target;
    }
}
const resolvePlayerContextually:PlayerTarget = {
    resolvePlayerKey(_, ctx):PlayerKey {
        return ctx.lastPlayer || ctx.playerKey
    }
}


export default function () {
    for(let n = 0; n < 25;n++){
        new TextTemplate('N',numberToWords.toWords(n),()=>n)
        new TextTemplate('N',`${n}`,()=>n)
    }
    new TextTemplate('Player','yourself',()=>resolveActivePlayer)
    new TextTemplate('Player','you',()=>resolveActivePlayer)
    new TextTemplate('Player','your opponent',()=>resolveOpponent)
    new TextTemplate('Player','the other player',()=>resolveOpponent)
    new TextTemplate('Player','they',()=>resolvePlayerContextually)
    new TextTemplate('Player','them',()=>resolvePlayerContextually)
    new TextTemplate('Player','',()=>resolvePlayerContextually)
    setupList();
    setupDraw();
    setupDamage();
}