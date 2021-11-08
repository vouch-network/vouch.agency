import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Box,
  Button,
  Form,
  FormField,
  Text,
  TextInput,
  Spinner,
} from 'grommet';
import { Checkmark } from 'grommet-icons';
import { format } from 'fecha';
import { orderBy } from 'lodash';

import useAuth from 'components/useAuth';
import useSignUp from 'components/useSignUp';
import useGun from 'components/useGun';
import NetworkLayout from 'components/NetworkLayout';
import { expandDataKeys } from 'utils/gunDB';
import { VouchType, Vouch } from 'utils/vouches';
import { GUN_PATH, GUN_KEY, GUN_PREFIX } from 'utils/constants';
import { ImportsNotUsedAsValues } from 'typescript';
import router from 'next/router';

function UsernameForm({ onSuccess }: any) {
  const {
    value,
    onChange,
    onUsernameBlur,
    handleSubmit,
    usernameError,
    signUpError,
    isCheckingUsername,
    isSubmitting,
  } = useSignUp();

  const onSubmit = async () => {
    try {
      await handleSubmit();

      onSuccess(value);
    } catch {}
  };

  return (
    <Form value={value} onChange={onChange} onSubmit={onSubmit}>
      <Box gap="small">
        <FormField
          name="username"
          htmlFor="username-input"
          label="Your username"
          error={usernameError}
        >
          <TextInput
            id="username-input"
            name="username"
            reverse
            icon={
              <Box direction="row" align="center" gap="xsmall">
                <Box>{isCheckingUsername && <Spinner />}</Box>

                <Text color="brand">
                  @{process.env.NEXT_PUBLIC_FORWARD_EMAIL_DOMAIN}
                </Text>
              </Box>
            }
            placeholder="you"
            onBlur={onUsernameBlur}
            required
          />
        </FormField>

        <Box align="center">
          <Button
            type="submit"
            label="Save username"
            disabled={Boolean(usernameError || signUpError) || isSubmitting}
            icon={isSubmitting ? <Spinner /> : undefined}
            primary
          />
        </Box>
      </Box>
    </Form>
  );
}

function DisplayNameForm({ onSubmit }: any) {
  const [value, setValue] = useState({ displayName: '' });

  return (
    <Form
      value={value}
      onChange={(nextValue) => setValue(nextValue)}
      onSubmit={onSubmit}
    >
      <Box gap="small">
        <TextInput
          id="displayName-input"
          name="displayName"
          placeholder="Ghostface"
          required
        />

        <Box align="center">
          <Button type="submit" label="Set name" primary />
        </Box>
      </Box>
    </Form>
  );
}

// state:
// [empty] -> needUser
// needUser -> savedUser
// needUser -> saveUserFailed
// saveUserFailed -> savedUser
//  savedUser -> savedProfile
//  savedUser -> saveProfileFailed
//  saveProfileFailed -> savedProfile
const STATE = {
  empty: '[empty]',
  needUser: 'needUser',
  savedUser: 'savedUser',
  saveUserFailed: 'saveUserFailed',
  savedProfile: 'savedProfile',
  saveProfileFailed: 'saveProfileFailed',
} as const;

type State = typeof STATE[keyof typeof STATE];

function Setup() {
  const { isReady: isAuthReady, getUser } = useAuth();
  const { isGunReady, isPutReady, getGun } = useGun();
  const [signUpState, setSignUpState] = useState<State>(STATE.empty);

  const isFinishedFlow = signUpState === STATE.savedProfile;

  const handleUsernameSuccess = async ({ username }: { username: string }) => {
    const user = (await getUser())!;
    const gun = getGun()!;

    gun
      .get(`${GUN_PREFIX.id}:${user.id}`)
      .get(GUN_KEY.username)
      // @ts-ignore
      .put(username, ({ err }) => {
        if (err) {
          // TODO show error
          setSignUpState(STATE.saveUserFailed);
        } else {
          setSignUpState(STATE.savedUser);
        }
      });
  };

  const handleDisplayName = async (value: string) => {
    const user = (await getUser())!;
    const gun = getGun()!;

    gun
      .get(`${GUN_PREFIX.id}:${user.id}/${GUN_PATH.profile}`)
      .get(GUN_KEY.displayName)
      // @ts-ignore
      .put(value, ({ err }) => {
        if (err) {
          // TODO show error
          setSignUpState(STATE.saveProfileFailed);
        } else {
          setSignUpState(STATE.savedProfile);
        }
      });
  };

  const init = async () => {
    const user = (await getUser())!;
    const gun = getGun()!;

    // Check if user is already in DB
    const gunUser = await gun
      .get(`${GUN_PREFIX.id}:${user.id}`)
      // @ts-ignore
      .then();

    if (gunUser) {
      // Check if profile is already in DB
      const gunProfile = await gun
        .get(`${GUN_PREFIX.id}:${user.id}/${GUN_PATH.profile}`)
        // @ts-ignore
        .then();

      if (gunProfile) {
        setSignUpState(STATE.savedProfile);
      } else {
        setSignUpState(STATE.savedUser);
      }
    } else {
      setSignUpState(STATE.needUser);
    }
  };

  useEffect(() => {
    if (isGunReady) {
      init();
    }
  }, [isGunReady]);

  useEffect(() => {
    if (isFinishedFlow) {
      router.replace('/network/me');
    }
  }, [isFinishedFlow]);

  return (
    <Box gap="medium" margin={{ top: 'xlarge' }}>
      <Text size="large" weight="bold">
        Two more steps before you can access your profile
      </Text>

      {signUpState !== STATE.empty && !isFinishedFlow && (
        <Box gap="medium">
          <Box direction="row">
            <Box width="2em">
              <Text color="accent-2" weight="bold">
                1.
              </Text>
            </Box>
            {(signUpState === STATE.needUser ||
              signUpState === STATE.saveUserFailed) && (
              <Box width="30em" gap="small">
                <Text weight="bold">Choose your username</Text>
                <Text size="medium">
                  This will become your public Vouch Agency email address (e.g.{' '}
                  <em>you@{process.env.NEXT_PUBLIC_FORWARD_EMAIL_DOMAIN}</em>)
                  and URL (e.g. <em>vouch.agency/you</em>.)
                </Text>
                <Text size="medium">
                  Emails sent to your Vouch Agency email address will be
                  automatically forwarded to your main, private email address.
                </Text>
                <Text size="medium">
                  Your main email address will remain hidden until you reply to
                  their email.
                </Text>
                <Box>
                  <UsernameForm onSuccess={handleUsernameSuccess} />
                </Box>
              </Box>
            )}
            {signUpState === STATE.savedUser && (
              <Box>
                <Text color="accent-2" weight="bold">
                  Saved username
                </Text>
              </Box>
            )}
          </Box>

          {signUpState === STATE.savedUser && (
            <Box direction="row">
              <Box width="2em">
                <Text color="accent-4" weight="bold">
                  2.
                </Text>
              </Box>
              <Box width="30em" gap="small">
                <Text weight="bold">Set your professional name</Text>
                <Text size="medium">
                  This is the name that will be shown on your public profile.
                  You can change it later.
                </Text>
                <Box>
                  <DisplayNameForm
                    onSubmit={({ value }: any) =>
                      handleDisplayName(value.displayName)
                    }
                  />
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      )}

      {(signUpState === STATE.empty || isFinishedFlow) && (
        <Box align="center">
          <Spinner size="medium" />
        </Box>
      )}
    </Box>
  );
}

Setup.getLayout = function getLayout(page: any) {
  return <NetworkLayout>{page}</NetworkLayout>;
};

Setup.authRequired = true;

export default Setup;
