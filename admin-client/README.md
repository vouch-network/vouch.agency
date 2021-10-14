# admin client

built with [react-static](https://github.com/react-static/react-static).

## dev

tested with node v16. i recommend running commands with [docker](https://docs.docker.com/get-started/) for version sanity.

install dependencies:

```bash
$ yarn
# or
# npm install
```

run the dev server without docker:

```bash
$ yarn start
# or
# npm start
```

run dev server with docker:

```bash
$ docker run -it --rm --name vouch-agency-admin-client -v "$PWD":/usr/src/app -w /usr/src/app -p 3000:3000 node:16 yarn start
```

build site for production:

```bash
$ yarn build
# or
# npm run build
# with docker:
# docker run -it --rm --name vouch-agency-admin-client -v "$PWD":/usr/src/app -w /usr/src/app node:16 yarn build
```
