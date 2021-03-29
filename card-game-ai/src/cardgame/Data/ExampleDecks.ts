import setup from '../Components/setup';
import {Card, ChoiceActionCard, EffectCard, ItemCard} from "../Card";
import TextTemplate from "../Components/TextTemplate";

const cardText = [
    'Deal one damage to your opponent',
    'Deal two damage to your opponent',
    'Deal three damage to your opponent and deal one damage to yourself',
    'Deal one damage to yourself then draw a card',
    'Deal one damage to yourself then draw a card',
    'You gain one health',
    'You gain one health and draw a card',
    'Your opponent discards the top card from their deck',
    'Discard the top card from your deck, then you gain two health',
    'Deal two damage to your opponent',
    'Deal three damage to your opponent',
    'Deal three damage to your opponent if they have less than ten health',
    'If you have less than eight health, gain 3 health',
    'If you have less than two cards in your hand, draw two cards',
    'Draw two random cards from your discard pile',
]

const abilityCardText = [
    'Whenever your opponent takes damage, if you have less than 2 cards in your hand, draw a card',
  //  'At the start of your turn, gain one health',
]

const choiceCards = [
    'Choose a player. That player draws 2 cards',
]

export default function():Record<number, Card>{
    if(Object.values(TextTemplate.templates).some(arr=>arr.length === 0)) {
        throw new Error("Text Templates not setup")
    }
   return [
       ...[...cardText, ...cardText].map((text, i) => {
            const effect = TextTemplate.parse('Eff', text);
            return new EffectCard(effect, text, `Card ${i}`, i);
        }),
        ...abilityCardText.map((text, i) => {
            const ability = TextTemplate.parse('Ability', text);
            const n = 2*cardText.length + i;
            return new ItemCard(ability, text, `Card ${n}`, n);
        }),

        ...choiceCards.map((text, i) => {
            const n = 2*cardText.length + abilityCardText.length +  i;
            const choice = TextTemplate.parse('ChoiceAction', text);
            return new ChoiceActionCard(choice, text, `Card ${n}`, n);
        }),
   ]
}