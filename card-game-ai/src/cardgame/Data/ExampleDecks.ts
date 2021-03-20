import setup from '../Components/Effects/setup';
import {Card, EffectCard} from "../Card";
import TextTemplate from "../TextTemplate";

const cardText = [
    'Deal one damage to your opponent',
    'Deal two damage to your opponent',
    'Deal three damage to your opponent and deal one damage to yourself',
    'Deal one damage to yourself then draw a card',
]

export default function():Card[]{
    setup()
    return cardText.map(text=>{
        const effect = TextTemplate.parse('Eff', text);
        return new EffectCard(effect);
    })
}