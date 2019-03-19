"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const readline_1 = __importDefault(require("readline"));
const ws_1 = __importDefault(require("ws"));
const chalk_1 = __importDefault(require("chalk"));
const cosmiconfig_1 = __importDefault(require("cosmiconfig"));
const path_1 = require("path");
const superstruct_1 = require("superstruct");
exports.Config = superstruct_1.struct({
    url: 'string?',
    messages: 'object?'
});
exports.redCross = chalk_1.default.red('𐄂');
exports.greenTick = chalk_1.default.green('✓');
class Akita {
    constructor(config = {}) {
        this.config = config;
        this.prompt = chalk_1.default.bold.yellow(`↑`);
    }
    static async run(url) {
        try {
            let akita = await this.fromConfig();
            await akita.start({ url });
        }
        catch (error) {
            console.log(exports.redCross, error.message);
        }
    }
    /** Try to load config using cosmiconfig and create an instance with it */
    static async fromConfig() {
        try {
            // Try to load the config
            let result = await cosmiconfig_1.default('akita').search();
            if (!result || result.isEmpty)
                return new Akita();
            // Prettify the config path for errors
            const configPath = path_1.relative(process.cwd(), result.filepath);
            // Validate the config
            let [error, config] = exports.Config.validate(result.config);
            if (error) {
                const messageParts = ['Invalid config:', configPath];
                // Build up the error message
                for (let { type, value, path } of error.errors) {
                    const dotPath = path.join('.');
                    messageParts.push(`\n • ${dotPath} should be '${type}' but got '${typeof value}'`);
                }
                throw new Error(messageParts.join(' '));
            }
            else {
                return new Akita(Object.assign({}, config, { configPath }));
            }
        }
        catch (error) {
            throw new Error(`Akita failed to load: ${error.message}`);
        }
    }
    addCursor() {
        process.stdout.write(chalk_1.default.bold.yellow('> '));
    }
    mergeConfigs(a, b) {
        return Object.assign({}, a, b);
    }
    processLine(line, socket, namedMessages = {}) {
        const replaceLine = (...args) => console.log(this.prompt, line, ...args);
        if (!line.trim())
            return this.addCursor();
        let payload = line;
        if (line.startsWith('@')) {
            try {
                payload = namedMessages[line.slice(1)];
                if (!payload) {
                    throw new Error(`Invalid message '${line}'`);
                }
                if (typeof payload === 'object') {
                    payload = JSON.stringify(payload);
                }
            }
            catch (error) {
                return replaceLine(exports.redCross, error.message);
            }
        }
        socket.send(payload, err => {
            readline_1.default.moveCursor(process.stdout, 0, -1);
            if (err)
                replaceLine(exports.redCross, err.message);
            else
                replaceLine(exports.greenTick);
            this.addCursor();
        });
    }
    async start(args = {}) {
        const { url, configPath, messages } = this.mergeConfigs(this.config, args);
        if (!url)
            throw new Error(`No url provided`);
        const socket = new ws_1.default(url);
        // Connect to the socket
        await new Promise((resolve, reject) => {
            socket.on('open', resolve);
            socket.on('error', reject);
        });
        // Log information
        console.log(exports.greenTick, 'Connected to', url);
        if (configPath)
            console.log(exports.greenTick, 'Loaded from', configPath);
        // Create an interface for cli commands
        const io = readline_1.default.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        // Prompt the user with the cursor
        this.addCursor();
        io.on('line', newLine => {
            this.processLine(newLine, socket, messages);
        });
        // Listen for messages from the server
        socket.on('message', data => {
            process.stdout.write('\r');
            console.log(chalk_1.default.bold.cyan('↓'), data.toString());
            this.addCursor();
        });
        // Make the function call hold until io is closed
        return new Promise(resolve => {
            io.on('close', () => {
                console.log('<exit>');
                socket.close();
                io.close();
                resolve();
            });
        });
    }
}
exports.Akita = Akita;
