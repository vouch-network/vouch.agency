# ![Vouch Agency](https://storageapi.fleek.co/b569cdba-d8a1-4abf-ae65-e351377e4b12-bucket/vouch-dotagency/vouch-agency-logo.svg)

alpha, may break or be broken

see docs for:

- [Next.js app](./app#readme) ([alpha.vouch.agency](https://alpha.vouch.agency))
- [Gun relay peer](./server#readme)

gen keys:

```bash
# you'll want to come up with a naming convention that matches the environment
# e.g. `local-private.pem`/`local-public.pem`
$ openssl genrsa -out .keys/private.pem 3072
$ openssl rsa -in .keys/private.pem  -pubout -out .keys/public.pem
```

local dev:

add private key to app env vars:

```bash
$ echo -e "APP_PRIVATE_KEY=\"$(cat .keys/local-private.pem)\"" >> app/.env.local
```

add public key to server:

```bash
$ echo -e "APP_PUBLIC_KEY=\"$(cat .keys/local-public.pem)\"" >> server/.env
```

prod:

vercel:

```bash
$ cd app
$ vercel env add APP_PRIVATE_KEY production < ../.keys/private.pem
```
