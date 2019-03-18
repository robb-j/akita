import readline from 'readline'
import WebSocket from 'ws'
import chalk from 'chalk'
import cosmiconfig from 'cosmiconfig'
import { relative } from 'path'
import { struct } from 'superstruct'

export const Config = struct({
  url: 'string?',
  messages: 'object?'
})

export const redCross = chalk.red('𐄂')
export const greenTick = chalk.green('✓')

export type Config = {
  url?: string
  configPath?: string
  messages?: { [idx: string]: any }
}

export class Akita {
  constructor(public config: Config = {}) {}
  prompt = chalk.bold.yellow(`↑`)

  /** Try to load config using cosmiconfig and create an instance with it */
  static async fromConfig() {
    try {
      // Try to load the config
      let result = await cosmiconfig('akita').search()
      if (!result || result.isEmpty) return new Akita()

      // Prettify the config path for errors
      const configPath = relative(process.cwd(), result.filepath)

      // Validate the config
      let [error, config] = Config.validate(result.config)

      if (error) {
        const messageParts = ['Invalid config:', configPath]

        // Build up the error message
        for (let { type, value, path } of error.errors) {
          const dotPath = path.join('.')
          messageParts.push(
            `\n • ${dotPath} should be '${type}' but got '${typeof value}'`
          )
        }

        throw new Error(messageParts.join(' '))
      } else {
        return new Akita({ ...config, configPath })
      }
    } catch (error) {
      throw new Error(`Akita failed to load: ${error.message}`)
    }
  }

  addCursor() {
    process.stdout.write(chalk.bold.yellow('> '))
  }

  mergeConfigs(a: Config, b: Config): Config {
    return { ...a, ...b }
  }

  processLine(line: string, socket: WebSocket, namedMessages: any = {}) {
    const replaceLine = (...args: any[]) =>
      console.log(this.prompt, line, ...args)

    if (!line.trim()) return this.addCursor()

    let payload: any = line

    if (line.startsWith('@')) {
      try {
        payload = namedMessages[line.slice(1)]

        if (!payload) {
          throw new Error(`Invalid message '${line}'`)
        }

        if (typeof payload === 'object') {
          payload = JSON.stringify(payload)
        }
      } catch (error) {
        return replaceLine(redCross, error.message)
      }
    }

    socket.send(payload, err => {
      readline.moveCursor(process.stdout, 0, -1)

      if (err) replaceLine(redCross, err.message)
      else replaceLine(greenTick)

      this.addCursor()
    })
  }

  async start(args: Config = {}) {
    const { url, configPath, messages } = this.mergeConfigs(this.config, args)

    if (!url) throw new Error(`No url provided`)

    const socket = new WebSocket(url)

    // Connect to the socket
    await new Promise((resolve, reject) => {
      socket.on('open', resolve)
      socket.on('error', reject)
    })

    // Log information
    console.log(greenTick, 'Connected to', url)
    if (configPath) console.log(greenTick, 'Loaded from', configPath)

    // Create an interface for cli commands
    const io = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    // Prompt the user with the cursor
    this.addCursor()

    io.on('line', newLine => {
      this.processLine(newLine, socket, messages)
    })

    // Listen for messages from the server
    socket.on('message', data => {
      process.stdout.write('\r')
      console.log(chalk.bold.cyan('↓'), data.toString())
      this.addCursor()
    })

    // Make the function call hold until io is closed
    return new Promise(resolve => {
      io.on('close', () => {
        console.log('<exit>')
        socket.close()
        io.close()
        resolve()
      })
    })
  }
}
