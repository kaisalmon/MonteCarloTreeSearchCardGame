declare module 'react-hover-delay-trigger'{
    type ReactHoverDelayTriggerProps = React.PropsWithChildren< {
        delay: number,
        handleHoverTrigger: ()=>void,
        handleHoverCancel: ()=>void,
    }>
    export default function ReactHoverDelayTrigger(props:ReactHoverDelayTriggerProps):JSX.Element;
}