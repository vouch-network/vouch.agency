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
  throw new Error('NEXT_PUBLIC_GUN_PEERS in env environment required');
}

const NEXT_PUBLIC_GUN_PEERS = process.env.NEXT_PUBLIC_GUN_PEERS.split(',');

interface Props {
  children: React.ReactNode;
}

interface ContextValue {
  getGun: () => IGunChainReference | undefined;
  isGunReady: boolean;
}

// TODO memo
const GunContext = createContext<ContextValue>({
  getGun: () => undefined,
  isGunReady: false,
});

export const GunProvider = ({ children }: Props) => {
  const { getTokenHeader } = useApiToken();
  const gunRef = useRef<IGunChainReference>();
  const accessTokenRef = useRef<string>();
  const accessTokenRequestRef = useRef<any>();
  const accessTokenRequestCancelTokenRef = useRef<CancelTokenSource>();
  const [isGunReady, setIsGetReady] = useState<boolean>(false);

  const getNewAccessToken = async () => {
    const apiTokenHeader = await getTokenHeader();

    if (!apiTokenHeader) {
      // TODO handle
      return;
    }

    accessTokenRequestCancelTokenRef.current = axios.CancelToken.source();

    // get new token
    try {
      const { data } = await axios.get(`/api/network/token`, {
        headers: apiTokenHeader,
        cancelToken: accessTokenRequestCancelTokenRef.current.token,
      });

      // store token in app memory
      accessTokenRef.current = data.accessToken;

      return accessTokenRef.current;
    } catch (err: any) {
      console.error(err);

      if (err.response?.status === 401) {
        // TODO handle global error
      }
    }
  };

  const getAccessToken = async () => {
    if (accessTokenRef.current) {
      return accessTokenRef.current;
    }

    if (accessTokenRequestRef.current) {
      return await accessTokenRequestRef.current;
    }

    accessTokenRequestRef.current = getNewAccessToken();

    return await accessTokenRequestRef.current;
  };

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
                accessToken: await getAccessToken(),
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

        setIsGetReady(true);
      }
    };

    initGun();

    return () => {
      if (accessTokenRequestCancelTokenRef.current?.cancel) {
        accessTokenRequestCancelTokenRef.current.cancel();
      }
    };
  }, []);

  return (
    <GunContext.Provider
      value={{
        getGun: () => gunRef.current,
        isGunReady,
      }}
    >
      {children}
    </GunContext.Provider>
  );
};

export default function useGun() {
  return useContext(GunContext);
}
