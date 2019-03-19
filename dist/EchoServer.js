"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const ws_1 = __importDefault(require("ws"));
const stoppable_1 = __importDefault(require("stoppable"));
class EchoServer {
    static async run(port = 3000) {
        // Create a http server
        // -> 'stoppable' adds a functioning #stop() method
        const server = stoppable_1.default(http_1.createServer());
        // Creates a web socket server with that http server
        const wss = new ws_1.default.Server({ server });
        // For any new connection
        // -> Listen for messages, log them and echo them back
        wss.on('connection', ws => {
            ws.on('message', message => {
                console.log('→', message.toString());
                ws.send(message);
            });
        });
        // Start the http server
        await new Promise(resolve => server.listen(port, resolve));
        console.log(`Running WebSocket echo server on :${port}`);
        // Wait for sigint to stop the server and return from the function
        await new Promise(resolve => {
            process.on('SIGINT', () => server.stop(() => resolve));
        });
        console.log('Stopped');
    }
}
exports.EchoServer = EchoServer;
