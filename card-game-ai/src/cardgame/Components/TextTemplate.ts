import {CardGameState} from "../CardGame";
import {PlayerKey} from "../Card";
import _ from 'lodash'

type Component = ResolveSlot<any>
type GetSlot<T extends Component> = T extends ResolveSlot<infer R> ? R : any;
type Slot = 'Eff'|'Player'|'N'
type ResolveSlot<SLOT extends Slot> = SLOT extends 'Eff' ? Effect
                                    : SLOT extends 'Player' ? PlayerTarget
                                    : SLOT extends 'N' ? number
                                    : never;

export type ExecutionContext = {
  playerKey: PlayerKey
  lastPlayer?: PlayerKey;
}

export type Resolver<T> = {
   resolvePlayerKey(state:CardGameState, ctx:ExecutionContext):T;
}



export type PlayerTarget = Resolver<PlayerKey>

export interface Effect{
  applyEffect(state:CardGameState, executionContext:ExecutionContext):CardGameState;
}

export default class TextTemplate<T extends Component, ARGS extends Component[]>{
  template: string;
  regex: RegExp;
  slots: Slot[];
  factory:(...args:ARGS)=>T;

  static templates:{
    [S in Slot]: TextTemplate<ResolveSlot<S>, Component[]>[]
  } = {
    Eff: [],
    Player: [],
    N:[]
  }

  constructor(slot: GetSlot<T>, template:string, factory:(...args:ARGS)=>T){
    this.template = template;
    const pattern = template
        .replace(/%\w+\s+/g, '(.*\\s+|)?')
        .replace(/%\w+/g, '(.*|)?')
    this.regex = new RegExp('^'+pattern+'$');
    this.factory = factory;
    this.slots = [...this.template.matchAll(/%(\w+)/gi)].map(match=>match[1]) as Slot[]
    TextTemplate.templates[slot].push(this as any);
  }

  static parse<SLOT extends Slot>(slot: SLOT, _text:string):ResolveSlot<SLOT>{
    const text = (_text||"").trim()
    const templates = TextTemplate.templates[slot] as TextTemplate<ResolveSlot<SLOT>, Component[]>[];
    const candidates = templates.filter((template:TextTemplate<Component, Component[]>) => text.toLowerCase().match(template.regex));
    if(candidates.length === 0) throw new Error(`Invalid text for slot ${slot}: ${text}`);
    const errors:Error[] = [];
    const results = candidates.map((template:TextTemplate<Component, Component[]>)=>{
      try{
        const matches = text.toLowerCase().match(template.regex);
        const subTexts = matches ? matches.splice(1) : [];
        const args = template.slots.map((slot, i)=>{
          return TextTemplate.parse(slot, subTexts[i])
        })
        return template.factory(...args as any) as unknown as ResolveSlot<SLOT>;
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
      Player: [],
      N:[]
    }
  }
}