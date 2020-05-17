# Akita | A WebSocket CLI

A [node.js](https://nodejs.org) command line interface for interacting with a WebSocket server.
Useful for sending specific or predefined messages over a WebSocket.

![A usage example](/usage.png 'Using akita CLI')

<!-- toc-head -->

## Table of contents

- [An example](#an-example)
- [Installing](#installing)
- [Usage](#usage)
- [Predefined messages](#predefined-messages)
- [Predefined URLs](#predefined-urls)
- [Headers](#headers)
- [Using the API](#using-the-api)
- [Development](#development)
  - [Setup](#setup)
  - [Regular use](#regular-use)
  - [Irregular use](#irregular-use)
  - [Code Structure](#code-structure)
  - [Code formatting](#code-formatting)
  - [Publishing](#publishing)
  - [Future work](#future-work)

<!-- toc-tail -->

## An example

```bash
# Connect to a WebSocket server (Exit with Ctrl+C)
akita ws://localhost:3000

# Send up a specific json payload
> {"type": "message", "body": "Hello, world!"}

# Send a predefined message (defined in an .akitarc file)
> @myCustomMessage
```

## Installing

These are the different ways you can install, in no particular order.

```bash
# Install with npm
npm i -g akita-ws

# Install as a development dependancy
npm i --save-dev akita-ws
```

## Usage

Below are the different things you can do.

```bash
# Connect to a web socket server
# -> Any line you enter after this is emitted to the server
# -> Stop with a Ctrl+C
akita ws://localhost:3000

# Run an echo server
# -> Start an echo server, which will echo back any message you emit
# -> You should probably run this in a new terminal tab
# -> Run on a specific port with: "--port 1337"
# -> Stop with a Ctrl+C
akita echo

# See usage info
akita --help
akita echo --help
```

## Predefined messages

You can use an `.akitarc` file to specify predefined message you want to send.
akita uses [cosmiconfig](https://www.npmjs.com/package/cosmiconfig)
to load config files, so you can use:
`.akitarc`, `akitarc.json`, `akitarc.yml` or `akitarc.js` if you want.

Say you have an `.akitarc.yml` file:

```yml
# Use this block to define you messages
messages:
  # You can use a string value
  helloWorld: A really long string payload

  # Or you can use an object which will be serialised with JSON.stringify()
  customData:
    name: Geoff
    age: 42
```

Then you can use do:

```bash
# Connect to akita
akita ws://localhost:3000

# Send a predefined string payload
> @helloWorld

# Send a predefined JSON payload (uses JSON.stringify())
> @customData
```

## Predefined URLs

You can also specify the WebSocket server's url in your `.akitarc` file.

```yaml
url: ws://localhost:3000
```

Then you can run akita without a url argument.

```bash
akita
```

## Headers

You can send headers to the socket request with `--header key:value`
or with the `headers` section of the yaml.

```bash
akita ws://localhost:3000 --header authorization:top_secret
```

or in **.akitarc.yml**

```yaml
headers:
  authorization: top_secret
```

## Using the API

You can use akita programatically by importing it in TypeScript or JavaScript.
You might want to install it as a production dependancy in this case.

Here's an example `script.js`:

```js
const { Akita, EchoServer } = require('akita-ws')

const [, , cmd, ...args] = process.argv

if (cmd === 'run') {
  const [url] = args

  // Run akita with a url
  Akita.run({ url })
}
if (cmd === 'echo') {
  const [port] = args

  EchoServer.run(port)
}
```

> I'm not sure what this is useful for, but it's possible.
> For detailed usage see the [source code](/src).

## Development

Below is information about development on the project.

### Setup

To develop on this repo you will need to have [node.js](https://nodejs.org)
installed on your dev machine and have an understanding of it.
This guide assumes you have the repo checked out and are on macOS.

You'll only need to follow this setup once for your dev machine.

```bash
# Install dependancies
npm install

# (optional) Add an config file (.akitarc, .akitarc.yml, .akitarc.json or .akitarc.js)
touch .akitarc
```

### Regular use

These are the commands you'll regularly run to develop the CLI, in no particular order.

```bash
# Run the CLI directly with ts-node
# -> Runs TypeScript on the fly without transpiles to JavaScript
# -> Use "-s" to stop npm debug output
# -> Use "--" to stop npm stealing CLI arguments
#    (they get passed to npm instead of our CLI)
npm run dev -s --
```

### Irregular use

These are commands you might need to run but probably won't, also in no particular order.

```bash
# Generate the table of contents for this readme
# -> It'll replace content between the toc-head and toc-tail HTML comments
# -> This runs as part of the "preversion" script
npm run gen-readme-toc

# Manually lint code with TypeScript's `tsc`
npm run lint

# Manually format code
# -> This repo is setup to automatically format code on git-push
npm run prettier

# Manually transpile TypeScript to JavaScript
# -> This is part of the packaging which is triggered when deploying
# -> Writes files to dist, which is git-ignored
npm run build

# Manually start code from transpilled JavaScript
npm run start
```

### Code Structure

| Folder       | Contents                                                |
| ------------ | ------------------------------------------------------- |
| dist         | Where the transpiled javascript and type definitions go |
| node_modules | Where npm's modules get installed into                  |
| src          | Where the code for the CLI is                           |

### Code formatting

This repo uses [Prettier](https://prettier.io/) to automatically format code to a consistent standard.
It works using the [husky](https://www.npmjs.com/package/husky)
and [lint-staged](https://www.npmjs.com/package/lint-staged) packages to
automatically format code whenever code is commited.
This means that code that is pushed to the repo is always formatted to a consistent standard.

You can manually run the formatter with `npm run prettier` if you want.

Prettier is slightly configured in [.prettierrc.yml](/.prettierrc.yml)
and also ignores files using [.prettierignore](/.prettierignore).

### Publishing

Use npm's `version` and `publish` command to push a new version to [npmjs.com](https://npmjs.com).

There is a `preversion` that does a few things:

- Runs unit tests
- Generates the table of contents in this readme
- Transpiles typescript assets into javascript & type definitions
- Adds those changes to git

### Future work

Some ideas I've had for where I want this project to go.

- Parameterised / templated predefined messages
- Different / custom serialisation methods (other that `JSON.stringify`)
- Add unit test coverage
- Single usage like `akita ws://localhost @customData @hello ...`
- Read the `akitarc` on the fly incase it changes after starting
- Document piped usage, `cat data.json | akita`

---

> This project was setup with [robb-j/ts-node-base](https://github.com/robb-j/ts-node-base/)
