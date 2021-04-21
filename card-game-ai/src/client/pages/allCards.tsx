
import setupEffects from "../../cardgame/Components/setup";
import React, {CSSProperties} from "react";
import getExampleDeck from "../../cardgame/Data/ExampleDecks";
import CardComponent from "../CardComponent";
import _ from 'lodash';

const STYLE:CSSProperties ={
    margin: 25,
    display: 'flex',
    flexWrap: 'wrap',
    alignContent: 'space-between',
    justifyContent: 'space-between'
}

const CARD_WRAPPER_STYLE:CSSProperties = {
    margin: 10,
}

function AllCards(){
    React.useMemo(setupEffects, []);
    const cards = React.useMemo(()=>Object.values(getExampleDeck()), [])
    return <div style={STYLE}>
        {cards.map((card, i)=>{
            return <div key={i} style={CARD_WRAPPER_STYLE}>
                <CardComponent
                    card={card}
                    onClick={_.noop}
                    isHidden={false}
                />
            </div>
        })}
    </div>
}

export default AllCards;