import setup from '../Components/setup';
import {Card, ChoiceActionCard, EffectCard, ItemCard} from "../Card";
import TextTemplate from "../Components/TextTemplate";

const cardText:string[] = [
    'All demographics shift towards the hearts extreme',
    'All demographics shift towards the diamonds extreme',
    'All demographics shift away from the clubs extreme',
    'All demographics shift towards the spades extreme',
    'All demographics shift towards the centre',
    'All demographics shift towards you',
    'All demographics shift away from the center',
    'All demographics shift away from your opponent',
    'You shift away from your opponent',
    'You shift towards the center and gain 3 popularity',
    'Gain one popularity',
]

const abilityCardText:string[] = [
   // 'Whenever your opponent takes damage, if you have less than 2 cards in your hand, draw a card',
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