# VOUCH AGENCY Gun Relay Server

[Gun](https://gun.eco/docs/API) relay server for [vouch.agency](https://alpha.vouch.agency) browser peers.

This server is not necessary in order to run the Next.js app, but will enhance persistence and distribution between client peers.

## Development

Create .env file:

```bash
$ cp .env.local.example .env.local
```

Follow instructions in the repo README to generate a public/private key pair and save the public key to the server env variables.

Install and start the server:

```bash
$ yarn
$ yarn start
```

The server runs on port 8765. To start with file watching, debugging and server reload enabled:

```bash
$ yarn watch
# instead of yarn start
```

## Deploy

This server can be deployed anywhere (such as [fly](https://fly.io/)) and can exist in as many instances as needed, as long it has the app public key.

Once deployed, the URLs of all relay peers should be set in Next.js app env variables as `NEXT_PUBLIC_GUN_PEERS`.
