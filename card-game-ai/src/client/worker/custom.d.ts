import {CardGameState} from "../../cardgame/CardGame";
import {WorkerResponse} from "./worker";

declare module 'comlink-loader!*' {

  class WebpackWorker extends Worker {
    constructor();

    // Add any custom functions to this class.
    // Make note that the return type needs to be wrapped in a promise.
    processData(state: CardGameState): Promise<WorkerResponse>;
  }

  export = WebpackWorker;
}