import CardGame, {CardGameChoiceMove, CardGameMove, CardGameState} from "../CardGame";
import {Card, PlayerKey} from "../Card";
import _ from 'lodash'
import {EventParams, EventType} from "./Abilities/OnEventAbility";

type Component = ResolveSlot<any>|string[]
type GetSlot<T extends Component> = T extends ResolveSlot<infer R> ? R : any;
type Slot = 'Eff'|'Player'|'N'|'Cond'|'Ability'|'ChoiceAction'|'Demos'|'Position'
type ResolveSlot<SLOT extends Slot> = SLOT extends 'Eff' ? Effect
                                    : SLOT extends 'Ability' ? Ability
                                    : SLOT extends 'Player' ? PlayerTarget
                                    : SLOT extends 'ChoiceAction' ? ChoiceAction
                                    : SLOT extends 'Cond' ? Resolver<boolean>
                                    : SLOT extends 'Demos' ? Resolver<number[]>
                                    : SLOT extends 'Position' ? Resolver<{x:number, y:number}>
                                    : SLOT extends 'N' ? number
                                    : never;


export type ExecutionContext = {
  playerKey: PlayerKey
  lastPlayer?: PlayerKey;
  lastExtreme?: {x:number, y:number}
} & (EventContext<EventType> | {})

type EventContext<E extends EventType> = {
    eventType: E,
    eventParams:EventParams<E>
}

export type Resolver<T> = {
   resolveValue(state:CardGameState, ctx:ExecutionContext, game:CardGame):T;
}

export class ResolveConstant<T>{
  value:T;
  constructor(value:T) {
    this.value = value;
  }
    resolveValue(state:CardGameState, ctx:ExecutionContext, game:CardGame){
      return this.value;
    }
}

export type PlayerTarget = Resolver<PlayerKey>

export interface Ability {
  abilityType: string;
}

export interface ChoiceAction {
  getChoices(state:CardGameState, executionContext:ExecutionContext, game:CardGame):CardGameChoiceMove[];
  applyEffect(move:CardGameChoiceMove, state:CardGameState, executionContext:ExecutionContext, game:CardGame):CardGameState;
}

export abstract class Effect{
  abstract applyEffect(state:CardGameState, executionContext:ExecutionContext, game:CardGame):CardGameState;
  applyEffectNoThrow(state:CardGameState, executionContext:ExecutionContext, game:CardGame):CardGameState{
     try{
        return this.applyEffect(state, executionContext, game);
    }catch(e){
        if(!Fizzle.isFizzle(e))throw e;
        return e.returnState;
    }
  }
}

export default class TextTemplate<T extends Component, ARGS extends Component[]=Component[]>{
  template: string;
  regex: RegExp;
  slots: Slot[];
  factory:(...args:ARGS)=>T;

  static templates:{
    [S in Slot]: TextTemplate<ResolveSlot<S>>[]
  } = {
    Eff: [],
    Player: [],
    N:[],
    Cond:[],
    ChoiceAction:[],
    Ability:[],
    Demos:[],
    Position:[],
  }

  constructor(slot: GetSlot<T>, template:string, factory:(...args:ARGS)=>T){
    this.template = template;
    const pattern = template
        .toLowerCase()
        .replace(/%\w+\s+/g, '(.*\\s+|)?')
        .replace(/%\w+/g, '(.*|)?')
    this.regex = new RegExp('^'+pattern+'$');
    this.factory = factory;
    this.slots = [...this.template.matchAll(/%(\w+)/gi)].map(match=>match[1]) as Slot[]
    TextTemplate.templates[slot].push(this as any);
  }

  static parse<SLOT extends Slot>(slot: SLOT, _text:string):ResolveSlot<SLOT>{
    const text = (_text||"").trim()
    const templates = TextTemplate.templates[slot] as TextTemplate<ResolveSlot<SLOT>>[];
    const candidates = templates.filter((template:TextTemplate<Component>) => text.toLowerCase().match(template.regex));
    if(candidates.length === 0) throw new Error(`Invalid text for slot ${slot}: ${text}`);
    const errors:Error[] = [];
    const results = candidates.map((template:TextTemplate<Component>)=>{
      try{
        const matches = text.toLowerCase().match(template.regex);
        const subTexts = matches ? matches.splice(1) : [];
        const args = template.slots.map((slot, i)=>{
          return TextTemplate.parse(slot, subTexts[i])
        })
        return template.factory(...args as any, subTexts) as unknown as ResolveSlot<SLOT>;
      }catch(e){
        errors.push(e);
        return undefined;
      }
    }).filter(x=>x);
    if(results.length === 0){
      const errorMessages = _.uniq(errors.map(e=>e.message));
      if(errorMessages.length > 1){
        throw new Error(errorMessages.join("; "));
      }else{
        throw errors[0];
      }
    }
    // TODO: select by shortest depth
    const [result] = results;
    if(!result){
      throw Error()
    }
    return result;
  }

  static clear() {
    this.templates = {
      Eff: [],
      ChoiceAction:[],
      Player: [],
      N:[],
      Cond:[],
      Ability:[],
      Demos:[],
      Position:[],
    }
  }
}

export class Fizzle extends Error{
  isFizzle = true
  returnState: CardGameState;
  constructor(returnState: CardGameState) {
    super("Effect Fizzle!");
    this.returnState = returnState;
  }
  static isFizzle(e:any):e is Fizzle{
    return e.isFizzle;
  }
}