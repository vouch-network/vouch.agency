import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Button, Spinner, Form, Text, TextInput } from 'grommet';

import NetworkLayout from 'components/NetworkLayout';
import useAuth from 'components/useAuth';
import useGun from 'components/useGun';
import type { AuthUser, CallbackParams } from 'utils/auth';
import { decode } from 'utils/base64';

type Props = {
  username: string;
};

export default function AuthCallback({ username }: Props) {
  const router = useRouter();
  const { isReady: isAuthReady, loginCallback } = useAuth();

  // const redirectTo = '/network/we';
  const redirectTo = '/network/me';

  const finishLogin = async () => {
    try {
      const user = await loginCallback({ username });

      if (user) {
        router.replace(redirectTo);
      } else {
        router.replace(
          `/network/login?loginError=${'Could not complete login'}`
        );
      }
    } catch (err) {
      console.error(err);
      router.replace(`/network/login?loginError=${'Could not complete login'}`);
    }
  };

  useEffect(() => {
    if (isAuthReady) {
      // complete login
      finishLogin();
    }
  }, [isAuthReady]);

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
  const { params, query } = context;

  const callbackParams = decode(params.callbackHash) as CallbackParams;

  if (!callbackParams.username || !query.magic_credential) {
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
