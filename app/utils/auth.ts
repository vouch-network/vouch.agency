import type { Base64Hash } from 'utils/crypto';

export type AuthUser = {
  id: string;
  email: Base64Hash; // should always be encrypted
  // publicAddress?: string;
};

export type AuthMetadata = {
  authenticated: boolean;
  user: AuthUser | null;
};

export type AuthSession = {
  user: AuthUser;
};

export type CallbackParams = {
  isNewUser?: boolean;
};
