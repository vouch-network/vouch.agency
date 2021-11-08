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
import { GUN_PREFIX, GUN_KEY, GUN_PATH } from 'utils/constants';
import type { AuthUser, CallbackParams, SignupToken } from 'utils/auth';
import { decode } from 'utils/base64';
import { VouchType } from 'utils/vouches';

type Props = {
  invitedByIdentifier: string;
};

export default function AuthSignup({ invitedByIdentifier }: Props) {
  const router = useRouter();
  const {
    isReady: isAuthReady,
    isLoggedIn,
    loginCallback,
    getUser,
  } = useAuth();
  const { isGunReady, getGun } = useGun();
  const [isVouchSaved, setIsVouchSaved] = useState<boolean>();

  const redirectTo = '/network/setup';

  const saveVouch = async () => {
    const user = (await getUser())!;

    const gun = getGun()!;

    // TODO move pending invite
    // const invite = await gun
    //   .get(`${GUN_PREFIX.app}:${GUN_PATH.vouchesPending}`)
    //   .get(invitedByIdentifier)
    //   .get(inviteCode)
    //   .then();

    const vouchPath = gun.get(
      `${GUN_PREFIX.id}:${user.id}/${GUN_PATH.vouches}`
    );

    let vouch = await vouchPath
      .get(invitedByIdentifier)
      // @ts-ignore
      .then();

    if (vouch) {
      setIsVouchSaved(true);
    } else {
      vouch = vouchPath.get(invitedByIdentifier).put({
        [Date.now()]: `${GUN_PREFIX.id}:${user.id}|${VouchType.Vouched}`,
      });

      gun
        .get(`${GUN_PREFIX.app}:${GUN_PATH.vouches}`)
        .get(invitedByIdentifier)
        .put(vouch, () => {
          setIsVouchSaved(true);
        });
    }
  };

  useEffect(() => {
    router.prefetch(redirectTo);
  }, []);

  useEffect(() => {
    if (isAuthReady && !isLoggedIn) {
      // successful login will set `isPutReady` to true,
      // handle in different effect hook
      loginCallback();
    }
  }, [isAuthReady, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      saveVouch();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isVouchSaved) {
      router.replace(redirectTo);
    }
  }, [isVouchSaved]);

  return <LoadingScreen />;
}

AuthSignup.getLayout = function getLayout(page: any) {
  return <NetworkLayout centerHorizontally>{page}</NetworkLayout>;
};

// Check hash for some additional information, e.g. to differentiate
// between sign ups and log ins
export async function getServerSideProps(context: any) {
  if (!process.env.APP_TOKEN_SECRET) {
    throw new Error('APP_TOKEN_SECRET in env environment required');
  }

  const { params } = context;

  const callbackParams = decode(params.callbackHash) as CallbackParams;

  if (callbackParams.isNewUser && callbackParams.signupToken) {
    // Check if token expired up front, we'll check it again on submit
    const jwt = require('jsonwebtoken');

    try {
      const decoded: SignupToken = jwt.verify(
        callbackParams.signupToken,
        process.env.APP_TOKEN_SECRET
      );

      if (!decoded.invitedByIdentifier) {
        return {
          notFound: true,
        };
      }

      const props: Props = {
        invitedByIdentifier: decoded.invitedByIdentifier,
      };

      return {
        props,
      };
    } catch {}
  }

  return {
    notFound: true,
  };
}
