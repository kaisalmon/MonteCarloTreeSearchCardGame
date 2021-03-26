import {Card} from "../cardgame/Card";
import React, {CSSProperties} from "react";
import { usePopperTooltip } from "react-popper-tooltip";
import "react-popper-tooltip/dist/styles.css";

type CardPileProps = {
    label: string,
    cards:(Card|'?')[],
}

const PILE_STYLE:CSSProperties = {
    border: '1px solid black',
    fontSize: 10,
    borderRadius: 3,
    width: 40,
    height: 60,
    margin: 5,
    display: 'inline-block'
}
const CARD_LIST_STYLE:CSSProperties = {
    maxHeight: 200,
    fontSize: 10,
    textAlign: 'left',
    width: 150,
    overflowY: 'auto'
}

const CardPile:React.FunctionComponent<CardPileProps> = props=>{
    const {
        label,
        cards
    } = props;
        const {
    getArrowProps,
    getTooltipProps,
    setTooltipRef,
    setTriggerRef,
    visible
  } = usePopperTooltip({ interactive: true, delayHide: 100 });

    return <>
            <div style={PILE_STYLE} ref={setTriggerRef}>
                {label}
                <div>{cards.length}</div>
            </div>
         {visible && (
          <div
            ref={setTooltipRef}
            {...getTooltipProps({ className: "tooltip-container" })}
          >
              {cards.length===0 && <i>Empty</i>}
              <ul style={CARD_LIST_STYLE}>
                  {cards.map((card, i)=><li key={i}>
                      <b>{typeof card === 'string' ? card : card.getName()}</b>
                      {' '}
                        {typeof card !== 'string' && card.getText()}
                  </li>)}
              </ul>
            <div {...getArrowProps({ className: "tooltip-arrow" })} />
          </div>
        )}
        </>
}

export default CardPile;