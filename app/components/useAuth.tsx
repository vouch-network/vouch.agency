import { useState, useEffect, useRef, createContext, useContext } from 'react';
import axios from 'axios';
import { Magic, RPCError, RPCErrorCode } from 'magic-sdk';
import { Box, Text, Layer } from 'grommet';

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

type AuthHeader = {
  authorization: string; // Bearer {identity token}
};

// login flow:
// login() -> loginCallback()
interface ContextValue {
  login: (arg: LoginParams, params: CallbackParams) => Promise<AuthUser>;
  logout: () => Promise<any>;
  loginCallback: () => Promise<any>;
  getUser: () => Promise<AuthUser | undefined>;
  getAuthHeader: () => Promise<AuthHeader | undefined>;
  isLoggedIn: boolean;
  isReady: boolean;
}

export const AuthContext = createContext<ContextValue>({
  login: () => Promise.reject(new Error('Auth not ready')),
  logout: () => Promise.reject(new Error('Auth not ready')),
  loginCallback: () => Promise.reject(new Error('Auth not ready')),
  getUser: () => Promise.reject(new Error('Auth not ready')),
  getAuthHeader: () => Promise.reject(new Error('Auth not ready')),
  isReady: false,
  isLoggedIn: false,
});

export const AuthProvider = ({ children }: Props) => {
  const magicRef = useRef<Magic>();
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

    magicRef.current = magic;

    try {
      setIsLoggedIn(await magicRef.current.user.isLoggedIn());
    } catch {}

    setIsReady(true);
  };

  useEffect(() => {
    initClient();
  }, []);

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
      const identityToken = await magicRef.current!.auth.loginWithMagicLink({
        email,
        // email: 'test+success@magic.link',
        redirectURI: `${window.origin}/auth/magic/${redirectPath}/${callbackHash}`,
        showUI: false,
      });

      // Parse user ID and email in token
      const { data } = await axios.get('/api/auth/identity/metadata', {
        headers: {
          authorization: `Bearer ${identityToken}`,
        },
      });

      setLoginInfo(undefined);

      return data.user;
    } catch (err) {
      console.error(err);

      setLoginInfo(undefined);

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

  const logout: ContextValue['logout'] = async () => {
    if (magicRef.current) {
      setIsLoggedIn(false);

      await magicRef.current!.user.logout();
    }
  };

  const loginCallback: ContextValue['loginCallback'] = async () => {
    if (magicRef.current) {
      try {
        await magicRef.current.auth.loginWithCredential();

        setIsLoggedIn(await magicRef.current.user.isLoggedIn());
      } catch (err) {
        console.log('loginCallback err:', err);

        setIsLoggedIn(false);
      }
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

  const getAuthHeader: ContextValue['getAuthHeader'] = async () => {
    if (magicRef.current) {
      try {
        const idToken = await magicRef.current.user.getIdToken();

        return {
          authorization: `Bearer ${idToken}`,
        };
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
        getAuthHeader,
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
