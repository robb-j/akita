#!/usr/bin/env node

import program from 'commander'
import { Akita } from './Akita'
import { EchoServer } from './EchoServer'

const packageJson = require('../package.json')

// Setup the program
program
  .name('akita')
  .version(packageJson.version)
  .description('A cli for testing a WebSocket server')
  .usage('[options] [url]')

// Register the echo command
program
  .command('echo')
  .description('Run a websocket echo server')
  .option('-p --port [port]', 'The port to run on [3000]', 3000)
  .action(async cmd => {
    await EchoServer.run(cmd.port)
    process.exit(0)
  })

// Fail on unknown commands
program.on('command:*', async args => {
  await Akita.run(args[0])
})

// Parse the program arguments, if there are any
// Or just run Akita if there aren't any
if (process.argv.length > 2) program.parse(process.argv)
else Akita.run()
