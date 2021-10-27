# VOUCH AGENCY Gun Relay Server

[Gun](https://gun.eco/docs/API) relay server for persisting data between [vouch.agency](https://alpha.vouch.agency) peers.

## Dev

create .env file:

```bash
$ cp .env.example .env
# see comments in file
```

install and start the server:

```bash
$ yarn
$ yarn start
```

the server runs on port 8765. to start with file watching, debugging and server reload enabled:

```bash
$ yarn watch
# instead of yarn start
```
