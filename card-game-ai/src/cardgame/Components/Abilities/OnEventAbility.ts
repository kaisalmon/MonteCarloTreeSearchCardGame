import TextTemplate, {Ability, Effect, ExecutionContext, PlayerTarget} from "../TextTemplate";
import {PlayerKey} from "../../Card";
import {CardSource} from "../Effects/RandomTransferEffect";
import CardGame, {CardGameState} from "../../CardGame";
import {resolveActivePlayer} from "../setup";

export type EventType = 'player_draws'|'player_take_damage'|'turn_start'
export type EventParams<E extends EventType> =
    E extends 'player_draws' ? PlayerDrawsEventParams
    : E extends 'player_take_damage' ? PlayerTakesDamageEventParams
    : E extends 'turn_start' ?  {player: PlayerKey}
    : never;

type IsTargetedEventType<E extends EventType> = EventParams<E> extends {player:PlayerKey} ? E : never;
type TargetedEventType = IsTargetedEventType<EventType>

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
            ...(eventParams?.player && {lastPlayer:eventParams.player}),
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
        {eventType: 'player_take_damage', text: 'takes damage'}
    ]
    playerEventTypes.forEach(({eventType, text})=>{
      new TextTemplate('Ability', `When(?:ever) %Player ${text}, %Eff`, (target:PlayerTarget, eff:Effect)=> new FilteredOnEventAbility(eventType, eff, target));
      new TextTemplate('Ability', `When(?:ever) a player ${text}, %Eff`, (eff:Effect)=> new OnEventAbility(eventType, eff));
    });
    new TextTemplate('Ability', `At the start of each turn, %Eff`, (eff:Effect)=> new OnEventAbility('turn_start', eff));
    new TextTemplate('Ability', `At the start of your turn, %Eff`, (eff:Effect)=> new FilteredOnEventAbility('turn_start', eff, resolveActivePlayer));
}