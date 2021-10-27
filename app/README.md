# VOUCH client

## Getting Started

save env variables to .env file:

```bash
$ cp .env.example .env
# add just the public key from your server env here
# see server README for instructions
```

see example file--might be in flux while in alpha

run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

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
