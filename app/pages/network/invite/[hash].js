import axios from 'axios';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import niceware from 'niceware';
import {
  Anchor,
  Box,
  Button,
  Form,
  FormField,
  Text,
  TextInput,
  MaskedInput,
  Heading,
  Paragraph,
} from 'grommet';

import NetworkLayout from 'components/NetworkLayout';
import AboutJoiningModal from 'components/AboutJoiningModal';
import useSignUp from 'components/useSignUp';

function ValidateInviteForm({ isSubmitting, onSubmit }) {
  const [value, setValue] = useState({
    inviterUsername: '',
    passcode: '',
  });

  return (
    <Form
      value={value}
      onChange={(nextValue) => setValue(nextValue)}
      onSubmit={onSubmit}
    >
      <Box gap="small">
        <FormField
          name="inviterUsername"
          htmlFor="inviterUsername-input"
          label="Invited by"
        >
          <TextInput
            id="inviterUsername-input"
            name="inviterUsername"
            reverse
            icon={<Text>@vouch.agency</Text>}
            required
          />
        </FormField>
        <FormField name="passcode" htmlFor="passcode-input" label="Passcode">
          <MaskedInput
            id="passcode-input"
            name="passcode"
            type="passcode"
            size="xlarge"
            mask={[
              {
                length: 3,
                regexp: /^[0-9]{1,3}$/,
                placeholder: '000',
              },
              { fixed: '-' },
              {
                length: 3,
                regexp: /^[0-9]{1,3}$/,
                placeholder: '000',
              },
            ]}
            required
          />
        </FormField>

        <Box align="center">
          <Button
            type="submit"
            label="Check invitation"
            primary
            disabled={isSubmitting}
          />
        </Box>
      </Box>
    </Form>
  );
}

