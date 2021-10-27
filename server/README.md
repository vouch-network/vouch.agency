# VOUCH gun relay & auth server

## Dev

generate an app key pair:

```bash
$ cd server
$ yarn generate-app-key
# output should be kept secret
```

save env variable to .env file:

```bash
$ cp .env.example .env
# save the output from last step in your new file
```

start the server:

```bash
$ yarn
$ yarn start
```

the server runs on port 8765. to start with file watching and server reload enabled:

```bash
$ yarn watch
# instead of yarn start
```
