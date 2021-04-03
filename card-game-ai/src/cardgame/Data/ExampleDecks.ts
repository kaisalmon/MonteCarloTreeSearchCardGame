import setup from '../Components/setup';
import {Card, ChoiceActionCard, EffectCard, ItemCard} from "../Card";
import TextTemplate from "../Components/TextTemplate";
import _ from 'lodash'

const cardText:Record<number, string>= {
    1: 'All demographics shift towards the hearts extreme',
    2: 'All demographics shift towards the diamonds extreme',
    3: 'All demographics shift towards the clubs extreme',
    4: 'All demographics shift towards the spades extreme',
    5: 'You shift towards the hearts extreme. Gain one popularity',
    6: 'You shift towards the spades extreme. Your opponent loses one popularity',
    7: 'You shift towards the diamonds extreme. Draw a card',
    8: 'You shift towards the clubs extreme. Your opponent discards a random card',
    9: 'Gain two popularity',
    10:'Lose one popularity, your followers shift towards you',
    11:'gain one popularity, your followers shift away from you',
    13: 'You shift towards the center',
    14:'Your followers shift towards your opponent, then their followers shift towards you',
    15:'Discard a random card, then shift towards your opponent',
    16:'Shift away from your opponent, then you draw a card',
};


const choiceText:Record<number, string>= {
    30:'Choose a player. That player draws 2 cards and loses 2 popularity',
    31:'Choose an extreme. All demographics shift towards that extreme',
    32:'Choose an extreme. Shift towards that extreme',
    33:'Choose an extreme. Gain one popularity and shift towards that extreme',
    //34:'Choose one: all demographics shift towards the spades extreme or gain one political capital'
};

 function getExampleDeck():Record<number, Card>{
    if(Object.values(TextTemplate.templates).some(arr=>arr.length === 0)) {
        throw new Error("Text Templates not setup")
    }
   const effectCards = parseCards(cardText, (text,cardNumber,i)=>{
        const effect = TextTemplate.parse('Eff', text);
        const specificCardNumber = parseInt(cardNumber)+i/10;
        return new EffectCard(effect, text, `Card #${cardNumber}`, specificCardNumber)
   })
    const choiceCards = parseCards(choiceText, (text,cardNumber,i)=>{
        const choiceAction = TextTemplate.parse('ChoiceAction', text);
        const specificCardNumber = parseInt(cardNumber)+i/10;
        return new ChoiceActionCard(choiceAction, text, `Card #${cardNumber}`, specificCardNumber)
   })

    return {...effectCards, ...choiceCards}
}

function parseCards(texts:Record<number, string>, factory:(...args:any)=>Card):Record<number, Card>{
     return _.chain([1,2,3])
       .flatMap(i=> Object.entries(texts)
           .map(([cardNumber,text])=>factory(text, cardNumber, i))
       ).keyBy('cardNumber')
       .value();
}

export default getExampleDeck;