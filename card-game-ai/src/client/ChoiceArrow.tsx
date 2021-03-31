import React, {CSSProperties, useEffect} from 'react'

const ARROW_STYLE:CSSProperties= {
    boxSizing: 'border-box',
    position:'absolute',
    background: 'red',
    width: 14,
    zIndex: 1,
    left: 10,
    top: 90,
    marginBottom: 100,
    transformOrigin:'top',
    display: 'flex',
    flexDirection: "column-reverse",
    alignItems: "center"
}

const HEAD_STYLE:CSSProperties= {
    position: 'relative',
    top: 10,
    borderLeft: '20px solid transparent',
    borderRight: '20px solid transparent',
    borderTop: '20px solid red',
    cursor: 'none'
}

const XOFFSET = 20;
const YOFFSET = -45;

const ChoiceArrow:React.FunctionComponent = ()=>{
    const [height, setHeight] = React.useState(100)
    const [theta, setTheta] = React.useState(45)
    const element = React.useRef<HTMLDivElement>(null);
    const dynamicStyle:CSSProperties = {
        height,
        transform: `rotate(${theta}rad)`
    }

    useEffect(()=>{
        const listener = (event:MouseEvent)=>{
            if(!element.current) return;
            const domRect = element.current.getBoundingClientRect();
            const deltaX = event.clientX - domRect.x - XOFFSET;
            const deltaY = event.clientY - domRect.y - YOFFSET;
            const theta = Math.atan2(-deltaX, deltaY);
            const height = Math.sqrt(deltaX*deltaX+deltaY*deltaY)

            setTheta(theta)
            setHeight(height)
        };
        window.addEventListener('mousemove',listener)
        return ()=>window.removeEventListener('mousemove', listener)
    },[element])
    return <div  ref={element}>
        <div style={{...ARROW_STYLE, ...dynamicStyle}}>
            <div style={HEAD_STYLE}/>
        </div>
    </div>
}

export default ChoiceArrow;