import sinon from "sinon";
import CardGame from "../cardgame/CardGame";

export default function (){
    return sinon.createStubInstance(CardGame, {
        processEvent: sinon.stub().returnsArg(0) as any
    }) as unknown as CardGame;
}