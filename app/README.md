# VOUCH AGENCY client

[vouch.agency](https://beta.vouch.agency)

## Getting Started

### Installation

Create a local env configuration file using the example template:

```bash
$ cp .env.local.example .env.local
```

Install dependencies:

```bash
yarn
```

### Development

Run the development server:

```bash
yarn dev
```

Open [http://localhost:8000](http://localhost:8000) with your browser to see the result.

You can start editing the page by modifying files under `/pages`. The page auto-updates as you edit the file.

The `/pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## API routes

WIP

### GET `/api/network/tokens`

Creates new token to use with gun relay server (see [Gun relay server](../server))

### GET `/api/network/invites/generate`

Generates new invite from current user session

### GET `/api/agency/invites/validate/[hash]`

Validates invite

## gunDB

Users can only update nodes with their user ID in the path. References will work too (e.g. `gun.get('not-my-id').put(gun.get('my-id').put(data))`)

WIP should look something like:

```ts
// magic auth
interface Auth {
  issuer: string; // aka user ID, used interchangably with `id`
  email: string; // login email, private
}
```

```ts
// gun db
interface User {
  // indexed by id (issuer)
  username: string; // username may change
}

interface Profile {
  // indexed by username
  displayName: string;
  avatar: string;
}

interface ExtendedProfile {
  // indexed by id
  location: string;
  pronouns: string;
  bio: string;
}

// TODO
interface Invite {
};

type Profiles = {
  [id]: /* username: */ string;
}[];

const graph = {
  'app:profiles': {
    'username:alice': user1Reference,
    'username:bob': user2Reference,
    'username:celine': user3Reference,
  },
  'app:vouches': {
    'id:id_2': {
      1111111111111: 'id:id_1|0',
      1111111111112: 'id:id_3|0',
    },
    'id:id_3': {
      1111111111113: 'id:id_1|1',
    },
  },
  'id:id_1': {
    username: 'alice',
  },
  'id:id_2': {
    username: 'bob',
  },
  'id:id_3': {
    username: 'celine',
  },
  'id:id_1/profile':: {
    displayName: 'Alice',
  },
  'id:id_2/profile': {
    displayName: 'Bob',
  },
  'id:id_3/profile': {
    displayName: 'Celine',
  },
  'email:encrypted_email_1': {
    displayName: 'Celine',
  },
};

const userId = auth.issuer;

// get current user
gun.get(`id:${userId}`)

// update current user
gun.get(`id:${userId}`).get('username').put(username);

// get profile
gun.get(`id:${userId}/profile`);

// update profile
gun.get(`id:${userId}/profile`).get('avatar').put(`${photoName}|${url}`);
gun.get(`id:${userId}/profile`).get('location').put('earth');

// get all profiles
gun.get('app:profiles').map((data, username) => {
  gun.get(`${id}/profile`);
});

// get profile by username
gun.get('app:profiles').get(`username:${username}`)

// add profile
const profile = gun.get(`id:${userId}/profile`)
gun.get('app:profiles').get(`username:${username}`).put(profile);

// hide/remove profile
gun.get('app:profiles').get(`username:${username}`).put(null);

// get vouches given by a user
gun
  .get('app:vouches')
  .get(`id:${giverUser}`)

// get vouches received by a user
gun.get(`id:${currentUserId}/vouches`).map();

// give vouch to a user
const timestamp = Date.now();
const vouch = gun
  .get('app:vouches')
  .get(`id:${currentUserId}`)
  .put({
    [timestamp]: `id:${receiverId}|${vouchType}`,
  });

gun.get(`id:${receiverId}/vouches`).put(vouch);

// invite user
const timestamp = Date.now();
const invite = gun.get('app:invites')
  .get(`email:${receiverEmail}`)
  .put({
    invitedBy: `id:${currentUserId}`,
    timestamp: timestamp
  });

gun.get(`id:${currentUserId}/invites`).put(invite)

// accept invite
const user = gun.get(`id:${userId}`)
gun.get('app:invites')
  .get(`email:${userEmail}`)
  .get('user')
  .put(user);
```

```ts
// web3 storage backup
// TODO
```

Sign up flow:

Send login email -> Click login email, get DID -> Check invite -> Login callback -> Save to gun db

gun:

```ts
const newUserId = 'new_user_id';
const newUserEmail = 'new_user_email';
const newUserUsername = 'new_user';
const gun = getGun()!;

// turn invite into vouch
const invite = gun.get('app:vouches/pending').get(`email:${receiverEmail}`);
const vouch = gun
  .get('app:vouches')
  .get(`id:${newUserId}`)
  .put({
    [invite.timestamp]: `${invitedBy}|${VouchType.Vouched}`,
  });

gun.get(`id:${newUserId}/vouches`).put(vouch);

// update username
gun
  .get(`${GUN_PREFIX.id}:${newUserId}`)
  .put({ [GUN_KEY.username]: newUserUsername });

// create profile
const profile = gun
  .get(`${GUN_PREFIX.id}:${newUserId}/${GUN_PATH.profile}`)
  .put({ [GUN_KEY.displayName]: 'New User' });

gun
  .get(`${GUN_PREFIX.app}:${GUN_PATH.profiles}`)
  .get(`${GUN_PREFIX.username}:${newUserUsername}`)
  .put(profile);
```
