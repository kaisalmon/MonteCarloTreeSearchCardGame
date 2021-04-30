import React, {CSSProperties, useEffect} from 'react';
import {Card, Icon} from "../cardgame/Card";
import _ from 'lodash';

function importAll(r:any) {
  const moduleArr =  r.keys().map((x:any)=>({
      key: x.match(/[\w-]*(?=\.png)/)[0],
      icon: r(x).default,
  }));
  return _.chain(moduleArr).keyBy('key').mapValues('icon').value();
}

const icons = importAll((require as any).context('./assets/icons', false, /\.(png)$/)) as Record<string, string>;

export type CardComponentProps = {
    style?:CSSProperties,
    card: Card,
    onClick:()=>void;
    isHidden:boolean,
}

const CARD_STYLE:CSSProperties = {
    boxSizing: 'border-box',
    display: 'inline-flex',
    backfaceVisibility: "hidden",
    border: '8px solid black',
    borderRadius: 20,
    fontFamily: "'Open Sans', sans-serif",
    fontSize: 11,
    padding: 8,
    width: 260,
    height: 400,
    zIndex: 0,
    transition: 'transform 0.3s',
    overflow: 'hidden',
    color: 'white',
    background: 'linear-gradient(0deg, rgba(53,62,62,1) 0%, rgba(34,34,34,1) 100%)'
};
const OUTLINE_WRAPPER_STYLE:CSSProperties = {
    border: '4px solid',
    padding: 12,
    display: 'inline-flex',
    flexDirection: 'column',
    borderRadius: 16,
    flexGrow: 1,
};
const BACKGROUND_ICONS_STYLE:CSSProperties = {
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    backgroundSize: '40px 40px',
    backgroundRepeat: 'repeat',
    opacity: 0.05,
    transform: 'rotate(-30deg)',
    transformOrigin: 'center center',
}
const BACKFACE_STYLE:CSSProperties = {
    boxSizing: 'border-box',
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: 'lightgray',
    border: '8px solid black',
    borderRadius: 20,
    width: 260,
    height: 400,
    zIndex: -1,
    transition: 'transform 0.3s',
}
const CARD_TITLE_STYLE:CSSProperties ={
    fontWeight: 'bold',
    fontFamily: 'Indie Flower',
    lineHeight: 1,
    height: 45,
    padding: 5,
    overflow: 'hidden',
    fontSize: 22,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
}
const CARD_COST_STYLE:CSSProperties = {
    ...CARD_TITLE_STYLE,
    fontSize: 18,
    height: 10
}
const CARD_TEXT_STYLE:CSSProperties = {
    flexGrow: 1,
    fontSize: 24,
    padding: 5,
    overflow: 'hidden',
    display: 'flex',
    textAlign: 'left',
}

const VERTICAL_CENTER_STYLE:CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
}

const HIDDEN_STYLE = {
    transform: 'rotate3d(0,1,0,180deg)'
}



function VerticalCenter(props:React.PropsWithChildren<{}>){
    return <div style={VERTICAL_CENTER_STYLE}>
        <div>
         {props.children}
        </div>
    </div>
}

export type HSV = [number, number, number];

export function IconComponent(props:{icon:Icon, hsv:HSV, size:string}){
    const {icon,hsv} = props;
    const iconName = typeof icon === 'string' ? icon : icon.icon;
    return <div style={{textAlign: 'center'}}>
        <img src={icons[iconName]} width={props.size} height={props.size}/>
    </div>
}

function TextFillSpace(props:React.PropsWithChildren<{style:CSSProperties}>){
    const ref = React.useRef<HTMLDivElement>(null);
    const [fontSize, setFontSize] = React.useState(props.style.fontSize);
    useEffect(()=>{
        if(!ref.current) return;
        let size = fontSize as number;
        for(let i = 0; i < 100 && (ref.current.clientHeight < ref.current.scrollHeight ||ref.current.clientWidth < ref.current.scrollWidth) ; i++){
            size -= 0.1;
            ref.current.style.fontSize = `${size}px`;
        }
        if(fontSize!=size){
            ref.current.style.fontSize = `${size}px`;
            setFontSize(size);
        }
    },[ref.current, ref]);

    return <div style={{...props.style, fontSize}} ref={ref}>
        {props.children}
    </div>
}

const CardComponent = (props:CardComponentProps) => {
    const rotationStyle = {...(props.isHidden ? HIDDEN_STYLE : {})};
    const icon = React.useMemo(()=>props.card.getIcon(), [props.card]);
    const iconName = typeof icon === 'string' ? icon : icon.icon;
    const backgroundImage = `url(${icons[iconName]})`;
    const hsv:HSV = [180, 70, 50];
    return <div style={{position:'relative', overflow:'hidden', ...props.style}} onClick={props.onClick}>
        <div style={{...rotationStyle, ...CARD_STYLE, }}>
           <div style={{...BACKGROUND_ICONS_STYLE, backgroundImage}}/>
           <div style={OUTLINE_WRAPPER_STYLE}>
               {props.card.cost !== 0 && <div style={CARD_COST_STYLE}>
                   {Array(props.card.cost + 1).join('🟆')}
               </div>}
                <TextFillSpace style={CARD_TITLE_STYLE}>
                    <div>
                        {props.card.getName()}
                    </div>
                </TextFillSpace>
            <VerticalCenter>
                    <IconComponent icon={icon} hsv={hsv} size="120px"/>
            </VerticalCenter>
            <TextFillSpace style={CARD_TEXT_STYLE}>
                <VerticalCenter>
                    {props.card.getText()}
                </VerticalCenter>
            </TextFillSpace>
           </div>
        </div>
        <div style={{...BACKFACE_STYLE, ...rotationStyle}}/>
    </div>
}

export default CardComponent;