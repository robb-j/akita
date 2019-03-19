import readline from 'readline'
import WebSocket from 'ws'
import chalk from 'chalk'
import cosmiconfig from 'cosmiconfig'
import { relative } from 'path'
import { struct } from 'superstruct'

/** A superstruct to validate an .akitarc */
export const Config = struct({
  url: 'string?',
  messages: 'object?'
})

/** A cross character colored red for the cli */
export const redCross = chalk.red('𐄂')

/** A tick character colored green for the cli */
export const greenTick = chalk.green('✓')

/** A type to represent an .akitarc */
export type Config = {
  url?: string
  configPath?: string
  messages?: { [idx: string]: any }
}

/** A class for running the interactive WebSocket CLI */
export class Akita {
  constructor(public config: Config = {}) {}
  prompt = '> '

  /** Perform a one-off run with config loaded from the nearest .akitarc (if found) */
  static async run(url?: string) {
    try {
      let akita = await this.fromConfig()
      await akita.start({ url })
    } catch (error) {
      console.log(redCross, error.message)
    }
  }

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

  /** Write the cursot to process.stdout */
  addPrompt() {
    process.stdout.write(this.prompt)
  }

  /** Merge two config files together */
  mergeConfigs(a: Config, b: Config): Config {
    const output: any = { ...a }

    // Only merge in from b if it is defined
    for (let key in b) {
      if ((b as any)[key] !== undefined) output[key] = (b as any)[key]
    }

    return output
  }

  /** Process a line of input and emit it to a socket */
  processLine(line: string, socket: WebSocket, namedMessages: any = {}) {
    // A utility to rewrite the current line after being sent
    const rewriteLine = (...args: any[]) =>
      console.log(chalk.bold.yellow(`↑`), line, ...args)

    // Do nothing if no message was entered
    if (!line.trim()) return this.addPrompt()

    // Start processing the line into a WebSocket payload
    let payload: any = line

    // Use a named message if the line starts with @
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
        return rewriteLine(redCross, error.message)
      }
    }

    // Send the payload to the socket & update the cli
    socket.send(payload, err => {
      readline.moveCursor(process.stdout, 0, -1)

      if (err) rewriteLine(redCross, err.message)
      else rewriteLine(greenTick)

      this.addPrompt()
    })
  }

  /** Run an instance of Akita with optional extra configuration */
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
    this.addPrompt()

    io.on('line', newLine => {
      this.processLine(newLine, socket, messages)
    })

    // Listen for messages from the server
    socket.on('message', data => {
      process.stdout.write('\r')
      console.log(chalk.bold.cyan('↓'), data.toString())
      this.addPrompt()
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
