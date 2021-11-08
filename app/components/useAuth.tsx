import { useState, useEffect, useRef, createContext, useContext } from 'react';
import axios from 'axios';
import { Magic, RPCError, RPCErrorCode } from 'magic-sdk';
import { Box, Text, Layer } from 'grommet';

import useApiToken from 'components/useApiToken';
import { encode } from 'utils/base64';
import type { AuthUser, CallbackParams } from 'utils/auth';

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

// login flow:
// login() -> loginCallback()
interface ContextValue {
  login: (arg: LoginParams, params: CallbackParams) => Promise<void>;
  logout: () => Promise<any>;
  loginCallback: (arg?: CallbackParams) => Promise<AuthUser>;
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

export const AuthProvider = ({ children }: Props) => {
  const magicRef = useRef<Magic>();
  const { setTokenGetter } = useApiToken();
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loginInfo, setLoginInfo] = useState<{
    email: string;
  }>();

  const initClient = async () => {
    const magic = new Magic(NEXT_PUBLIC_MAGIC_API_KEY, {
      // Use test mode to assert desired behavior
      // Success: test+success@magic.link
      // Failure: test+fail@magic.link
      // See https://magic.link/docs/introduction/test-mode
      // testMode: true,
    });

    try {
      setIsLoggedIn(await magic.user.isLoggedIn());
    } catch {}

    setTokenGetter(async () => {
      try {
        await magic.user.getIdToken();
      } catch {}
    });

    magicRef.current = magic;

    setIsReady(true);
  };

  useEffect(() => {
    initClient();
  }, []);

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
      const callbackParams: CallbackParams = params;
      const callbackHash = encode(callbackParams);

      let redirectPath = callbackParams.isNewUser ? 'signup' : 'callback';

      // NOTE .login will resolve once the user clicks the email link,
      // not when they finish the callback flow. This means we can use
      // the identity token that's returned to get the user information
      // before completing log in
      await magicRef.current!.auth.loginWithMagicLink({
        email,
        // email: 'test+success@magic.link',
        redirectURI: `${window.origin}/auth/magic/${redirectPath}/${callbackHash}`,
        showUI: false,
      });
    } catch (err) {
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

    setLoginInfo(undefined);
  };

  // Finish logging user in
  const loginCallback: ContextValue['loginCallback'] = async ({
    username,
  } = {}) => {
    try {
      const identityToken = await magicRef.current!.auth.loginWithCredential();

      console.log({ identityToken });

      const { data } = await axios.get('/api/auth/identity/metadata', {
        headers: {
          authorization: `Bearer ${identityToken}`,
        },
      });

      if (data.authenticated) {
        console.log('username:', username);
        // TODO verify user in gun if existing user
        // const gunUserById = await getGun()!
        // .get(`${GUN_PREFIX.id}:${data.id}`)
        // // @ts-ignore
        // .then();

        setIsLoggedIn(true);

        return data.user;
      } else {
        setIsLoggedIn(false);
      }
    } catch (err) {
      console.log('loginCallback err:', err);

      setIsLoggedIn(false);
    }
  };

  const logout: ContextValue['logout'] = async () => {
    if (magicRef.current) {
      await magicRef.current!.user.logout();

      setIsLoggedIn(false);
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
