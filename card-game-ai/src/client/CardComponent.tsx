import React, {CSSProperties, useEffect} from 'react';
import {Card} from "../cardgame/Card";
import {Property} from "../../node_modules.deltemetoo/csstype";
export type CardComponentProps = {
    style?:CSSProperties,
    card: Card,
    onClick:()=>void;
    isHidden:boolean,
}

const CARD_STYLE:CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'column',
    backfaceVisibility: "hidden",
    backgroundColor: 'white',
    border: '4px solid black',
    fontFamily: "'Open Sans', sans-serif",
    fontSize: 11,
    borderRadius: 10,
    width: 130,
    height: 200,
    zIndex: 0,
    transition: 'transform 0.3s',
}
const BACKFACE_STYLE:CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: 'lightgray',
    border: '4px solid black',
    borderRadius: 10,
    width: 130,
    height: 200,
    zIndex: -1,
    transition: 'transform 0.3s',
}
const CARD_TITLE_STYLE:CSSProperties ={
    fontWeight: 'bold',
    color: 'gold',
    textShadow: '0 0 2px black, 0 0 2px black, 0 0 4px black, 0 0 2px black, 0 0 2px black, 0 0 2px black, 0 0 2px black, 0 0 2px black, 0 0 2px black, 0 0 2px black',
    fontFamily: 'Indie Flower',
    lineHeight: 1,
    height: 55,
    padding: 5,
    paddingTop: 10,
    overflow: 'hidden',
    fontSize: 22,
}
const CARD_TEXT_STYLE:CSSProperties = {
    flexGrow: 1,
    fontSize: 15,
    padding: 5,
    overflow: 'hidden',
    display: 'flex',
    textAlign: 'left',
}

const VERTICAL_CENTER_STYLE:CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around'
}

const HIDDEN_STYLE = {
    transform: 'rotate3d(0,1,0,180deg)'
}

const COST_WRAPPER_STYLE:CSSProperties= {
    display: 'inline-block',
    position: 'relative',
    width: 35,
    fontSize: 30,
}
const COST_STYLE:CSSProperties ={
    position: 'absolute',
    color: 'black',
    textShadow: 'none',
    fontFamily: "'Open Sans', sans-serif",
    fontSize: 15,
    top: 5,
    left: 10
}

function VerticalCenter(props:React.PropsWithChildren<{}>){
    return <div style={VERTICAL_CENTER_STYLE}>
        <div>
         {props.children}
        </div>
    </div>
}

function TextFillSpace(props:React.PropsWithChildren<{style:CSSProperties}>){
    const ref = React.useRef<HTMLDivElement>(null);
    const [fontSize, setFontSize] = React.useState(props.style.fontSize);
    useEffect(()=>{
        if(!ref.current) return;
        let size = fontSize as number;
        let i = 0;
        for(let i = 0; i < 100 && (ref.current.clientHeight < ref.current.scrollHeight ||ref.current.clientWidth < ref.current.scrollWidth) ; i++){
            size -= 0.1;
            ref.current.style.fontSize = `${size}px`;
        }
        if(fontSize!=size){
            ref.current.style.fontSize = `${size}px`;
            setFontSize(size);
        }
    })

    return <div style={{...props.style, fontSize}} ref={ref}>
        {props.children}
    </div>
}

const CardComponent = (props:CardComponentProps) => {
    const rotationStyle = {...(props.isHidden ? HIDDEN_STYLE : {})};
    return <div style={{position:'relative', ...props.style}} onClick={props.onClick}>
        <div style={{...rotationStyle, ...CARD_STYLE}}>
            <TextFillSpace style={CARD_TITLE_STYLE}>
                    <div style={{display:'flex'}}>

                <VerticalCenter>
                        <div>
                             {props.card.getName()}
                        </div>
                </VerticalCenter>
                        <div style={COST_WRAPPER_STYLE}>
                            🟆
                            <div style={COST_STYLE}>
                                {props.card.cost}
                            </div>
                        </div>
                    </div>
            </TextFillSpace>
            <TextFillSpace style={CARD_TEXT_STYLE}>
                <VerticalCenter>
                    {props.card.getText()}
                </VerticalCenter>
            </TextFillSpace>
        </div>
        <div style={{...BACKFACE_STYLE, ...rotationStyle}}/>
    </div>
}

export default CardComponent;