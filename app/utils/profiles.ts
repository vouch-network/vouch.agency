import type { Media } from 'utils/media';

export interface PublicProfile {
  displayName: string;
  location?: string;
  pronouns?: string;
  bio?: string;
  avatar?: string; // `${photoName}|${url}`
  // profileMedia?: { [key: string]: Media };
}

export interface PrivateProfile {
  id: string;
  username: string;
  contactEmail: string;
}
