import { useState, useEffect, useRef, createContext, useContext } from 'react';
import axios from 'axios';
import { Magic, RPCError, RPCErrorCode } from 'magic-sdk';
import { Box, Text, Layer } from 'grommet';

import useApiToken from 'components/useApiToken';
import useGun from 'components/useGun';
import { encode } from 'utils/base64';
import { id } from 'utils/gunDB';
import type { AuthUser, AuthMetadata, CallbackParams } from 'utils/auth';

const NEXT_PUBLIC_MAGIC_API_KEY = process.env.NEXT_PUBLIC_MAGIC_API_KEY;

if (!NEXT_PUBLIC_MAGIC_API_KEY) {
  throw new Error('NEXT_PUBLIC_MAGIC_API_KEY in env environment required');
}

interface Props {
  children: React.ReactNode;
}

type LoginParams = {
  email: string;
};
export type Login = Promise<AuthMetadata | void>;

type IdentityToken = string;

// login flow:
// login() -> loginCallback()
interface ContextValue {
  login: (arg: LoginParams, params: CallbackParams) => Login;
  logout: () => Promise<any>;
  loginCallback: () => Promise<AuthUser | null | void>;
  getUser: () => Promise<AuthUser | undefined>;
  isLoggedIn: boolean;
  isReady: boolean;
}

export const AuthContext = createContext<ContextValue>({
  login: () => Promise.reject(new Error('Auth not ready')),
  logout: () => Promise.reject(new Error('Auth not ready')),
  loginCallback: () => Promise.reject(new Error('Auth not ready')),
  getUser: () => Promise.reject(new Error('Auth not ready')),
  isReady: false,
  isLoggedIn: false,
});

// state:
// [empty] -> ready
//  ready -> authenticated
//  ready -> sentEmail
//  ready -> sendEmailFailed
//  sendEmailFailed -> sentEmail
//   sentEmail -> gotMetadataFromEmailToken
//   sentEmail -> getUserFromEmailTokenFailed
//   getUserFromEmailTokenFailed -> gotMetadataFromEmailToken
//    gotMetadataFromEmailToken -> authenticated
//    authenticated -> authenticationFailed
//     authenticated -> ready
const STATE = {
  empty: '[empty]',
  ready: 'ready',
  sendEmailFailed: 'sendEmailFailed',
  sentEmail: 'sentEmail',
  getUserFromEmailTokenFailed: 'getUserFromEmailTokenFailed',
  gotMetadataFromEmailToken: 'gotMetadataFromEmailToken',
  authenticated: 'authenticated',
  authenticationFailed: 'authenticationFailed',
} as const;
type State = typeof STATE[keyof typeof STATE];

