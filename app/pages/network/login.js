import axios from 'axios';
import { useState, useEffect } from 'react';
import Link from 'next/link';
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
} from 'grommet';

import NetworkLayout from 'components/NetworkLayout';
import useGun from 'components/useGun';

function LoginForm({ isSubmitting, onSubmit }) {
  const [value, setValue] = useState({
    username: '',
    passphrase: '',
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
          <FormField name="username" htmlFor="username-input" label="Username">
            <TextInput
              id="username-input"
              name="username"
              reverse
              icon={<Text>@vouch.agency</Text>}
              required
            />
          </FormField>
          <FormField
            name="passphrase"
            htmlFor="passphrase-input"
            label="Passphrase"
          >
            <TextInput
              id="passphrase-input"
              name="passphrase"
              type="password"
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
            label="Continue"
            primary
            disabled={isSubmitting}
          />
        </Box>
      </Box>
    </Form>
  );
}

export default function Login() {
  const router = useRouter();
  const { getUser, login, logout, isAuthenticated } = useGun();
  const [isLoggingIn, setIsLoggingIn] = useState();
  const [error, setError] = useState();

  const redirectTo = '/network/me';
  // const redirectTo = '/network/we'

  const handleSubmit = async ({ value }) => {
    setError();
    setIsLoggingIn(true);

    await logout();

    try {
      const user = await login(value);

      // start session on server
      await axios.post('/api/auth/login', user);

      router.push(redirectTo);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    router.prefetch(redirectTo);
  }, []);

  return (
    <Box background="white" pad="large" gap="medium" width="26em">
      <Heading size="small" margin="none">
        Sign in to Network
      </Heading>
      <LoginForm onSubmit={handleSubmit} isSubmitting={isLoggingIn} />

      {error && (
        <Box background="light-2" pad="small" round="xsmall">
          <Text weight="bold" color="status-error">
            {error}
          </Text>
          <Text as="p" margin={{ bottom: 'none' }}>
            Check your username and passphrase and try again. If the issue
            persists, contact sua.
          </Text>
        </Box>
      )}
    </Box>
  );
}

Login.getLayout = function getLayout(page) {
  return <NetworkLayout centerHorizontally>{page}</NetworkLayout>;
};
