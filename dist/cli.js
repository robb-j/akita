#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = __importDefault(require("commander"));
const Akita_1 = require("./Akita");
const EchoServer_1 = require("./EchoServer");
const packageJson = require('../package.json');
commander_1.default
    .name('akita')
    .version(packageJson.version)
    .description('A cli for testing websockets')
    .usage('[options] [url]');
commander_1.default
    .command('echo')
    .description('Run a websocket echo server')
    .option('-p --port [port]', 'The port to run on [3000]', 3000)
    .action(async (cmd) => {
    await EchoServer_1.EchoServer.run(cmd.port);
    process.exit(0);
});
// Fail on unknown commands
commander_1.default.on('command:*', async (args) => {
    await Akita_1.Akita.run(args[0]);
});
// Parse the program arguments, if there are any
if (process.argv.length > 2) {
    commander_1.default.parse(process.argv);
}
else {
    // If not, just run akita
    Akita_1.Akita.run();
}
