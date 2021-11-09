import axios from 'axios';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box,
  Button,
  Form,
  FormField,
  Text,
  TextInput,
  Heading,
  Spinner,
  Grid,
  Layer,
} from 'grommet';
import { Send } from 'grommet-icons';

import NetworkLayout from 'components/NetworkLayout';
import AboutJoiningModal from 'components/AboutJoiningModal';
import useSignUp from 'components/useSignUp';
import useGun from 'components/useGun';
import { compare } from 'lib/crypto';
import {
  app,
  path,
  username,
  email,
  preparePutValue,
  GUN_PATH,
} from 'utils/gunDB';

type Props = {
  invitedByUsername: string;
};

function SignUpForm({ invitedByUsername }: Props) {
  const { getGun } = useGun();
  const { value, onChange, sendSignupEmail, signUpError, isSubmitting } =
    useSignUp();

  const onSubmit = async () => {
    try {
      const data = await sendSignupEmail();

      console.debug({ user: data?.user });

      // Create invite
      // NOTE this only works if auth is disabled on the server
      if (data?.user) {
        const { data } = await axios.post('/api/encrypt', {
          email: value.email,
        });

        const gun = getGun()!;
        const invitedBy = username(invitedByUsername);
        const invitee = email(data.user.email);
        const timestamp = Date.now();

        const invite = gun
          .get(app(GUN_PATH.invites))
          .get(invitee)
          .put(
            preparePutValue({
              invitedBy: username(invitedByUsername),
              timestamp: timestamp,
            })
          );

        gun.get(path(invitedBy, GUN_PATH.invites)).put(invite);
      }

      // TODO wait for logged in broadcast and redirect
    } catch {}
  };

  return (
    <Form value={value} onChange={onChange} onSubmit={onSubmit}>
      <Box gap="medium">
        <Text as="p" margin="none">
          You'll get an email with a magic link to complete your sign up.
        </Text>

        <TextInput
          type="email"
          id="email-input"
          name="email"
          aria-label="Email address"
          placeholder="you@example.com"
          required
        />

        {signUpError && (
          <Box background="light-2" pad="small" round="xsmall">
            <Text weight="bold" color="status-error">
              {signUpError}
            </Text>
          </Box>
        )}

        <Box align="center">
          <Button
            type="submit"
            label="Send sign up link"
            disabled={Boolean(signUpError) || isSubmitting}
            icon={isSubmitting ? <Spinner /> : <Send size="26px" />}
            primary
          />
        </Box>
      </Box>
    </Form>
  );
}

export default function SecretJoin({ invitedByUsername }: Props) {
  const router = useRouter();
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(true);

  return (
    <>
      <Head>
        <meta name="robots" content="noindex" />
      </Head>

      {acceptedTerms && (
        <Box width="medium" gap="large">
          <Box gap="small">
            <Heading margin="none">Secret sign up</Heading>
            <Box align="end">
              <em>Vouched by:</em>{' '}
              <Text weight="bold" color="brand">
                {invitedByUsername}@
                {process.env.NEXT_PUBLIC_FORWARD_EMAIL_DOMAIN}
              </Text>
            </Box>
          </Box>
          <SignUpForm invitedByUsername={invitedByUsername} />
        </Box>
      )}

      {!acceptedTerms && (
        <AboutJoiningModal
          onAccept={() => setAcceptedTerms(true)}
          onReject={() => {
            router.push('/');
          }}
        />
      )}
    </>
  );
}

SecretJoin.getLayout = function getLayout(page: any) {
  return <NetworkLayout centerHorizontally>{page}</NetworkLayout>;
};

// Check hash in URL server-side
export async function getServerSideProps(context: any) {
  if (!process.env.ADMIN_JOIN_PATH || !process.env.ADMIN_USERNAME) {
    return {
      notFound: true,
    };
  }

  if (!compare(context.params.secret, process.env.ADMIN_JOIN_PATH!)) {
    return {
      notFound: true,
    };
  }

  const props: Props = {
    invitedByUsername: process.env.ADMIN_USERNAME,
  };

  return {
    props,
  };
}
