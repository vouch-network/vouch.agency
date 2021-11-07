export type AuthUser = {
  id: string;
  email: string;
  // publicAddress?: string;
};

export type AuthSession = {
  user: AuthUser;
};

export type CallbackParams = {
  username?: string;
  isNewUser?: boolean;
  signupToken?: string;
};

export type SignupToken = {
  uuid: string;
  invitedByIdentifier: string;
};
