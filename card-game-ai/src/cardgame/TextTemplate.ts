import {CardGameState} from "./CardGame";
import {PlayerKey} from "./Card";

type Components = ResolveSlot<any>
type GetSlot<T> = T extends ResolveSlot<infer R> ? R : any;
type Slot = 'Eff'
type ResolveSlot<SLOT extends Slot> = SLOT extends 'Eff' ? Effect
                                    : never;


export interface Effect{
  applyEffect(state:CardGameState, playerKey:PlayerKey):CardGameState;
}

export default class TextTemplate<T, ARGS extends Components[]>{
  template: string;
  regex: RegExp;
  slots: Slot[];
  factory:(...args:ARGS)=>T;

  static templates:{
    [S in Slot]: TextTemplate<ResolveSlot<S>, Components[]>[]
  } = {
    Eff: []
  }

  constructor(slot: GetSlot<T>, template:string, factory:(...args:ARGS)=>T){
    this.template = template;
    this.regex = new RegExp('^'+template.replace(/%\w+/g, '(.*)?')+'$');
    this.factory = factory;
    this.slots = [...this.template.matchAll(/%(\w+)/gi)].map(match=>match[1]) as Slot[]
    TextTemplate.templates[slot].push(this as any);
  }

  static parse<T>(slot: GetSlot<T>, text:string):T{
    const templates = TextTemplate.templates[slot];
    const candidates = templates.filter(template => text.toLowerCase().match(template.regex));
    if(candidates.length === 0) throw new Error(`Invalid text for slot ${slot}: ${text}`);
    const errors:Error[] = [];
    const results = candidates.map(template=>{
      try{
        const matches = text.match(template.regex);
        const subTexts = matches ? matches.splice(1) : [];
        const args = template.slots.map((slot, i)=>{
          return TextTemplate.parse(slot, subTexts[i])
        })
        return template.factory(...args as any) as unknown as T;
      }catch(e){
        errors.push(e);
        return null;
      }
    }).filter(x=>x);
    if(results.length === 0){
      if(errors.length > 1){
        console.error({errors:errors.map(e=>e.message)});
        throw new Error("Invalid text: "+text);
      }else{
        throw errors[0];
      }
    }
    const [result] = results;
    return result!;
  }
}