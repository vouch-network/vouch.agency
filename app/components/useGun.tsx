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
import type { IGunChainReference } from 'gun/types/chain';
import Gun from 'gun/gun';

import useApiToken from 'components/useApiToken';

if (!process.env.NEXT_PUBLIC_GUN_PEERS) {
  throw new Error('NEXT_PUBLIC_GUN_PEERS in env variables required');
}

const NEXT_PUBLIC_GUN_PEERS = process.env.NEXT_PUBLIC_GUN_PEERS.split(',');

interface Props {
  children: React.ReactNode;
}

interface ContextValue {
  getGun: () => IGunChainReference | undefined;
  isReady: boolean;
  isPutReady: boolean;
}

const GunContext = createContext<ContextValue>({
  getGun: () => undefined,
  isReady: false,
  isPutReady: false,
});

// state:
// [empty] -> ready
//  ready -> gotAccessToken
//  ready -> getAccessTokenFailed
//  getAccessTokenFailed -> gotAccessToken
//   gotAccessToken -> ready
const STATE = {
  empty: '[empty]',
  ready: 'ready',
  gotAccessToken: 'gotAccessToken',
  getAccessTokenFailed: 'getAccessTokenFailed',
} as const;
type State = typeof STATE[keyof typeof STATE];

export const GunProvider = ({ children }: Props) => {
  const { apiToken, getTokenHeader } = useApiToken();
  const gunRef = useRef<IGunChainReference>();
  const accessTokenRef = useRef<string>();
  const accessTokenRequestCancelTokenRef = useRef<CancelTokenSource>();
  const [gunState, setGunState] = useState<State>(STATE.empty);
  const isReady = gunState === STATE.ready;
  const isAuthenticated = gunState === STATE.gotAccessToken;

  useEffect(() => {
    const initGun = async () => {
      await Promise.all([
        import('gun/lib/radix'),
        import('gun/lib/radisk'),
        import('gun/lib/rindexed'),
        import('gun/lib/store'),
        import('gun/lib/then'),
        // import('gun/sea'),
      ]);

      if (!gunRef.current) {
        // @ts-ignore
        Gun.on('opt', (ctx) => {
          if (ctx.once) return;

          ctx.on('out', async function (msg: any) {
            // @ts-ignore
            const to = this.to;
            // Adds headers for put
            if (msg.put) {
              msg.headers = {
                accessToken: accessTokenRef.current,
              };
            }

            to.next(msg); // pass to next middleware

            const err = msg.err;

            if (err) {
              console.error(err);

              if (err === 'Access token expired') {
                // Retry
                msg.headers = {
                  accessToken: await getNewAccessToken(),
                };
                to.next(msg);
              } else {
                // TODO handle
              }
            }
          });
        });

        gunRef.current = Gun({
          peers: NEXT_PUBLIC_GUN_PEERS,
          // use indexdb instead by including radisk dependencies
          localStorage: false,
          // importing rindexeddb exposes it to window
          store: (window as any).RindexedDB({}),
        });

        setGunState(STATE.ready);
      }
    };

    initGun();
  }, []);

  const getNewAccessToken = async () => {
    const apiTokenHeader = getTokenHeader();

    accessTokenRequestCancelTokenRef.current = axios.CancelToken.source();

    // Get new access token
    // Note, this doesn't necessarily mean that the user is authenticated yet.
    // We may get a token before the user finishes log in with `loginCallback`.
    try {
      const { data } = await axios.get(`/api/network/token`, {
        headers: apiTokenHeader,
        cancelToken: accessTokenRequestCancelTokenRef.current.token,
      });

      // store token in app memory
      accessTokenRef.current = data.accessToken;

      setGunState(STATE.gotAccessToken);

      return accessTokenRef.current;
    } catch (err: any) {
      console.error(err);

      setGunState(STATE.getAccessTokenFailed);

      if (err.response?.status === 401) {
        // TODO handle global error
      }
    }
  };

  useEffect(() => {
    if (apiToken) {
      getNewAccessToken();
    } else {
      accessTokenRef.current = undefined;

      setGunState(STATE.ready);
    }

    return () => {
      if (accessTokenRequestCancelTokenRef.current?.cancel) {
        accessTokenRequestCancelTokenRef.current.cancel();
      }
    };
  }, [apiToken]);

  return (
    <GunContext.Provider
      value={{
        getGun: () => gunRef.current,
        isReady,
        isPutReady: isAuthenticated,
      }}
    >
      {children}
    </GunContext.Provider>
  );
};

export default function useGun() {
  return useContext(GunContext);
}