export const AuthProvider = ({ children }: Props) => {
  const magicRef = useRef<Magic>();
  const { setApiToken } = useApiToken();
  const { getGun } = useGun();
  const [authState, setAuthState] = useState<State>(STATE.empty);
  const [loginInfo, setLoginInfo] = useState<{
    email: string;
  }>();
  const isReady = authState === STATE.ready;
  const isLoggedIn = authState === STATE.authenticated;

  const initClient = async () => {
    const magic = new Magic(NEXT_PUBLIC_MAGIC_API_KEY, {
      // Use test mode to assert desired behavior
      // Success: test+success@magic.link
      // Failure: test+fail@magic.link
      // See https://magic.link/docs/introduction/test-mode
      // testMode: true,
    });

    magicRef.current = magic;

    setAuthState(STATE.ready);

    try {
      const isLoggedIn = await magic.user.isLoggedIn();

      if (isLoggedIn) {
        setAuthState(STATE.authenticated);
        setApiToken(await magic.user.getIdToken());
      }
    } catch {}
  };

  useEffect(() => {
    initClient();
  }, []);

  const getMetadataFromToken = async (
    identityToken: IdentityToken | null
  ): Promise<AuthMetadata> => {
    if (!identityToken) {
      return {
        authenticated: false,
        user: null,
      };
    }

    const { data } = await axios.get('/api/auth/identity/metadata', {
      headers: {
        authorization: `Bearer ${identityToken}`,
      },
    });

    return data;
  };

  // Initiate login
  // Must be finished with login callback to complete authentication
  const login: ContextValue['login'] = async ({ email }, params) => {
    setLoginInfo({
      email,
    });

    if (isLoggedIn) {
      try {
        await magicRef.current!.user.logout();
      } catch {}
    }

    try {
      const redirectPath = params.isNewUser ? 'signup' : 'callback';

      // NOTE .login will resolve once the user clicks the email link,
      // not when they finish the callback flow. This means we can use
      // the identity token that's returned to get the user information
      // before completing log in
      const identityToken = await magicRef.current!.auth.loginWithMagicLink({
        email,
        // email: 'test+success@magic.link',
        redirectURI: `${window.origin}/auth/magic/${redirectPath}`,
        showUI: false,
      });

      setAuthState(STATE.sentEmail);

      try {
        const metadata = await getMetadataFromToken(identityToken);

        setAuthState(STATE.gotMetadataFromEmailToken);

        // Enable making API requests with unauthenticated user
        setApiToken(identityToken);

        return metadata;
      } catch {
        setAuthState(STATE.getUserFromEmailTokenFailed);
      }
    } catch (err) {
      setAuthState(STATE.sendEmailFailed);

      console.error(err);

      if (err instanceof RPCError) {
        switch (err.code) {
          case RPCErrorCode.MagicLinkRateLimited:
            throw new Error('Logins disabled. Contact sua');
          case RPCErrorCode.UserAlreadyLoggedIn:
            throw new Error(
              "You're already logged in. Try refreshing your tabs."
            );
          case RPCErrorCode.MagicLinkFailedVerification:
          case RPCErrorCode.MagicLinkExpired:
          default:
            throw new Error('Something went wrong. Try logging in again.');
        }
      }

      throw new Error("Couldn't get you logged in. Try logging in again.");
    }
  };

  // Finish logging user in
  // TODO clean up nesting
  const loginCallback: ContextValue['loginCallback'] = async () => {
    try {
      const identityToken = await magicRef.current!.auth.loginWithCredential();

      setApiToken(identityToken);

      const data = await getMetadataFromToken(identityToken);

      if (data.authenticated && data.user) {
        // Verify user in db
        const gun = getGun();
        const gunUser = await (gun
          ? gun
              .get(id(data.user.id))
              // @ts-ignore
              .then()
          : null);

        if (gunUser) {
          setAuthState(STATE.authenticated);
        } else {
          // TODO handle
          setAuthState(STATE.authenticationFailed);
        }
      } else {
        setAuthState(STATE.authenticationFailed);
      }

      return data.user;
    } catch (err) {
      console.log('loginCallback err:', err);
      setAuthState(STATE.authenticationFailed);
    }

    // setLoginInfo(undefined);
  };

  const logout: ContextValue['logout'] = async () => {
    if (magicRef.current) {
      setApiToken(null);

      await magicRef.current!.user.logout();

      setAuthState(STATE.ready);
    }
  };

  const getUser: ContextValue['getUser'] = async () => {
    if (magicRef.current) {
      try {
        const { issuer, email } = await magicRef.current.user.getMetadata();

        return {
          id: issuer,
          email,
        } as AuthUser;
      } catch {}
    }
  };

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('useAuth[authState]:', authState);
    }
  }, [authState]);

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        loginCallback,
        getUser,
        isReady,
        isLoggedIn,
      }}
    >
      <>
        {children}

        {loginInfo && (
          <Layer>
            <Box pad="large" width="medium" gap="medium">
              <Text as="p" margin="none" weight="bold" textAlign="center">
                Sent email with magic log in link to{' '}
                <Text color="brand">{loginInfo.email}</Text>
              </Text>
              <Text as="p" margin="none" textAlign="center">
                Check your inbox, but don't close this window.
              </Text>
            </Box>
          </Layer>
        )}
      </>
    </AuthContext.Provider>
  );
};

export default function useUser() {
  return useContext(AuthContext);
}
