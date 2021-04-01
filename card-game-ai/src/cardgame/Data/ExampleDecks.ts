import setup from '../Components/setup';
import {Card, ChoiceActionCard, EffectCard, ItemCard} from "../Card";
import TextTemplate from "../Components/TextTemplate";

const cardText:string[] = [
    'All demographics shift towards the hearts extreme',
    'All demographics shift towards the diamonds extreme',
    'All demographics shift towards the clubs extreme',
    'All demographics shift towards the spades extreme',
    'You shift towards the hearts extreme. Gain one popularity',
    'You shift towards the spades extreme. Your opponent loses one popularity',
    'You shift towards the diamonds extreme. Draw a card',
    'You shift towards the clubs extreme. Your opponent discards a random card',
    'Gain three popularity',
    'Lose two popularity, your followers shift towards you',
    'gain three popularity, your followers shift away from you',
]

const abilityCardText:string[] = [
   // 'Whenever your opponent takes damage, if you have less than 2 cards in your hand, draw a card',
  //  'At the start of your turn, gain one health',
]

const choiceCards = [
    'Choose a player. That player draws 2 cards and loses 3 popularity',
    'Choose an extreme. All demographics shift towards that extreme',
    'Choose an extreme. Shift towards that extreme',
    'Choose an extreme. Gain one popularity and shift towards that extreme'
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