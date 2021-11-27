# VOUCH AGENCY Gun Relay Server

[Gun](https://gun.eco/docs/API) relay server for [vouch.agency](https://beta.vouch.agency) browser peers.

This server is not necessary in order to run the Next.js app, but will enhance persistence and distribution between client peers.

## Development

Create .env file:

```bash
$ cp .env.example .env
```

Copy the `APP_ACCESS_TOKEN_SECRET` from '/app/.env.local` to the new server .env. Generate and copy to the app .env if this value doesn't exist yet.

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

This server can be deployed anywhere (such as [fly](https://fly.io/)) and can exist in as many instances as needed.

Once deployed, the URLs of all relay peers should be set in Next.js app env variables as `NEXT_PUBLIC_GUN_PEERS`.
