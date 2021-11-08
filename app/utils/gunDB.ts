const GUN_PREFIX = {
  app: 'dev-A',
  id: 'dev-I',
  username: 'dev-U',
  email: 'dev-E',
} as const;

export const GUN_PATH = {
  users: 'dev-Uss',
  user: 'dev-Us',
  vouches: 'dev-Vs',
  profiles: 'dev-Ps',
  profile: 'dev-P',
  invites: 'dev-Ivs',
  invite: 'dev-Iv',
} as const;

const gunKeys = [
  'invitedBy',
  'timestamp',
  'id',
  'isListed',
  'displayName',
  'pronouns',
  'location',
  'bio',
  'avatar',
  'username',
] as const;
type GunKey = typeof gunKeys[number];

export const GUN_KEY: Record<GunKey, string> = {
  // invites
  invitedBy: 'iB',
  timestamp: 't',
  // user profiles
  id: 'i',
  isListed: 'iL',
  displayName: 'dN',
  pronouns: 'pn',
  location: 'loc',
  bio: 'bi',
  avatar: 'pP',
  // user settings
  username: 'uN',
} as const;

type GunData = Record<GunKey, any>;
type GunKeyTerse = typeof GUN_KEY[keyof typeof GUN_KEY];

export const path = (...args: string[]) => args.join('/');
export const app = (app: string) => `${GUN_PREFIX.app}:${app}`;
export const id = (id: string) => `${GUN_PREFIX.id}:${id}`;
export const email = (email: string) => `${GUN_PREFIX.email}:${email}`;
export const username = (username: string) =>
  `${GUN_PREFIX.username}:${username}`;

// prepare data before saving to gunDB
export const preparePutValue = (data: Partial<GunData>) =>
  Object.keys(data).reduce((acc, k) => {
    const key = k as GunKey;
    const val: any = data[key];

    if (typeof val === 'undefined') {
      return acc;
    }

    const dbKey = GUN_KEY[key];

    if (!dbKey) {
      console.debug(`gunDB key doesn't exist: ${key}, not saving`);
      return acc;
    }

    return {
      ...acc,
      [dbKey]: val,
    };
  }, {});

// expand terse gunDB keys
const swappedKeyMap = Object.keys(GUN_KEY).reduce(
  (acc, key) => ({
    ...acc,
    // @ts-ignore
    [GUN_KEY[key]]: key,
  }),
  {}
);

export const expandDataKeys = (
  value: Partial<Record<GunKeyTerse, any>>
): Partial<GunData> =>
  value
    ? Object.keys(value).reduce((acc, key) => {
        if (typeof value[key] === 'undefined') {
          return acc;
        }

        // @ts-ignore
        const expandedKey = swappedKeyMap[key];

        if (!expandedKey) {
          return acc;
        }

        return {
          ...acc,
          [expandedKey]: value[key],
        };
      }, {})
    : {};

// Parse ID from path, e.g. `id:some_id`
export const parseId = (value: string): string =>
  typeof value === 'string' ? value.slice(GUN_PREFIX.id.length + 1) : '';
