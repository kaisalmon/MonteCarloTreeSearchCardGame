import {ExecutionContext, Fizzle, Resolver} from "../TextTemplate";
import {CardGameState} from "../../CardGame";

export class ContextualExtreme implements Resolver<{ x: number, y: number }> {
    resolveValue(state: CardGameState, ctx: ExecutionContext): { x: number, y: number } {
        if (!ctx.lastExtreme) throw new Fizzle(state)
        return ctx.lastExtreme;
    }
}