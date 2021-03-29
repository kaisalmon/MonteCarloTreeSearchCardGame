import React, {CSSProperties, useEffect} from 'react'

const ARROW_STYLE:CSSProperties= {
    position:'absolute',
    background: 'red',
    width: 14,
    zIndex: 1,
    left: 45,
    top: 90,
    transformOrigin:'top'
}

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
            const deltaX = event.clientX - domRect.x - 45;
            const deltaY = event.clientY - domRect.y - 90;
            const theta = Math.atan2(-deltaX, deltaY);
            const height = Math.sqrt(deltaX*deltaX+deltaY*deltaY)

            setTheta(theta)
            setHeight(height)
        };
        window.addEventListener('mousemove',listener)
        return ()=>window.removeEventListener('mousemove', listener)
    },[element])
    return <div  ref={element}>
        <div style={{...ARROW_STYLE, ...dynamicStyle}}/>
    </div>
}

export default ChoiceArrow;