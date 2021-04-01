import React, {CSSProperties, FunctionComponent} from "react";
import {Card, ChoiceActionCard} from "../cardgame/Card";
import ChoiceArrow from "./ChoiceArrow";

type CardProps = {
    card:Card,
    onClick:()=>void,
    isOpponent:boolean;
    beingPlayed:boolean;
    canBeDiscarded:boolean;
    canBePlayed:boolean;
    isHidden:boolean;
    onBoard:boolean;
}

const CARD_STYLE:CSSProperties = {
    backgroundColor: 'white',
    borderWidth: '1px',
    borderColor:'black',
    borderStyle: 'solid',
    fontSize: 11,
    borderRadius: 3,
    width: 80,
    height: 120,
    marginLeft: 5,
    marginTop: 5,
    marginRight: 5,
    marginBottom: 5,
    top:0,
    display: 'inline-block',
    transition: 'transform 0.3s, margin 0.35s ease-in 0.3s, top 0.4s ease-in-out 0.5s',
    cursor: 'not-allowed',
    overflow: 'hidden',
    zIndex: 0,
}
const CARD_TITLE_STYLE:CSSProperties ={
    fontWeight: 'bold',
    fontSize: 16,
}
const BEING_PLAYED_CARD_STYLE = {
    ...CARD_STYLE,
    color: 'blue',
    borderColor: 'black',
    transform: "scale(1.3)",
    marginLeft: -40,
    marginRight: -40,
    zIndex: 1,
}
const CAN_BE_DISCADED_STYLE = {
    ...CARD_STYLE,
    borderColor: 'red',
    borderWidth: 3,
    cursor: 'pointer'
}
const CAN_BE_PLAYED_STYLE = {
    ...CARD_STYLE,
    borderColor: 'blue',
    borderWidth: 3,
    cursor: 'pointer',
}

const MOVE_DOWN_STYLE = {
    top: 160,
}
const MOVE_UP_STYLE = {
    top: -160,
}

const HIDDEN_STYLING = {
    backgroundColor: 'darkgray',
    color: 'darkgray',
    transform: 'rotate3d(0,1,0,0.5turn)'
}

const VANISHED_STYLE = {
    transform: 'scale(0)'
}

const WRAPPER_STYLE:CSSProperties = {
    position: "relative",
     transition: 'transform 0.3s, margin 0.35s ease-in 0.3s, top 0.4s ease-in-out 0.5s',
   display:'inline-block',
    top:0,
    zIndex: 1,
}

const CardDisplay:FunctionComponent<CardProps> = (props)=> {
    const [hasAppearedOnBoard, setHasAppearedOnBoard] = React.useState(props.onBoard && !props.beingPlayed)
    React.useEffect(() => {
        if (props.onBoard && props.beingPlayed) {
            const n = setTimeout(() => {
                setHasAppearedOnBoard(true)
            }, 800)
            return () => window.clearTimeout(n)
        } else if (props.onBoard && !props.beingPlayed) {
            const n = setTimeout(() => {
                setHasAppearedOnBoard(false)
            }, 800)
            return () => window.clearTimeout(n)
        }
    })


    const {card, beingPlayed} = props;
    const situationalStyle = props.canBeDiscarded ? CAN_BE_DISCADED_STYLE :
        props.canBePlayed ? CAN_BE_PLAYED_STYLE :
            hasAppearedOnBoard ? VANISHED_STYLE :
                {};
    const positionStyling = (props.beingPlayed && props.isOpponent) ? MOVE_DOWN_STYLE :
        (props.beingPlayed && !props.isOpponent) ? MOVE_UP_STYLE :
            {};
    const hiddenStyling = props.isHidden ? HIDDEN_STYLING : {}
    const onClick = props.canBeDiscarded || props.canBePlayed ? props.onClick : () => {
    };

    return <div style={{...WRAPPER_STYLE, ...positionStyling}}>
        <div style={{...beingPlayed ? BEING_PLAYED_CARD_STYLE : CARD_STYLE, ...situationalStyle, ...hiddenStyling}}
             onClick={onClick}>
            <div style={CARD_TITLE_STYLE}>
                {card.getName()}
            </div>
            <div>
                {card.getText()}
            </div>
        </div>
        {props.beingPlayed && ChoiceActionCard.is(card) && !props.isOpponent && <ChoiceArrow/>}
    </div>
}

export default CardDisplay;