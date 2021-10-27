import type { User as Auth0User } from 'auth0';
import shorthash from 'shorthash';

import type { Media } from 'utils/media';

export interface GunUser {
  pub: string;
  username: string;
}

export interface PublicProfile {
  displayName: string;
  location?: string;
  pronouns?: string;
  bio?: string;
  // map of time vouched to voucher's pub key
  vouchedBy?: { [timestamp: number]: string };
  isListed?: boolean;
  profilePhoto: Media | {};
  profileMedia: { [key: string]: Media };
}

export interface PrivateProfile {
  username: string;
  contactEmail?: string;
  hiddenProfile?: PublicProfile;
}

export function userToPublicProfile(
  user: Auth0User,
  media?: Media
): PublicProfile {
  return {
    // username: user.username as string,
    displayName: user.user_metadata?.display_name,
    location: user.user_metadata?.location_str,
    pronouns: user.user_metadata?.pronouns_str,
    bio: user.user_metadata?.bio_text,
    profilePhoto: {},
    profileMedia: {},
  };
}

export function userToPrivateProfile(
  user: Auth0User,
  media?: Media
): PrivateProfile {
  return {
    ...userToPublicProfile(user, media),
    contactEmail: user.email!,
    username: user.username!,
    // emailVerified: user.email_verified!,
    // enablePublicProfile: user.user_metadata?.enable_public_profile || false,
  };
}

export function usersToPublicProfiles(
  users: Auth0User[],
  media: {
    [username: string]: Media;
  } = {}
) {
  const profiles: PublicProfile[] = users.map((user) => ({
    id: shorthash.unique(`${user.username}-vouch-agency`) as string,
    ...userToPublicProfile(user, media[user.username!]),
  }));

  return profiles;
}
