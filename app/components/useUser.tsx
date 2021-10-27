import { useState, useEffect, useRef, createContext, useContext } from 'react';
import type { IGunChainReference } from 'gun/types/chain';

import useGun from 'components/useGun';
import type { GunUser, PrivateProfile, PublicProfile } from 'utils/profiles';
import type { Vouch } from 'utils/vouches';
import { prepareFormValues } from 'utils/gunDB';
import { GUN_PATH, GUN_KEY, GUN_VALUE } from 'utils/constants';

const NEXT_PUBLIC_GUN_APP_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_GUN_APP_PUBLIC_KEY;

interface Props {
  children: React.ReactNode;
  // user from server session
  user?: GunUser;
}

interface ContextValue {
  error: Error | undefined | null;
  user: GunUser | undefined | null;
  userSettings: PrivateProfile | undefined | null;
  userProfile: PublicProfile | undefined | null;
  vouches: { [timestamp: number]: Vouch };
  saveUserSettings: (value: Partial<PrivateProfile>) => void;
  saveUserProfile: (value: Partial<PublicProfile>) => void;
  toggleProfileVisibility: (value: boolean) => void;
}

// TODO memo
const UserContext = createContext<ContextValue>({
  error: undefined,
  user: undefined,
  userSettings: undefined,
  userProfile: undefined,
  vouches: {},
  saveUserSettings: () => {},
  saveUserProfile: () => {},
  toggleProfileVisibility: () => {},
});

export const UserProvider = ({ children, user }: Props) => {
  const gunEventRef = useRef<{ [key: string]: any }>({});
  const {
    isReady,
    getGun,
    getUser,
    getCertificate,
    isAuthenticated,
    triggerReauthentication,
  } = useGun();
  const [privProfile, setPrivProfile] = useState<PrivateProfile | null>();
  const [pubProfile, setPubProfile] = useState<PublicProfile | null>();
  const [vouches, setVouches] = useState<any>({});
  const [error, setError] = useState<Error | null>();

  useEffect(() => {
    let userPath: IGunChainReference;

    setError(null);

    if (isReady && user) {
      // getUser() may not work in cases where we have a session
      // but the browser is not logged in with gun auth yet
      userPath = getGun()!.get(`~${user.pub}`);

      setPrivProfile({
        username: user.username,
      });

      // fill out private profile
      userPath.get(`${user.username}/${GUN_PATH.settings}`).on(
        (data) => {
          if (data) {
            // @ts-ignore
            setPrivProfile((p) => ({
              ...p,
              contactEmail: data[GUN_KEY.contactEmail] || '',
            }));
          }
        },
        {
          change: true,
        }
      );

      // fill out public profile
      userPath.get(`${user.username}/${GUN_PATH.profile}`).on(
        (data) => {
          if (data) {
            // @ts-ignore
            setPubProfile((p) => ({
              ...p,
              displayName: data[GUN_KEY.displayName] || '',
              pronouns: data[GUN_KEY.pronouns] || '',
              location: data[GUN_KEY.location] || '',
              bio: data[GUN_KEY.bio] || '',
              isListed: data[GUN_KEY.isListed] || '',
            }));
          }
        },
        {
          change: true,
        }
      );

      // get media
      userPath.get(GUN_KEY.profilePhoto).on(
        (data) => {
          if (data) {
            // @ts-ignore
            setPubProfile((p) => ({
              ...p,
              profilePhoto: data,
            }));
          }
        },
        {
          change: true,
        }
      );

      // get vouches
      userPath
        .get(GUN_PATH.vouches)
        .map()
        .get(user.username)
        .on(
          (data) => {
            setVouches((p: any) => ({
              ...p,
              [data[GUN_KEY.timestamp]]: {
                byUsername: data[GUN_KEY.byUsername],
                vouchType: data[GUN_KEY.vouchType],
              },
            }));
          },
          {
            change: true,
          }
        );
    }

    // TODO .off
    return () => {
      if (userPath?.off) userPath.off();
    };
  }, [isReady, user]);

  // we may need to reauthenticate if session was loaded from the server
  // TODO reauthenticate if token or cert expired
  const checkReAuthenticate = async () => {
    // @ts-ignore
    const gunUser = getUser()!.is;

    if (!gunUser) {
      try {
        await triggerReauthentication(user!.username);
      } catch (err) {
        // TODO show error to user
        console.error(err);
      }
    }
  };

  // value must be entire profile, or it will be overwritten
  const saveUserSettings = async (value: Partial<PrivateProfile>) => {
    await checkReAuthenticate();

    getUser()
      ?.get(`${user!.username}/${GUN_PATH.settings}`)
      .put(prepareFormValues(value), ({ err }) => {
        if (err) {
          console.error('saveUserSettings err:', err);
        } else {
          console.log('saveUserSettings saved');
        }
      });
  };

  const saveUserProfile = async (value: Partial<PublicProfile>) => {
    await checkReAuthenticate();

    // TODO save to app profiles
    getUser()
      ?.get(`${user!.username}/${GUN_PATH.profile}`)
      .put(prepareFormValues(value), ({ err }) => {
        if (err) {
          console.error('saveUserProfile user space err:', err);
        } else {
          console.log('saveUserProfile user space saved');
        }
      });
  };

  const toggleProfileVisibility = async (makeVisible: boolean) => {
    await checkReAuthenticate();

    getUser()!
      .get(`${user!.username}/${GUN_PATH.profile}`)
      .get(GUN_KEY.isListed)
      // @ts-ignore
      .put(makeVisible, console.log);

    // TODO profiles list
  };

  return (
    <UserContext.Provider
      value={{
        error,
        user: user,
        // @ts-ignore
        userSettings: privProfile,
        // @ts-ignore
        userProfile: pubProfile,
        vouches,
        saveUserSettings,
        saveUserProfile,
        toggleProfileVisibility,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default function useUser() {
  return useContext(UserContext);
}
