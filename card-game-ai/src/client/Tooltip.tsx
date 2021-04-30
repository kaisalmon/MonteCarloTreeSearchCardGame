
import React, {CSSProperties} from "react";
import { usePopperTooltip } from "react-popper-tooltip";
import "react-popper-tooltip/dist/styles.css";


type TooltipOptions = Parameters<typeof usePopperTooltip>
type TooltipProps = React.PropsWithChildren<{target:JSX.Element, style?:CSSProperties, opts?:Partial<TooltipOptions[0]>}>

const Tooltip:React.FunctionComponent<TooltipProps> = props=>{
    const {
        target,
        style,
        children,
        opts
    } = props;
    const {
        getArrowProps,
        getTooltipProps,
        setTooltipRef,
        setTriggerRef,
        visible
      } = usePopperTooltip({ ...opts });

    return <>
        <div style={style} ref={setTriggerRef}>{target}</div>
         {visible && (
          <div
            ref={setTooltipRef}
            {...getTooltipProps({ className: "tooltip-container" })}
          >
              {children}
            <div {...getArrowProps({ className: "tooltip-arrow" })} />
          </div>
        )}
        </>
}

export default Tooltip;