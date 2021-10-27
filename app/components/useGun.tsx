/*
 * Usage example:
 *   import useGunContext from './useGunContext'
 *   // ...
 *   const { getGun, getUser } = useGunContext()
 *
 *   getGun().get('ours').put('this')
 *   getUser().get('mine').put('that')
 */
import axios, { CancelTokenSource } from 'axios';
import React, {
  createContext,
  useContext,
  useRef,
  useEffect,
  useState,
} from 'react';
import { Layer, Box, Text } from 'grommet';
import type { IGunChainReference } from 'gun/types/chain';
import type { IGunCryptoKeyPair } from 'gun/types/types';
import Gun from 'gun/gun';

import EnterPasswordForm from 'components/EnterPasswordForm';
import type { GunUser } from 'utils/profiles';

const NEXT_PUBLIC_GUN_SERVER_URL = process.env.NEXT_PUBLIC_GUN_SERVER_URL;

interface Props {
  children: React.ReactNode;
  sessionUser?: GunUser;
}

interface ContextValue {
  getGun: () => IGunChainReference | undefined;
  getUser: () => IGunChainReference | undefined;
  getCertificate: () => string | undefined;
  setCertificate: (cert: string) => void;
  getAccessToken: () => string | undefined;
  setAccessToken: (token: string) => void;
  login: (value: any) => Promise<any>;
  logout: () => void;
  triggerReauthentication: (username: string) => Promise<void>;
  isReady: boolean;
  isAuthenticated: boolean;
  needsReauthentication: string | undefined;
}

// TODO memo
const GunContext = createContext<ContextValue>({
  getGun: () => undefined,
  getUser: () => undefined,
  getCertificate: () => undefined,
  setCertificate: () => {},
  getAccessToken: () => undefined,
  setAccessToken: () => {},
  login: () => Promise.resolve(),
  logout: () => {},
  triggerReauthentication: () => Promise.resolve(),
  isReady: false,
  isAuthenticated: false,
  needsReauthentication: undefined,
});

