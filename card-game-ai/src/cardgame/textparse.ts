type Components = ResolveSlot<any>
type GetSlot<T> = T extends ResolveSlot<infer R> ? R : any;
type Slot = 'A'|'I'
type ResolveSlot<SLOT extends Slot> = SLOT extends 'A' ? Ability
                                    : SLOT extends 'I' ? Effect
                                    : never;


class WorldState{}

abstract class Ability{}

class EventTriggerAbilty extends Ability{
  trigger: string;
  effect: Effect;
  constructor(trigger:string, effect:Effect){
    super();
    this.effect = effect;
    this.trigger = trigger;
  }
}
class EventTriggerAbiltyWithCond extends EventTriggerAbilty{
  cond: string;
  constructor(trigger:string, effect:Effect, cond:string){
    super(trigger, effect);
    this.cond = cond;
  }
}

abstract class Effect{
    abstract eval(state:WorldState):void;
}
class PrintEffect extends Effect{
  text: string;
  constructor(text:string){
    super();
    this.text = text;
  }
  eval(state:WorldState){
    console.log(this.text)
  }
}
class GainAbilityEffect extends Effect{
    ability: Ability;
    constructor(ability:Ability){
      super();
      this.ability = ability;
    }
    eval(state:WorldState){
      console.log("Gaining:", this.ability)
    }
}

class ListEffect extends Effect{
  first: Effect;
  second: Effect;
  constructor(first:Effect, second:Effect){
    super();
    this.first = first;
    this.second = second;
  }
  eval(state:WorldState){
    this.first.eval(state);
    this.second.eval(state);
  }
}

export class TextTemplate<T, ARGS extends Components[]>{
  template: string;
  regex: RegExp;
  slots: Slot[];
  factory:(...args:ARGS)=>T;

  static templates:{
    [S in Slot]: TextTemplate<ResolveSlot<S>, Components[]>[]
  } = {
    A: [],
    I: []
  }

  constructor(slot: GetSlot<T>, template:string, factory:(...args:ARGS)=>T){
    this.template = template;
    this.regex = new RegExp('^'+template.replace(/%\w/g, '(.*)?')+'$');
    this.factory = factory;
    const slots = this.template.match(/\%(\w)/g);
    this.slots = slots ? slots.map(str=>str[1]) as Slot[] : [];
    TextTemplate.templates[slot].push(this as any);
  }

  static parse<T>(slot: GetSlot<T>, text:string):T{
    const templates = TextTemplate.templates[slot];
    const candidates = templates.filter(template => text.match(template.regex));
    if(candidates.length === 0) throw new Error(`Invalid text for slot ${slot}: ${text}`);
    const errors:Error[] = [];
    const results = candidates.map(template=>{
      try{
        const matches = text.match(template.regex);
        const subTexts = matches ? matches.splice(1) : [];
        const args = template.slots.map((slot, i)=>{
          return TextTemplate.parse(slot, subTexts[i])
        })
        return template.factory(...args as any) as T;
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
    if(results.length > 1) throw new Error('Ambigous text, '+text);
    const [result] = results;
    return result!;
  }
}

new TextTemplate('I', 'print hello to the screen', ()=>new PrintEffect('Hello'));
new TextTemplate('I', 'print fish to the screen', ()=>new PrintEffect('Fish'));


new TextTemplate('I', 'draw a card', ()=>new PrintEffect('draw'));

new TextTemplate('I', '%I, %I', (a:Effect, b:Effect)=>new ListEffect(a,b));
new TextTemplate('I', '%I then %I', (a:Effect, b:Effect)=>new ListEffect(a,b));
new TextTemplate('I', '%I, then %I', (a:Effect, b:Effect)=>new ListEffect(a,b));
new TextTemplate('I', '%I and %I', (a:Effect, b:Effect)=>new ListEffect(a,b));
new TextTemplate('I', '%I, and %I', (a:Effect, b:Effect)=>new ListEffect(a,b));
new TextTemplate('I', 'you gain "%A" until end of turn', (ab:Ability)=>new GainAbilityEffect(ab));
new TextTemplate('A', 'When you play this card %I', (instruction:Effect)=>new EventTriggerAbilty('PLAY', instruction));
new TextTemplate('A', 'At the start of each turn %I', (instruction:Effect)=>new EventTriggerAbilty('TURN_START', instruction));
new TextTemplate('A', 'At the end of each turn %I', (instruction:Effect)=>new EventTriggerAbilty('TURN_END', instruction));
new TextTemplate('A', 'At the end of each turn, %I', (instruction:Effect)=>new EventTriggerAbilty('TURN_END', instruction));
new TextTemplate('A', 'Whenever you take damage %I', (instruction:Effect)=>new EventTriggerAbilty('TAKE_DAMAGE', instruction));
new TextTemplate('A', 'At the end of each turn %I unless you are winning', (instruction:Effect)=>new EventTriggerAbiltyWithCond('TURN_END', instruction, 'ARE_LOSING'));
new TextTemplate('A', 'At the end of each turn, if you are winning, %I', (instruction:Effect)=>new EventTriggerAbiltyWithCond('TURN_END', instruction, 'ARE_WINNING'));

const testComponent = TextTemplate.parse('A', 'When you play this card you gain "Whenever you take damage draw a card" until end of turn')
console.log({testComponent})