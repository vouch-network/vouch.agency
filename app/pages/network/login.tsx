import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Form,
  FormField,
  CheckBox,
  Text,
  TextInput,
  Heading,
  Spinner,
} from 'grommet';
import { Send } from 'grommet-icons';

import NetworkLayout from 'components/NetworkLayout';
import useAuth from 'components/useAuth';
import useGun from 'components/useGun';
import useSessionChannel from 'components/useSessionChannel';
import { GUN_PATH, GUN_PREFIX } from 'utils/constants';

type LoginFormProps = {
  isSubmitting: boolean;
  onSubmit: any;
};

function LoginForm({ isSubmitting, onSubmit }: LoginFormProps) {
  const [value, setValue] = useState({
    username: '',
    email: '',
    rememberMe: true,
  });

  return (
    <Form
      value={value}
      onChange={(nextValue) => setValue(nextValue)}
      onSubmit={onSubmit}
    >
      <Box gap="medium">
        <Box gap="xsmall">
          <FormField name="email" htmlFor="email-input" label="Email">
            <TextInput
              id="email-input"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </FormField>

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

          {/* <Box pad={{ horizontal: 'xsmall' }}>
            <CheckBox name="rememberMe" label="Keep me logged in" />
          </Box> */}
        </Box>

        <Box align="center">
          <Button
            type="submit"
            label="Send login link"
            disabled={isSubmitting}
            icon={isSubmitting ? <Spinner /> : <Send size="26px" />}
            primary
          />
        </Box>
      </Box>
    </Form>
  );
}

export default function Login() {
  const router = useRouter();
  const { isGetReady, getGun } = useGun();
  const { login, logout } = useAuth();
  const channel = useSessionChannel();

  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(
    (router.query?.loginError as string) || undefined
  );

  const redirectTo = '/network/we';

  const handleSubmit = async ({ value }: any) => {
    setError(undefined);
    setIsLoggingIn(true);

    try {
      // Check username
      const gunUserByUsername = await getGun()!
        .get(`${GUN_PREFIX.app}:${GUN_PATH.profiles}`)
        .get(`${GUN_PREFIX.username}:${value.username}`)
        // @ts-ignore
        .then();

      if (!gunUserByUsername) {
        throw new Error();
      }

      await logout();

      // NOTE .login will resolve once the user clicks the email link,
      // not when they finish the callback flow
      const user = await login(
        { email: value.email },
        { username: value.username }
      );

      const gunUserById = await getGun()!
        .get(`${GUN_PREFIX.id}:${user.id}`)
        // @ts-ignore
        .then();

      if (!gunUserById) {
        throw new Error();
      }

      // Add user to session storage, we need to wait to see if the
      // callback page verifies this user
      channel.addToStorage({
        user,
      });
    } catch (err) {
      setError(
        `Couldn't log you in. Check your username and email and try again.`
      );
    }

    setIsLoggingIn(false);
  };

  useEffect(() => {
    router.prefetch(redirectTo);
  }, []);

  return (
    <Box background="white" pad="large" gap="medium" width="26em">
      <Heading size="small" margin="none">
        Sign in to Network
      </Heading>
      {isGetReady && (
        <LoginForm onSubmit={handleSubmit} isSubmitting={isLoggingIn} />
      )}

      {error && (
        <Box background="light-2" pad="small" round="xsmall">
          <Text weight="bold" color="status-error">
            {error}
          </Text>
          <Text as="p" margin={{ bottom: 'none' }}>
            If the issue persists, contact sua.
          </Text>
        </Box>
      )}
    </Box>
  );
}

Login.getLayout = function getLayout(page: any) {
  return <NetworkLayout centerHorizontally>{page}</NetworkLayout>;
};
