import setupList from './ListEffect';
import setupDraw from './DrawCardEffect';
import setupDamage from './DamagePlayerEffect';
import TextTemplate, {PlayerTarget} from "../../TextTemplate";
import {PlayerKey} from "../../Card";

const resolveSelf:PlayerTarget = {
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
    new TextTemplate('Player','yourself',()=>resolveSelf)
    new TextTemplate('Player','you',()=>resolveSelf)
    new TextTemplate('Player','your opponent',()=>resolveOpponent)
    new TextTemplate('Player','the other player',()=>resolveOpponent)
    setupList();
    setupDraw();
    setupDamage();
}