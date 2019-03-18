import { createServer } from 'http'
import WebSocket from 'ws'
import stoppable from 'stoppable'

export async function runEchoServer(port = 3000) {
  // Create a http server
  // -> 'stoppable' adds a functioning #stop() method
  const server = stoppable(createServer())

  // Creates a web socket server with that http server
  const wss = new WebSocket.Server({ server })

  // For any new connection
  // -> Listen for messages, log them and echo them back
  wss.on('connection', ws => {
    ws.on('message', message => {
      console.log('→', message.toString())
      ws.send(message)
    })
  })

  // Start the http server
  await new Promise(resolve => server.listen(port, resolve))
  console.log(`Running WebSocket echo server on :${port}`)

  // Await a sigint to stop the server
  return new Promise(resolve => {
    process.on('SIGINT', () => server.stop(() => resolve))
  })
}
