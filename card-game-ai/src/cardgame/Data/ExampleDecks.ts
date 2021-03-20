import setup from '../Components/Effects/setup';
import {Card, EffectCard} from "../Card";
import TextTemplate from "../TextTemplate";

const cardText = [
    'Deal one damage to your opponent',
    'Deal two damage to your opponent',
    'Deal three damage to your opponent and deal one damage to yourself',
    'Deal one damage to yourself then draw a card',
    'Deal one damage to yourself then draw a card',
    'You gain three health',
    'You gain one health and you draw a card',
    'Your opponent discards the top card from their deck',
    'You lose ten health',
    'Discard the top card from your deck, then you gain four health',
]

export default function():Record<number, Card>{
    setup()
    return cardText.map(text=>{
        const effect = TextTemplate.parse('Eff', text);
        return new EffectCard(effect);
    })
}