import setupList from './ListEffect';
import setupDraw from './RandomTransferEffect';
import setupDamage from './ChangeHealthEffect';
import TextTemplate, {PlayerTarget} from "../../TextTemplate";
import {PlayerKey} from "../../Card";
import numberToWords from 'number-to-words';

export const resolveSelf:PlayerTarget = {
    resolvePlayerKey(_, playerKey: PlayerKey):PlayerKey {
        return playerKey;
    }
}
const resolveOpponent:PlayerTarget = {
    resolvePlayerKey(_, playerKey: PlayerKey):PlayerKey {
        return playerKey === 'playerOne' ? 'playerTwo' : 'playerOne';
    }
}


export default function () {
    for(let n = 0; n < 25;n++){
        new TextTemplate('N',numberToWords.toWords(n),()=>n)
        new TextTemplate('N',`${n}`,()=>n)
    }
    new TextTemplate('Player','yourself',()=>resolveSelf)
    new TextTemplate('Player','you',()=>resolveSelf)
    new TextTemplate('Player','your opponent',()=>resolveOpponent)
    new TextTemplate('Player','the other player',()=>resolveOpponent)
    setupList();
    setupDraw();
    setupDamage();
}