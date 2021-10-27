// TODO same file as app/utils/constants.ts
const GUN_PREFIX = {
  membersOnlyEncrypted: 'MOE__',
};

const GUN_PATH = {
  profile: 'P',
  profiles: 'Ps',
  vouches: 'Vs',
  settings: 'Ss',
  chatRoom: `${GUN_PREFIX.membersOnlyEncrypted}Cr`,
  messages: 'Ms',
};

module.exports = {
  GUN_PATH,
};
