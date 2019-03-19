import WebSocket from 'ws';
export declare const Config: import("superstruct").Struct;
export declare const redCross: string;
export declare const greenTick: string;
export declare type Config = {
    url?: string;
    configPath?: string;
    messages?: {
        [idx: string]: any;
    };
};
export declare class Akita {
    config: Config;
    constructor(config?: Config);
    prompt: string;
    static run(url?: string): Promise<void>;
    /** Try to load config using cosmiconfig and create an instance with it */
    static fromConfig(): Promise<Akita>;
    addCursor(): void;
    mergeConfigs(a: Config, b: Config): Config;
    processLine(line: string, socket: WebSocket, namedMessages?: any): void;
    start(args?: Config): Promise<{}>;
}