export const GunProvider = ({ children, sessionUser }: Props) => {
  const gunRef = useRef<IGunChainReference>();
  const userRef = useRef<IGunChainReference>();
  const certificateRef = useRef<string>();
  const accessTokenRef = useRef<string>();
  const reauthenticationPromiseRef = useRef<{
    resolve: (value: any | PromiseLike<any>) => void;
    reject: (value: any | PromiseLike<any>) => void;
  }>();
  const credsRequestCancelTokenRef = useRef<CancelTokenSource>();
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [needsReauthentication, setNeedsReauthentication] =
    // string: username
    useState<string>();

  useEffect(() => {
    const initGun = async () => {
      await Promise.all([
        import('gun/lib/radix'),
        import('gun/lib/radisk'),
        import('gun/lib/rindexed'),
        import('gun/lib/store'),
        import('gun/lib/then'),
        import('gun/sea'),
      ]);

      if (!gunRef.current) {
        // @ts-ignore
        Gun.on('opt', (ctx) => {
          if (ctx.once) return;

          ctx.on('out', function (msg: any) {
            // @ts-ignore
            const to = this.to;
            // Adds headers for put
            msg.headers = {
              accessToken: accessTokenRef.current,
            };
            to.next(msg); // pass to next middleware

            if (msg.err === 'Invalid access token') {
              // TODO handle invalid access token
              console.error(msg.err);
            }
          });
        });

        gunRef.current = Gun({
          peers: [`${NEXT_PUBLIC_GUN_SERVER_URL}/gun`],
          // use indexdb instead by including radisk dependencies
          localStorage: false,
          // importing rindexeddb exposes it to window
          store: (window as any).RindexedDB({}),
        });

        // create user
        userRef.current = gunRef.current
          .user()
          .recall({ sessionStorage: true });

        setIsReady(true);
      }

      // @ts-ignore TODO
      gunRef.current.on('auth', async ({ root, sea, err }) => {
        console.debug('gun user authed');

        const user: GunUser = {
          username: await new Promise((resolve) => {
            gunRef.current
              ?.get(`~${sea.pub}`)
              .get('alias')
              .once((v) => {
                // @ts-ignore
                resolve(v);
              });
          }),
          pub: sea.pub,
        };

        if (!err) {
          setIsAuthenticated(true);
        }
      });
    };

    initGun();
  }, []);

  useEffect(() => {
    const getCreds = async () => {
      credsRequestCancelTokenRef.current = axios.CancelToken.source();

      // get new certificate and token
      try {
        await Promise.all([
          axios
            .post(`/api/private/tokens`, sessionUser, {
              cancelToken: credsRequestCancelTokenRef.current.token,
            })
            .then(({ data }) => {
              // store token in app memory
              accessTokenRef.current = data.accessToken;
            }),
          axios
            .post(`/api/private/certificates`, sessionUser, {
              cancelToken: credsRequestCancelTokenRef.current.token,
            })
            .then(({ data }) => {
              // store certificate in app memory
              // TODO check if expiry isn't working or misconfigured
              // TODO handle expired certificates
              certificateRef.current = data.certificate;
            }),
        ]);
      } catch (err) {
        console.error(err);
      }
    };

    if (sessionUser) {
      getCreds();
    }

    return () => {
      if (credsRequestCancelTokenRef.current?.cancel) {
        credsRequestCancelTokenRef.current.cancel();
      }
    };
  }, [sessionUser]);

  const login = async (value: {
    username: string;
    passphrase: string;
    // rememberMe?: boolean;
  }) => {
    await logout();

    // FIXME .auth callback sometimes works, sometimes doesn't.
    // can't figure out why--maybe has to do with peers?
    // maybe https://github.com/amark/gun/issues/944?
    // Let .on('auth') callback do most of the work
    return new Promise((resolve, reject) => {
      gunRef
        .current!.user()
        .auth(value.username, value.passphrase, ({ err, sea }: any) => {
          if (err) {
            reject(new Error(err));
          } else {
            const user: GunUser = {
              username: value.username,
              pub: sea.pub,
            };

            resolve(user);
          }
        });
    });
  };

  const logout = () => {
    certificateRef.current = undefined;
    accessTokenRef.current = undefined;

    userRef.current?.leave();

    setIsAuthenticated(false);

    return axios.post('/api/auth/logout');
  };

  const triggerReauthentication = (username: string): Promise<void> => {
    reauthenticationPromiseRef.current = undefined;

    if (!username) {
      return Promise.reject(new Error('Username required'));
    }

    setNeedsReauthentication(username);

    return new Promise((resolve, reject) => {
      reauthenticationPromiseRef.current = {
        resolve: (arg) => {
          setNeedsReauthentication(undefined);

          reauthenticationPromiseRef.current = undefined;
          resolve(arg);
        },
        reject: (arg) => {
          reauthenticationPromiseRef.current = undefined;
          reject(arg);
        },
      };
    });
  };

  const handleSubmitPassphrase = ({ passphrase }: any) => {
    if (needsReauthentication) {
      userRef.current?.auth(
        needsReauthentication,
        passphrase,
        ({ err, sea }: any) => {
          if (err && reauthenticationPromiseRef.current?.reject) {
            reauthenticationPromiseRef.current.reject(
              new Error('Could not log inn')
            );
          } else {
            if (reauthenticationPromiseRef.current?.resolve) {
              reauthenticationPromiseRef.current.resolve({
                username: needsReauthentication,
                pub: sea.pub,
              });
            }
          }
        }
      );
    }
  };

  return (
    <GunContext.Provider
      value={{
        getGun: () => gunRef.current,
        getUser: () => userRef.current,
        getCertificate: () => certificateRef.current,
        setCertificate: (v) => {
          certificateRef.current = v;
        },
        getAccessToken: () => accessTokenRef.current,
        setAccessToken: (v) => {
          accessTokenRef.current = v;
        },
        isReady,
        isAuthenticated,
        needsReauthentication,
        logout,
        login,
        triggerReauthentication,
      }}
    >
      {children}

      {needsReauthentication && (
        <Layer
          onClickOutside={() => setNeedsReauthentication(undefined)}
          onEsc={() => setNeedsReauthentication(undefined)}
        >
          <Box pad="medium" gap="small">
            <Text>Re-enter your passphrase to continue</Text>

            <EnterPasswordForm onSubmit={handleSubmitPassphrase} />
          </Box>
        </Layer>
      )}
    </GunContext.Provider>
  );
};

export default function useGun() {
  return useContext(GunContext);
}
