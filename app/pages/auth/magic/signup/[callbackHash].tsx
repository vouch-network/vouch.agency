import axios from 'axios';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Button, Spinner, Form, Text, TextInput } from 'grommet';

import NetworkLayout from 'components/NetworkLayout';
import StatusMessage from 'components/StatusMessage';
import LoadingScreen from 'components/LoadingScreen';
import useAuth from 'components/useAuth';
import useGun from 'components/useGun';
import useSessionChannel from 'components/useSessionChannel';
import { path, app, id, email, expandDataKeys, GUN_PATH } from 'utils/gunDB';
import type { AuthUser, CallbackParams } from 'utils/auth';
import { decode } from 'utils/base64';
import { VouchType } from 'utils/vouches';

export default function AuthSignup() {
  const router = useRouter();
  const {
    isReady: isAuthReady,
    isLoggedIn,
    loginCallback,
    getUser,
  } = useAuth();
  const { getGun } = useGun();
  const [dbSaves, setDbSaves] = useState<{
    user: boolean;
    invite: boolean;
    vouch: boolean;
  }>({
    user: false,
    invite: false,
    vouch: false,
  });
  const finishedSavedToDb = !Object.values(dbSaves).some(
    (isSaved) => isSaved === false
  );

  const redirectTo = '/network/setup';

  const saveUser = async () => {
    const user = (await getUser())!;

    const gun = getGun()!;

    // Get invite
    const invitePath = gun.get(app(GUN_PATH.invites)).get(email(user.email));
    const inviteData = await invitePath
      // @ts-ignore
      .then();

    if (!inviteData) {
      console.debug('Invite not found for ', user);
    }

    const invite = expandDataKeys(inviteData);
    const idPath = id(user.id);

    // Add user
    const gunUser = gun.get(idPath).put({ username: '' }, () => {
      setDbSaves((v) => ({
        ...v,
        user: true,
      }));
    });

    // Accept invite
    invitePath.get(GUN_PATH.user).put(gunUser, () => {
      setDbSaves((v) => ({
        ...v,
        invite: true,
      }));
    });

    // Add vouch
    const vouch = gun
      .get(app(GUN_PATH.vouches))
      .get(invite.invitedBy)
      .put({
        [+invite.timestamp]: `${idPath}|${VouchType.Vouched}`,
      });

    gun.get(path(idPath, GUN_PATH.vouches)).put(vouch, () => {
      setDbSaves((v) => ({
        ...v,
        vouch: true,
      }));
    });
  };

  useEffect(() => {
    router.prefetch(redirectTo);
  }, []);

  useEffect(() => {
    if (isAuthReady) {
      loginCallback();
    }
  }, [isAuthReady]);

  useEffect(() => {
    if (isLoggedIn) {
      saveUser();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (finishedSavedToDb) {
      router.replace(redirectTo);
    }
  }, [finishedSavedToDb]);

  return <LoadingScreen />;
}

AuthSignup.getLayout = function getLayout(page: any) {
  return <NetworkLayout centerHorizontally>{page}</NetworkLayout>;
};

// TODO check access token
export async function getServerSideProps(context: any) {
  const { query } = context;

  if (!query.magic_credential) {
    return {
      notFound: true,
    };
  }

  return {
    notFound: true,
  };
}
