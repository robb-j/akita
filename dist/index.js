"use strict";
//
// Package entrypoint
// Anything exported here can be imported when this package is imported via npm
//
Object.defineProperty(exports, "__esModule", { value: true });
var akita_1 = require("./akita");
Object.defineProperty(exports, "Akita", { enumerable: true, get: function () { return akita_1.Akita; } });
Object.defineProperty(exports, "Config", { enumerable: true, get: function () { return akita_1.Config; } });
Object.defineProperty(exports, "greenTick", { enumerable: true, get: function () { return akita_1.greenTick; } });
Object.defineProperty(exports, "redCross", { enumerable: true, get: function () { return akita_1.redCross; } });
var echo_server_1 = require("./echo-server");
Object.defineProperty(exports, "runEchoServer", { enumerable: true, get: function () { return echo_server_1.runEchoServer; } });
