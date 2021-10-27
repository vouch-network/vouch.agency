// TODO same file as server/constants.js
export const GUN_PREFIX = {
  membersOnlyEncrypted: 'MOE__',
};

export const GUN_PATH = {
  profile: 'P',
  profiles: 'Ps',
  vouches: 'Vs',
  settings: 'Ss',
  chatRoom: `${GUN_PREFIX.membersOnlyEncrypted}Cr`,
  messages: 'Ms',
};

export const GUN_KEY = {
  // user profiles
  isListed: 'iL',
  displayName: 'dN',
  pronouns: 'pn',
  location: 'loc',
  bio: 'bi',
  profilePhoto: 'pP',
  profileMedia: 'pM',
  // user settings
  contactEmail: 'cE',
  // vouches
  vouchType: 'vT',
  timestamp: 't',
  byUsername: 'bU',
  // chat messages
  messageText: 'mT',
};

export const GUN_VALUE = {
  // vouches
  vouched: 1,
  unvouched: 0,
};
