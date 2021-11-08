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
import { compare, generateUUID } from 'lib/crypto';
import type { SignupToken } from 'utils/auth';
import { GUN_PREFIX } from 'utils/constants';

type SignUpFormProps = {
  signupToken: string;
};

function SignUpForm({ signupToken }: SignUpFormProps) {
  const { value, onChange, sendSignupEmail, signUpError, isSubmitting } =
    useSignUp({ signupToken });

  const onSubmit = async () => {
    try {
      await sendSignupEmail();

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

type Props = {
  invitedByUsername: string;
  signupToken: string;
};

export default function SecretJoin({ invitedByUsername, signupToken }: Props) {
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
          <SignUpForm signupToken={signupToken} />
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
  if (!process.env.APP_TOKEN_SECRET) {
    throw new Error('APP_TOKEN_SECRET in env environment required');
  }

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

  // Generate token to verify sign up
  const jwt = require('jsonwebtoken');

  const tokenData: SignupToken = {
    uuid: generateUUID(),
    invitedByIdentifier: `${GUN_PREFIX.username}:${process.env.ADMIN_USERNAME}`,
  };

  const signupToken = jwt.sign(tokenData, process.env.APP_TOKEN_SECRET, {
    // Expire 30 minutes from now (magic link expires in 20 min)
    expiresIn: 60 * 30,
  });

  const props: Props = {
    invitedByUsername: process.env.ADMIN_USERNAME,
    signupToken,
  };

  return {
    props,
  };
}
