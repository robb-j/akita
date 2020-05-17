#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = __importDefault(require("yargs"));
const akita_1 = require("./akita");
const echo_server_1 = require("./echo-server");
yargs_1.default
    .help()
    .alias('h', 'help')
    .demandCommand()
    .recommendCommands()
    .strict();
yargs_1.default.command('echo [port]', 'Run an echo websocket server for testing', yargs => yargs.positional('port', {
    type: 'number',
    default: 3000
}), async (args) => {
    try {
        await echo_server_1.runEchoServer(args.port);
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
});
yargs_1.default.command(['* [url]', 'run [url]'], 'Run the WebSocket CLI', yargs => yargs
    .positional('url', {
    type: 'string',
    describe: 'The server to connect to',
    demandOption: true
})
    .option('header', {
    type: 'array',
    describe: 'Headers to pass to the initial request',
    default: []
}), async (args) => {
    try {
        // Assemble the headers
        const headers = {};
        for (const h of args.header) {
            const [key, ...rest] = h.toString().split(':');
            headers[key] = rest.join('');
        }
        await akita_1.Akita.run(args.url, headers);
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
});
yargs_1.default.parse();
// const packageJson = require('../package.json')
// // Setup the program
// program
//   .name('akita')
//   .version(packageJson.version)
//   .description('A cli for testing a WebSocket server')
//   .usage('[options] [url]')
// // Register the echo command
// program
//   .command('echo')
//   .description('Run a websocket echo server')
//   .option('-p --port [port]', 'The port to run on [3000]', 3000)
//   .action(async cmd => {
//     await EchoServer.run(cmd.port)
//     process.exit(0)
//   })
// // Fail on unknown commands
// program.on('command:*', async args => {
//   await Akita.run(args[0])
// })
// // Parse the program arguments, if there are any
// // Or just run Akita if there aren't any
// if (process.argv.length > 2) program.parse(process.argv)
// else Akita.run()
