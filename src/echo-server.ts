import { createServer } from 'http'
import WebSocket from 'ws'
import stoppable, { StoppableServer } from 'stoppable'
import debugfn from 'debug'

const debug = debugfn('akita:echo')

async function shutdown(msg: string, server: StoppableServer) {
  console.log(`${msg}, shutting down`)

  try {
    await server.stop()
  } catch (error) {
    console.error(error)
    process.exitCode = 1
  } finally {
    process.exit()
  }
}

export async function runEchoServer(port: number) {
  debug(`#runEchoServer port=${port}`)

  // Create a http server
  // -> 'stoppable' adds a functioning #stop() method
  const server = stoppable(createServer())

  // Creates a web socket server with that http server
  const wss = new WebSocket.Server({ server })

  // For any new connection
  // -> Listen for messages, log them and echo them back
  wss.on('connection', (ws, request) => {
    debug('wss@connection headers=%O', request.headers)

    ws.on('message', message => {
      debug(`wss@message message="${message.toString()}"`)
      ws.send(message)
    })

    ws.on('close', (code, reason) => {
      debug(`wss@close code=${code}, reason="${reason}"`)
    })
  })

  // Start the http server
  await new Promise(resolve => server.listen(port, resolve))
  console.log(`Listening on :${port}`)

  // Kill the server when sent these signals
  process.on('SIGINT', () => shutdown('Received SIGINT', server))
  process.on('SIGTERM', () => shutdown('Received SIGTERM', server))
}
