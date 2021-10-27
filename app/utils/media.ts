export const USER_UPLOAD_PREFIX = 'user-upload_';
export const PROFILE_PHOTOS_PREFIX = 'profile-photo_';

export interface Media {
  id?: string;
  url: string;
  timestamp?: number;
  fileName?: string;
}

export interface UserMedia {
  // profilePhoto: Media | {};
  // profileMedia: { [key: string]: Media };
}

export const MB_BYTES = 1048576;
export const MAX_FILE_SIZE = MB_BYTES * 1;
