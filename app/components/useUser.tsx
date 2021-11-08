import axios from 'axios';
import { useState, useEffect, useRef, createContext, useContext } from 'react';

import useGun from 'components/useGun';
import type { AuthUser } from 'utils/auth';
import type { PrivateProfile, PublicProfile } from 'utils/profiles';
import {
  preparePutValue,
  expandDataKeys,
  path,
  app,
  id,
  GUN_PATH,
  GUN_KEY,
} from 'utils/gunDB';

import useAuth from 'components/useAuth';

interface Props {
  children: React.ReactNode;
}

interface ContextValue {
  userSettings: PrivateProfile | undefined | null;
  userProfile: PublicProfile | undefined | null;
  saveUserSettings: (value: Partial<PrivateProfile>) => void;
  saveUserProfile: (value: Partial<PublicProfile>) => void;
  toggleProfileVisibility: (value: boolean) => void;
}

// TODO memo
const UserContext = createContext<ContextValue>({
  userSettings: undefined,
  userProfile: undefined,
  saveUserSettings: () => {},
  saveUserProfile: () => {},
  toggleProfileVisibility: () => {},
});

export const UserProvider = ({ children }: Props) => {
  const { isLoggedIn, getUser } = useAuth();
  const { isReady: isGunReady, getGun } = useGun();
  const [privProfile, setPrivProfile] = useState<PrivateProfile | null>();
  const [pubProfile, setPubProfile] = useState<PublicProfile | null>();

  const getPrivProfile = async () => {
    const user = await getUser();
    if (!user) return;

    const gun = getGun()!;

    const username = await gun
      .get(id(user.id))
      .get(GUN_KEY.username)
      // @ts-ignore
      .then();

    setPrivProfile({
      id: user.id,
      username: username,
      contactEmail: user.email,
    });
  };

  const getPubProfile = async () => {
    const user = await getUser();
    if (!user) return;

    const gun = getGun()!;

    const profile = await gun
      .get(`${id(user.id)}/${GUN_PATH.profile}`)
      // @ts-ignore
      .then();

    setPubProfile({
      displayName: '',
      location: '',
      pronouns: '',
      bio: '',
      avatar: '',
      ...expandDataKeys(profile),
    });
  };

  useEffect(() => {
    if (isLoggedIn && isGunReady) {
      getPrivProfile();
      getPubProfile();
    }
  }, [isLoggedIn && isGunReady]);

  const saveUserSettings = async (value: Partial<PrivateProfile>) => {
    console.log('TODO');
  };

  const saveUserProfile = async (value: Partial<PublicProfile>) => {
    const user = (await getUser())!;
    const gun = getGun()!;

    return new Promise((resolve, reject) => {
      gun
        .get(path(id(user.id), GUN_PATH.profile))
        .put(preparePutValue(value), ({ err }) => {
          if (err) {
            reject(err);
          } else {
            resolve(value);
          }
        });
    });
  };

  const toggleProfileVisibility = async (makeVisible: boolean) => {
    const user = (await getUser())!;
    const gun = getGun()!;

    const profile = gun.get(path(id(user.id), GUN_PATH.profile));
    const username = await profile
      .get(GUN_KEY.username)
      // @ts-ignore
      .then();
    console.log('usrname:', username);

    return new Promise((resolve, reject) => {
      gun
        .get(app(GUN_PATH.profile))
        .get(username(username))
        .put(profile, ({ err }) => {
          if (err) {
            reject(err);
          } else {
            resolve(expandDataKeys(profile));
          }
        });
    });
  };

  return (
    <UserContext.Provider
      value={{
        userSettings: privProfile,
        userProfile: pubProfile,
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
