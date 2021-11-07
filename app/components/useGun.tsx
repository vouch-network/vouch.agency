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

import useAuth from 'components/useAuth';
import { GUN_KEY } from 'utils/constants';

if (!process.env.NEXT_PUBLIC_GUN_PEERS) {
  throw new Error('NEXT_PUBLIC_GUN_PEERS in env environment required');
}

const NEXT_PUBLIC_GUN_PEERS = process.env.NEXT_PUBLIC_GUN_PEERS.split(',');

interface Props {
  children: React.ReactNode;
}

interface ContextValue {
  getGun: () => IGunChainReference | undefined;
  getAccessToken: () => string | undefined;
  setAccessToken: (token: string) => void;
  isGetReady: boolean;
  isPutReady: boolean;
}

// TODO memo
const GunContext = createContext<ContextValue>({
  getGun: () => undefined,
  getAccessToken: () => undefined,
  setAccessToken: () => {},
  isGetReady: false,
  isPutReady: false,
});

export const GunProvider = ({ children }: Props) => {
  const { isLoggedIn, logout, getAuthHeader } = useAuth();
  const gunRef = useRef<IGunChainReference>();
  const accessTokenRef = useRef<string>();
  const credsRequestCancelTokenRef = useRef<CancelTokenSource>();
  const [isGetReady, setIsGetReady] = useState<boolean>(false);
  const [isPutReady, setIsPutReady] = useState<boolean>(false);

  const getToken = async () => {
    if (!gunRef.current || !isLoggedIn) {
      return;
    }

    credsRequestCancelTokenRef.current = axios.CancelToken.source();

    // get new token
    try {
      const { data } = await axios.post(
        `/api/network/tokens`,
        {},
        {
          headers: await getAuthHeader(),
          cancelToken: credsRequestCancelTokenRef.current.token,
        }
      );

      // store token in app memory
      accessTokenRef.current = data.accessToken;
    } catch (err: any) {
      // TODO standardize unauthenticated requests
      if (err.response?.status === 401) {
        logout();
      }
    }
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
              getToken();

              console.error(msg.err);
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
  }, []);

  useEffect(() => {
    const initToken = async () => {
      await getToken();

      setIsPutReady(true);
    };

    if (isGetReady && isLoggedIn) {
      initToken();
    }

    return () => {
      if (credsRequestCancelTokenRef.current?.cancel) {
        credsRequestCancelTokenRef.current.cancel();
      }
    };
  }, [isGetReady, isLoggedIn]);

  return (
    <GunContext.Provider
      value={{
        getGun: () => gunRef.current,
        getAccessToken: () => accessTokenRef.current,
        setAccessToken: (v) => {
          accessTokenRef.current = v;
        },
        isGetReady,
        isPutReady,
      }}
    >
      {children}
    </GunContext.Provider>
  );
};

export default function useGun() {
  return useContext(GunContext);
}