// TODO clean up with states like outer component
function SignUpForm({ invitedByUsername }) {
  const {
    value,
    setValue,
    handleSubmit,
    checkUsername,
    generatedPassphrase,
    downloadHref,
    signUpError,
    isSubmitting,
  } = useSignUp({ invitedByUsername });
  const [hasUsername, setHasUsername] = useState();
  const [hasPassphrase, setHasPassphrase] = useState();
  const [showPassphrase, setShowPassphrase] = useState(false);

  const handleSubmitUsername = () => {
    checkUsername(() => {
      setHasUsername(true);
    });
  };

  const signUp = () => {
    handleSubmit(value);
  };

  if (!hasUsername) {
    return (
      <Form
        value={value}
        onChange={(nextValue) =>
          setValue({
            ...value,
            ...nextValue,
          })
        }
        onSubmit={handleSubmitUsername}
      >
        <Box gap="medium">
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
              icon={<Text>@vouch.agency</Text>}
              placeholder="you"
              required
            />
          </FormField>

          {signUpError && (
            <Box background="light-2" pad="small" round="xsmall">
              <Text weight="bold" color="status-error">
                {signUpError}
              </Text>
            </Box>
          )}

          <Box align="center">
            <Button type="submit" label="Continue" primary />
          </Box>
        </Box>
      </Form>
    );
  }

  if (!hasPassphrase) {
    return (
      <Box gap="medium">
        <Text as="p" margin="none">
          Your Vouch email will be{' '}
          <Text color="accent-2">{value.username}@vouch.agency</Text>.{' '}
          <Anchor size="small" onClick={() => setHasUsername(false)}>
            (edit)
          </Anchor>
        </Text>
        <Text as="p" margin="none">
          A passphrase has been generated for you. <br />
          Treat it exactly like a password; it is your password.
        </Text>
        <Text as="p" margin="none">
          Because there are no app administrators,{' '}
          <strong>your passphrase cannot be recovered if lost.</strong>
        </Text>
        <Text as="p" margin="none">
          Save the passphrase to a password manager like 1Password or LastPass
          or download it as a text file and save it on your device to prevent
          lock out.
        </Text>

        <FormField
          name="passphrase"
          htmlFor="passphrase-input"
          label="Passphrase"
          readOnly
        >
          <TextInput
            id="passphrase-input"
            name="passphrase"
            value={generatedPassphrase}
            size="small"
            readOnly
          />
        </FormField>

        <Box align="center">
          <Anchor
            href={downloadHref}
            download="KEEP_SECRET_Vouch-Agency-Passphrase.txt"
          >
            Save passphrase to device
          </Anchor>
        </Box>

        <Box align="center">
          <Button
            label="Continue"
            primary
            onClick={() => setHasPassphrase(true)}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box gap="medium">
      <Text as="p" margin="none">
        Your Vouch email will be{' '}
        <Text color="accent-2">{value.username}@vouch.agency</Text>.{' '}
        <Anchor size="small" onClick={() => setHasUsername(false)}>
          (edit)
        </Anchor>
      </Text>
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
        <Anchor size="small" onClick={() => setShowPassphrase(!showPassphrase)}>
          {showPassphrase ? 'hide passphrase' : 'view passphrase'}
        </Anchor>
      </Box>
      <Text as="p" margin="none">
        This is your last chance to view or save your passphrase.{' '}
        <Anchor
          href={downloadHref}
          download="KEEP_SECRET_Vouch-Agency-Passphrase.txt"
        >
          Save passphrase file to device
        </Anchor>
        .
      </Text>

      {signUpError && (
        <Box background="light-2" pad="small" round="xsmall">
          <Text weight="bold" color="status-error">
            {signUpError}
          </Text>
          <Text as="p" margin={{ bottom: 'none' }}>
            Try again. If the issue persists, contact sua.
          </Text>
        </Box>
      )}

      <Box align="center">
        <Button
          label="Finish signing up"
          primary
          onClick={signUp}
          disabled={isSubmitting}
        />
      </Box>
    </Box>
  );
}

// states:
//  [empty] -> isValidating
//  isValidating -> isInvalid -> isValidating
//  isValidating -> isValid
//   isValid -> rejectedTerms
//   isValid -> acceptedTerms
//    acceptedTerms -> isSignedUp
const STATE = {
  empty: '[empty]',
  isValidating: 'isValidating',
  isInvalid: 'isInvalid',
  isValid: 'isValid',
  rejectedTerms: 'rejectedTerms',
  acceptedTerms: 'acceptedTerms',
  isSignedUp: 'isSignedUp',
};

export default function Join() {
  const router = useRouter();
  const [joinState, setJoinState] = useState(STATE.empty);
  const [invitedByUsername, setInvitedByUsername] = useState();

  const { t, hash } = router.query;

  if (t && hash) {
    const expiresAt = Number(t);

    const validateInvite = async ({ value }) => {
      setJoinState(STATE.isValidating);

      const { data } = await axios.post(
        `/api/private/invites/validate/${router.query.hash}`,
        {
          username: value.inviterUsername.replace('@vouch.agency', ''),
          passcode: value.passcode.replace(/\-/g, ''),
          expiresAt,
        }
      );

      if (data.isValid) {
        setJoinState(STATE.isValid);

        setInvitedByUsername(value.inviterUsername);
      } else {
        setJoinState(STATE.isInvalid);
      }
    };

    if (Date.now() > expiresAt) {
      return <Text size="large">Invitation expired.</Text>;
    }

    if (joinState !== STATE.acceptedTerms) {
      return (
        <Box width="medium" gap="medium">
          <Paragraph size="large" margin="none">
            Enter the username and passcode in your invitation message.
          </Paragraph>
          <ValidateInviteForm
            isSubmitting={joinState === STATE.isValidating}
            onSubmit={validateInvite}
          />
          {joinState === STATE.isInvalid && (
            <Box background="light-2" pad="small" round="xsmall">
              <Text weight="bold" color="status-error">
                This invitation is not valid.
              </Text>
              <Text as="p" margin={{ bottom: 'none' }}>
                Check the username (it should end with @vouch.agency) and
                6-number passcode in your invite and try again.
              </Text>
            </Box>
          )}
          {joinState === STATE.isValid && (
            <AboutJoiningModal
              onAccept={() => setJoinState(STATE.acceptedTerms)}
              onReject={() => setJoinState(STATE.rejectedTerms)}
            />
          )}
        </Box>
      );
    }

    return (
      <Box width="28rem" gap="medium">
        <Heading margin="none">Welcome</Heading>
        <SignUpForm invitedByUsername={invitedByUsername} />
      </Box>
    );
  }

  return null;
}

Join.getLayout = function getLayout(page) {
  return <NetworkLayout centerHorizontally>{page}</NetworkLayout>;
};
