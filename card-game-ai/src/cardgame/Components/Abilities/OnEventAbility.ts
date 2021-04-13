import TextTemplate, {Ability, Effect, ExecutionContext, PlayerTarget} from "../TextTemplate";
import {PlayerKey} from "../../Card";
import {CardSource} from "../Effects/RandomTransferEffect";
import CardGame, {CardGameState} from "../../CardGame";
import {resolveActivePlayer} from "../setup";

export type TargetedEventType = 'player_draws'|'turn_start';
export type EventType = TargetedEventType|'round_end';
export type EventParams<E extends EventType> =
    E extends 'player_draws' ? PlayerDrawsEventParams
    : E extends 'turn_start' ?  {player: PlayerKey}
    : E extends 'round_end' ?  {}
    : never;



export type PlayerDrawsEventParams = {
    player: PlayerKey,
    cardNumbers: number[],
    from: CardSource
}

export type PlayerTakesDamageEventParams = {
    player: PlayerKey,
    amount: number
}



export class OnEventAbility<E extends EventType> implements Ability{
    abilityType = 'onEventAbility';
    eventType: E;
    eff: Effect;

    constructor(eventType:E, eff:Effect) {
        this.eventType = eventType;
        this.eff = eff;
    }

    trigger(state:CardGameState, eventParams: EventParams<E>, ctx:ExecutionContext, game:CardGame):CardGameState{
        const triggerCtx:ExecutionContext = {
            ...ctx,
            ...((eventParams as any)?.player && {lastPlayer:(eventParams as any).player}),
            eventType: this.eventType,
            eventParams
        }
        return this.eff.applyEffect(state, triggerCtx, game);
    }

    static isOnEventAbility<E extends EventType>(a:Ability, eventType:E): a is OnEventAbility<E>{
        return a.abilityType === 'onEventAbility' && (a as OnEventAbility<any>).eventType === eventType;
    }

}

class FilteredOnEventAbility<E extends TargetedEventType> extends OnEventAbility<E>{
    filter: PlayerTarget;

    constructor(eventType:E, eff:Effect, filter: PlayerTarget) {
        super(eventType, eff);
        this.filter = filter
    }
    trigger(state:CardGameState, eventParams: EventParams<E>, ctx:ExecutionContext, game:CardGame):CardGameState{
        if(this.filter.resolveValue(state, ctx, game) != eventParams.player) return state;
        return super.trigger(state, eventParams, ctx, game);
    }
}

export function setup(){
    const playerEventTypes:{eventType:TargetedEventType, text:string}[] = [
        {eventType: 'player_draws', text: 'draws? a card'},
    ]
    playerEventTypes.forEach(({eventType, text})=>{
      new TextTemplate('Ability', `When(?:ever) %Player ${text}, %Eff`, (target:PlayerTarget, eff:Effect)=> new FilteredOnEventAbility(eventType, eff, target));
      new TextTemplate('Ability', `When(?:ever) a player ${text}, %Eff`, (eff:Effect)=> new OnEventAbility(eventType, eff));
    });
    new TextTemplate('Ability', `At the start of each turn, %Eff`, (eff:Effect)=> new OnEventAbility('turn_start', eff));
    new TextTemplate('Ability', `At the start of your turn, %Eff`, (eff:Effect)=> new FilteredOnEventAbility('turn_start', eff, resolveActivePlayer));

    new TextTemplate('Ability', `At the end of each round, %Eff`, (eff:Effect)=> new OnEventAbility('round_end', eff));
}