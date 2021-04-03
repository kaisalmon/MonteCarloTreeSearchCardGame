import React, {CSSProperties, FunctionComponent} from "react";
import {Card, ChoiceActionCard} from "../cardgame/Card";
import ChoiceArrow from "./ChoiceArrow";
import ReactHoverDelayTrigger from 'react-hover-delay-trigger'
import CardGame, {CardGameMove, CardGameState} from "../cardgame/CardGame";
import DelayHover from "./DelayHover";
import {ChooseOne} from "../cardgame/Components/ChoiceActions/ChooseOne";

type CardProps = {
    card:Card,
    onClick:()=>void,
    setPreview:(move?:CardGameMove)=>void,
    gamestate:CardGameState;
    game:CardGame;
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

const CHOICE_BUBBLE_STYLE = {
    display: 'inline-block',
    margin: 5,
    background: 'rgba(255, 128, 0, 0.5)',
    padding: 20,
    borderRadius: 15
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
    const onClick = props.canBeDiscarded || props.canBePlayed ? props.onClick : () => {};

    const activeChoice = props.game.getActiveActionChoice(props.gamestate) as ChooseOne|undefined;
    const chooseOneActive = activeChoice?.constructor === ChooseOne;
    const choiceTexts:string[] = activeChoice && activeChoice.constructor === ChooseOne ? [activeChoice.aText, activeChoice.bText] : []

    return <DelayHover
            delay={400}
            handleHoverTrigger={()=>{
                if(props.canBePlayed){
                    props.setPreview({type:'play', cardNumber:props.card.cardNumber})
                }
            }}
            handleHoverCancel={()=>{
                props.setPreview()
            }}
          >
        <div style={{...WRAPPER_STYLE, ...positionStyling}}>
            {<div style={{
                position: 'absolute',
                top:-200,
                left: -150,
                width: 300,
                transition:'opacity 0.4s',
                opacity: props.beingPlayed && chooseOneActive ? 1 : 0,
            }}>
                {[1,2].map(i=>
                    <div style={CHOICE_BUBBLE_STYLE} className={'glow'}>
                        {choiceTexts[i-1]}
                    </div>
                )}
            </div>}
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
        </DelayHover>
}

export default CardDisplay;