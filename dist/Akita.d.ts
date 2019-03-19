import WebSocket from 'ws';
/** A superstruct to validate an .akitarc */
export declare const Config: import("superstruct").Struct;
/** A cross character colored red for the cli */
export declare const redCross: string;
/** A tick character colored green for the cli */
export declare const greenTick: string;
/** A type to represent an .akitarc */
export declare type Config = {
    url?: string;
    configPath?: string;
    messages?: {
        [idx: string]: any;
    };
};
/** A class for running the interactive WebSocket CLI */
export declare class Akita {
    config: Config;
    constructor(config?: Config);
    prompt: string;
    /** Perform a one-off run with config loaded from the nearest .akitarc (if found) */
    static run(url?: string): Promise<void>;
    /** Try to load config using cosmiconfig and create an instance with it */
    static fromConfig(): Promise<Akita>;
    /** Write the cursot to process.stdout */
    addPrompt(): void;
    /** Merge two config files together */
    mergeConfigs(a: Config, b: Config): Config;
    /** Process a line of input and emit it to a socket */
    processLine(line: string, socket: WebSocket, namedMessages?: any): void;
    /** Run an instance of Akita with optional extra configuration */
    start(args?: Config): Promise<{}>;
}
