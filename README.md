# ![Vouch Agency](https://storageapi.fleek.co/b569cdba-d8a1-4abf-ae65-e351377e4b12-bucket/vouch-dotagency/vouch-agency-logo.svg)

alpha, may break or be broken

see docs for:

- [Next.js app](./app#readme) ([beta.vouch.agency](https://beta.vouch.agency))
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
$ awk '{printf "%s\\n", $0}' .keys/local-private.pem | awk '{print "APP_PRIVATE_KEY=\""$0"\""}' >> app/.env.local
```

add public key to server:

```bash
$ awk '{printf "%s\\n", $0}' .keys/local-public.pem | awk '{print "APP_PUBLIC_KEY=\""$0"\""}' >> server/.env.local
```

prod:

vercel:

```bash
$ cd app
$ vercel env add APP_PRIVATE_KEY production < ../.keys/private.pem
```
