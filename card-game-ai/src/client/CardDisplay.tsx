import React, {CSSProperties, FunctionComponent} from "react";
import {Card} from "../cardgame/Card";

type CardProps = {
    card:Card,
    onClick:()=>void,
    beingPlayed:boolean;
    canBeDiscarded:boolean;
    canBePlayed:boolean;
}

const CARD_STYLE:CSSProperties ={
    backgroundColor: 'white',
    border: '1px solid black',
    fontSize: 11,
    borderRadius: 3,
    width: 80,
    height: 120,
    margin: 5,
    display: 'inline-block',
    transition: 'transform 0.3s',
    cursor: 'not-allowed'
}
const CARD_TITLE_STYLE:CSSProperties ={
    fontWeight: 'bold',
    fontSize: 16,
}
const BEING_PLAYED_CARD_STYLE = {
    ...CARD_STYLE,
    color: 'blue',
    transform: "scale(1.1)"
}
const CAN_BE_DISCADED_STYLE = {
    ...CARD_STYLE,
    borderColor: 'red',
    cursor: 'pointer'
}
const CAN_BE_PLAYED_STYLE = {
    ...CARD_STYLE,
    borderColor: 'blue',
    cursor: 'pointer'
}

const CardDisplay:FunctionComponent<CardProps> = (props)=>{
    const {card, beingPlayed} = props;
    const situationalStyle = props.canBeDiscarded ? CAN_BE_DISCADED_STYLE :
                            props.canBePlayed ? CAN_BE_PLAYED_STYLE :
                                {};
    const onClick = props.canBeDiscarded || props.canBePlayed ? props.onClick : ()=>{};
    return <div style={{...beingPlayed ? BEING_PLAYED_CARD_STYLE : CARD_STYLE, ...situationalStyle}} onClick={onClick}>
        <div style={CARD_TITLE_STYLE}>
            {card.getName()}
        </div>
          <div>
            {card.getText()}
        </div>
    </div>
}

export default CardDisplay;