#!/usr/bin/env node

import program from 'commander'
import { Akita, redCross } from './Akita'
import { runEchoServer } from './runEchoServer'

// ;(async () => {
//   try {
//     let akita = await Akita.fromConfig()
//
//     await akita.start({ url: 'ws://localhost:3000' })
//
//     console.log(`It's over anakin`)
//
//   } catch (error) {
//     console.log(error.message)
//     console.log(usage)
//   }
// })()

const packageJson = require('../package.json')

program
  .name(packageJson.name)
  .version(packageJson.version)
  .arguments('[options] [url]')

program
  .command('echo')
  .description('Run a websocket echo server')
  .option('-p --port [port]', 'The port to run on [3000]', 3000)
  .action(async cmd => {
    await runEchoServer(cmd.port)
    console.log('Closed')
    process.exit(0)
  })

// Fail on unknown commands
program.on('command:*', async args => {
  console.log('...')
  let akita = await Akita.fromConfig()
  console.log(akita)
  await akita.start({ url: args[0] })
})

program.parse(process.argv)
