import React, {useState} from "react";

type ReactHoverDelayTriggerProps = React.PropsWithChildren< {
    delay: number,
    className?:string,
    handleHoverTrigger: ()=>void,
    handleHoverCancel: ()=>void,
}>
export default function DelayHover(props:ReactHoverDelayTriggerProps):JSX.Element {
    const [tId, setTId] = useState(0)
    const [hovered, setHovered] = useState(false)
    const {handleHoverCancel, className} = props;
    React.useEffect(()=>{
        //do Nothing
        return ()=>handleHoverCancel();
    },[]);
    return <span
        className={className}
        style={{pointerEvents:'auto'}}
        onMouseOver={()=>{
            if(!hovered){
                const i = window.setTimeout(()=>{
                    props.handleHoverTrigger()
                }, props.delay)
                setHovered(true)
                setTId(i);
            }
        }}
         onMouseOut={()=>{
            clearTimeout(tId)
            setHovered(false)
            props.handleHoverCancel()
        }}
    >
        {props.children}
    </span>
}