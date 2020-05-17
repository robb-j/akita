"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runEchoServer = void 0;
const http_1 = require("http");
const ws_1 = __importDefault(require("ws"));
const stoppable_1 = __importDefault(require("stoppable"));
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default('akita:echo');
async function shutdown(msg, server) {
    console.log(`${msg}, shutting down`);
    try {
        await server.stop();
    }
    catch (error) {
        console.error(error);
        process.exitCode = 1;
    }
    finally {
        process.exit();
    }
}
async function runEchoServer(port) {
    debug(`#runEchoServer port=${port}`);
    // Create a http server
    // -> 'stoppable' adds a functioning #stop() method
    const server = stoppable_1.default(http_1.createServer());
    // Creates a web socket server with that http server
    const wss = new ws_1.default.Server({ server });
    // For any new connection
    // -> Listen for messages, log them and echo them back
    wss.on('connection', (ws, request) => {
        debug('wss@connection headers=%O', request.headers);
        ws.on('message', message => {
            debug(`wss@message message="${message.toString()}"`);
            ws.send(message);
        });
        ws.on('close', (code, reason) => {
            debug(`wss@close code=${code}, reason="${reason}"`);
        });
    });
    // Start the http server
    await new Promise(resolve => server.listen(port, resolve));
    console.log(`Listening on :${port}`);
    // Kill the server when sent these signals
    process.on('SIGINT', () => shutdown('Received SIGINT', server));
    process.on('SIGTERM', () => shutdown('Received SIGTERM', server));
}
exports.runEchoServer = runEchoServer;
