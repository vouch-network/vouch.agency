export const publicUsersQuery = [
  // only show users with verified emails
  'email_verified:true',
  // since we're manually adding users atm,
  // ensure user has logged in at least once
  'logins_count:[1 TO *]',
  // users must have a display name set
  'NOT user_metadata.display_name:undefined',
  // users can set their own visibility preference
  'user_metadata.enable_public_profile:true',
  // filter out blocked users
  'NOT blocked:true',
];
