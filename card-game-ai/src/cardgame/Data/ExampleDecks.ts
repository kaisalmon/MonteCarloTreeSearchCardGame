
import parse from 'csv-parse/lib/sync'
import {Card, ChoiceActionCard, EffectCard, ItemCard} from "../Card";
import TextTemplate from "../Components/TextTemplate";
import ExampleDeckCsv from './ExampleDeck.json'

type RawCard = {
    name: string,
    text: string,
    type: 'effect'|'choice'|'policy'
    cost: number
}

function parseCard(raw:RawCard, cardNumber:number):Card {
    const {name, text, cost, type} = raw;
    if(type === 'effect'){
        const effect = TextTemplate.parse('Eff', text);
        return new EffectCard(effect, text, name, cardNumber, cost);
    }else if(type === 'choice'){
        const effect = TextTemplate.parse('ChoiceAction', text);
        return new ChoiceActionCard(effect, text, name, cardNumber, cost);
    }else if(type === 'policy'){
        const ability = TextTemplate.parse('Ability', text);
        return new ItemCard(ability, text, name, cardNumber, cost);
    }
    throw new Error("Unknown Card Type "+type)
}


function getExampleDeck():Record<number, Card>{
    if(Object.values(TextTemplate.templates).some(arr=>arr.length === 0)) {
        throw new Error("Text Templates not setup")
    }
    const rawCards:RawCard[] = ExampleDeckCsv as RawCard[];
    return [1,2,3].flatMap(_=>rawCards).map(parseCard)
}


export default getExampleDeck;