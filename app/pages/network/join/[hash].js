import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Anchor,
  Box,
  Button,
  Form,
  FormField,
  Text,
  TextInput,
  Heading,
} from 'grommet';

import NetworkLayout from 'components/NetworkLayout';
import AboutJoiningModal from 'components/AboutJoiningModal';
import useSignUp from 'components/useSignUp';

function SignUpForm({ invitedByUsername }) {
  const {
    value,
    setValue,
    handleSubmit,
    generatedPassphrase,
    downloadHref,
    signUpError,
    isSubmitting,
  } = useSignUp({ invitedByUsername });
  const [showPassphrase, setShowPassphrase] = useState(false);

  return (
    <Box gap="medium">
      <Form value={value} onChange={setValue} onSubmit={handleSubmit}>
        <Box gap="medium">
          <FormField
            name="invitedBy"
            htmlFor="invitedBy-input"
            label="Invited by"
            disabled
          >
            <TextInput
              id="invitedBy-input"
              name="invitedBy"
              reverse
              icon={
                <Text>@{process.env.NEXT_PUBLIC_FORWARD_EMAIL_DOMAIN}</Text>
              }
              placeholder="member"
              required
            />
          </FormField>

          <Text as="p" margin="none">
            Let's set up your username and passphrase.
          </Text>
          <Text as="p" margin="none">
            Choose a unique username. This will become your public Vouch Agency
            email address and it cannot be changed later.
          </Text>
          <FormField name="username" htmlFor="username-input" label="Username">
            <TextInput
              id="username-input"
              name="username"
              reverse
              icon={
                <Text>@{process.env.NEXT_PUBLIC_FORWARD_EMAIL_DOMAIN}</Text>
              }
              placeholder="you"
              required
            />
          </FormField>
          <Box gap="xsmall">
            <Text as="p" margin="none">
              Your passphrase is:
            </Text>
            <TextInput
              id="passphrase-input"
              name="passphrase"
              value={generatedPassphrase}
              size="small"
              type={showPassphrase ? 'text' : 'password'}
              reverse
              readOnly
            />
            <Anchor
              size="small"
              onClick={() => setShowPassphrase(!showPassphrase)}
            >
              {showPassphrase ? 'hide passphrase' : 'view passphrase'}
            </Anchor>
          </Box>

          {signUpError && (
            <Box background="light-2" pad="small" round="xsmall">
              <Text weight="bold" color="status-error">
                {signUpError}
              </Text>
            </Box>
          )}

          <Text as="p" margin="none">
            <strong>Your passphrase cannot be recovered if lost.</strong> Save
            it to a password manager like 1Password or Lastpass or{' '}
            <Anchor
              href={downloadHref}
              download="KEEP_SECRET_Vouch-Agency-Passphrase.txt"
            >
              download passphrase file to device
            </Anchor>
            .
          </Text>

          <Box align="center">
            <Button
              type="submit"
              label="Sign up"
              disabled={!signUpError && isSubmitting}
              primary
            />
          </Box>
        </Box>
      </Form>
    </Box>
  );
}

export default function SecretJoin() {
  const router = useRouter();
  const [acceptedTerms, setAcceptedTerms] = useState();

  return (
    <>
      {acceptedTerms && (
        <Box width="28rem" gap="medium">
          <Heading margin="none">Welcome</Heading>
          <SignUpForm invitedByUsername={router.query.invitedBy} />
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

SecretJoin.getLayout = function getLayout(page) {
  return <NetworkLayout centerHorizontally>{page}</NetworkLayout>;
};

export async function getServerSideProps(context) {
  const crypto = require('crypto');

  const queryBuf = Buffer.from(context.query.hash, 'utf8');
  // TODO Generate for one-time use instead of storing in env variables
  const secretBuf = Buffer.from(process.env.ADMIN_JOIN_SECRET, 'utf8');

  if (
    queryBuf.length !== secretBuf.length ||
    !crypto.timingSafeEqual(queryBuf, secretBuf)
  ) {
    return {
      notFound: true,
    };
  }

  return {
    props: {},
  };
}
