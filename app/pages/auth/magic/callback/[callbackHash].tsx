import axios from 'axios';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Button, Spinner, Form, Text, TextInput } from 'grommet';

import NetworkLayout from 'components/NetworkLayout';
import useAuth from 'components/useAuth';
import useGun from 'components/useGun';
import useSessionChannel from 'components/useSessionChannel';
import { GUN_KEY, GUN_PREFIX } from 'utils/constants';
import type { AuthUser, CallbackParams } from 'utils/auth';
import { decode } from 'utils/base64';
import { VouchType } from 'utils/vouches';

type Props = {
  username: string;
};

export default function AuthCallback({ username }: Props) {
  const router = useRouter();
  const channel = useSessionChannel();
  const { isReady: isAuthReady, loginCallback, getUser } = useAuth();
  const { isGetReady, isPutReady, getGun } = useGun();
  const [unverifiedUser, setUnverifiedUser] = useState<AuthUser>();

  // const redirectTo = '/network/we';
  const redirectTo = '/network/me';

  // Get user that attempted login from session storage
  channel.onMessage(({ value }: any) => {
    if (value?.user) {
      setUnverifiedUser(value.user);
    }
  });

  const finishLogin = async () => {
    if (!unverifiedUser) return;

    const storedUsername = await getGun()
      ?.get(`${GUN_PREFIX.id}:${unverifiedUser.id!}`)
      .get(GUN_KEY.username)
      // @ts-ignore
      .then();

    if (username === storedUsername) {
      await loginCallback();

      router.replace(redirectTo);
    } else {
      router.replace(`/network/login?loginError=${'Could not complete login'}`);
    }
  };

  const isAbleToLogIn = isAuthReady && isGetReady && unverifiedUser;

  console.log({ isAuthReady, isGetReady, unverifiedUser });

  useEffect(() => {
    if (isAbleToLogIn) {
      // complete login
      finishLogin();
    }
  }, [isAbleToLogIn]);

  useEffect(() => {
    router.prefetch(redirectTo);
  }, []);

  return (
    <Box margin={{ vertical: 'large' }} align="center" justify="center">
      <Spinner size="medium" />
    </Box>
  );
}

AuthCallback.getLayout = function getLayout(page: any) {
  return <NetworkLayout centerHorizontally>{page}</NetworkLayout>;
};

// Check hash for some additional information, e.g. to differentiate
// between sign ups and log ins
export async function getServerSideProps(context: any) {
  const { params } = context;

  const callbackParams = decode(params.callbackHash) as CallbackParams;

  if (!callbackParams.username) {
    return {
      notFound: true,
    };
  }

  const props: Props = {
    username: callbackParams.username,
  };

  return {
    props,
  };
}
