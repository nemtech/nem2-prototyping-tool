# NEM2 Prototyping Tool

A collection of Node-RED nodes for prototyping NEM blockchain applications.

[Node-RED] is a programming tool for wiring together hardware devices, APIs and online services in new and interesting ways.

It provides a browser-based editor that makes it easy to wire together flows using the wide range of nodes in the palette that can be deployed to its runtime in a single-click.

:warning: NEM2 Prototyping Tool is currently under development and does not encrypt account's private keys. Use it just for prototyping.

## Installation


Install Node-RED:

`npm install -g node-red`

Clone this repository:

`git clone <url>`

Install required packages using npm:

`npm install`

Create a symbolic link:

`npm link`

`cd ~/.node-red/`

`npm link /path/to/cloned-repository/`

Run Node-RED:

`node-RED`

NEM2 Prototyping Tool works on Node-RED 0.18.4.

## Contributing

This project is developed and maintained by NEM Foundation. Contributions are welcome and appreciated. You can find [NEM Node-RED on GitHub][self];
Feel free to start an issue or create a pull request. Check [CONTRIBUTING](CONTRIBUTING.md) before start.

## Running tests

Go to the folder where you stored the repository and run:
`npm test`

## Getting help

We use GitHub issues for tracking bugs and have limited bandwidth to address them.
Please, use the following available resources to get help:

- If you found a bug, [open a new issue][issues]

## License

Copyright (c) 2018 NEM
Licensed under the [Apache License 2.0](LICENSE)

[self]: https://github.com/nemtech/nem2-prototyping-tool
[issues]: https://github.com/nemtech/nem2-prototyping-tool/issues
[Node-RED]: https://nodered.org/