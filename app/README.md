# VOUCH AGENCY client

[vouch.agency](https://alpha.vouch.agency)

## Getting Started

### Installation

Create a local env configuration file using the example template:

```bash
$ cp .env.local.example .env.local
```

Generate [Gun](https://gun.eco/docs/API) app access keys:

```bash
$ yarn generate-app-key
```

You should see something like:

```bash
> This is your secret app key pair.
> Add this to your .dotenv file:
> APP_ACCESS_KEY_PAIR='{"pub":"somelongstring","priv":"somelongstring","epub":"somelongstring","epriv":"somelongstring"}'
```

Copy `APP_ACCESS_KEY_PAIR` and add it to your new `.env.local` file. Fill out the rest of the env variables according to the comments in the file (env variables might be in flux while in alpha)

Install dependencies:

```bash
yarn
```

### Development

Run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying files under `/pages`. The page auto-updates as you edit the file.

The `/pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## API routes

WIP

### POST `/api/auth/login`

Starts a new user session

### POST `/api/auth/logout`

Ends user session

### GET `/api/auth/user`

Gets current user from session

### POST `/api/network/certificates`

Creates new certificate to use with `gun.put` to non-user spaces

### GET `/api/network/tokens`

Creates new token to use with gun relay server (see [Gun relay server](../server))

### GET `/api/network/invites/generate`

Generates new invite from current user session

### GET `/api/agency/invites/validate/[hash]`

Validates invite

## gunDB

WIP should look something like:

```js
import { GUN_PATH, GUN_KEY, GUN_VALUE } from 'utils/constants';

// settings
// security: only self can put, encrypt own data
const userSettings = gun
  .user()
  .get(GUN_PATH.settings)
  .put({ [GUN_KEY.contactEmail]: '' });

// profiles
// security: all members can put profiles with own username
gun
  .get(`~${NEXT_PUBLIC_GUN_APP_PUBLIC_KEY}`)
  .get(GUN_PATH.profiles)
  .get(`${username}/${GUN_PATH.profiles}`)
  .put(
    { [GUN_KEY.displayName]: 'A', [GUN_KEY.isListed]: true }
    // callback
    // options with certificate
  );

// vouches
// security: all members can put vouches with own username
gun
  .get(`~${NEXT_PUBLIC_GUN_APP_PUBLIC_KEY}`)
  .get(GUN_PATH.vouches)
  .get(`${username}/${GUN_PATH.vouches}`)
  .put(
    {
      [GUN_KEY.vouchType]: GUN_VALUE.vouched,
      [GUN_KEY.timestamp]: Date.now(),
      [GUN_KEY.byUsername]: invitedByUsername,
    }
    // callback
    // options with certificate
  );

// chatroom messages
// security: encrypted, all members with profiles can put chatRoom
const chatRoom = gun.get(GUN_PATH.chatRoom).get(GUN_PATH.messages);
const message = gun.get(`${GUN_PATH.vouches}/usernameA`);
```

sign up flow:

```js
import { GUN_PATH, GUN_KEY, GUN_VALUE } from 'utils/constants';

const user = gun.user();

user.create(username, passphrase, () => {
  user.auth(username, passphrase, () => {
    // get token here

    user.get(GUN_PATH.settings).put({ [GUN_KEY.contactEmail]: '' });

    // get certificate here

    const vouches = gun.get(GUN_PATH.vouches);
    const vouchedBy = gun.get(`${GUN_PATH.vouches}/usernameA`).put({
      [GUN_KEY.vouchType]: GUN_VALUE.vouched,
      [GUN_KEY.timestamp]: Date.now(),
      [GUN_KEY.byUsername]: 'usernameB',
    });

    vouches.set(vouchedBy);
  });
});
```
