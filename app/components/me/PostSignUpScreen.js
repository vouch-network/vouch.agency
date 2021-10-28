import axios from 'axios';
import React, { useState } from 'react';
import { Box, Button, Form, Text, TextInput } from 'grommet';

function EmailForm({ onSubmit }) {
  const [value, setValue] = useState({ contactEmail: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState();

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      await axios.post('/api/network/emails/aliases', {
        destinationEmail: value.contactEmail,
      });

      onSubmit({ value });
    } catch (err) {
      console.error(err);

      setErrorMessage('Something went wrong saving that email');
    }

    setIsSubmitting();
  };

  return (
    <Form
      value={value}
      onChange={(nextValue) => setValue(nextValue)}
      onSubmit={handleSubmit}
    >
      <Box gap="small">
        {errorMessage && (
          <Box background="light-1" pad="small" round="small">
            <Text color="status-error">{errorMessage}</Text>
            <Text>Contact sua if you keep getting an error</Text>
          </Box>
        )}

        <TextInput
          id="contactEmail-input"
          name="contactEmail"
          type="contactEmail"
          placeholder="ghostface@example.com"
          required
        />

        <Box align="center">
          <Button
            type="submit"
            label="Set email"
            primary
            disabled={isSubmitting}
          />
        </Box>
      </Box>
    </Form>
  );
}

function DisplayNameForm({ onSubmit }) {
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

export default function PostSignUpScreen({
  userProfile,
  userSettings,
  onSetPrivateEmail,
  onSetDisplayName,
}) {
  return (
    <Box gap="large">
      <Text size="large" weight="bold">
        A few more steps before you can access your profile:
      </Text>

      <Box direction="row">
        <Box width="2em">
          <Text color="accent-2" weight="bold">
            1.
          </Text>
        </Box>
        <Box width="30em" gap="small">
          <Text weight="bold">Set your private contact email address</Text>
          <Text size="medium">
            Your Vouch email address (
            <Text color="neutral-1">
              {userSettings.username}@
              {process.env.NEXT_PUBLIC_FORWARD_EMAIL_DOMAIN}
            </Text>
            ) will forward to this email address.
          </Text>
          <Text size="medium">
            This email <strong>will not</strong> be visible on your public
            profile and will only be visible to the sender once you reply to an
            email. You can change it later.
          </Text>
          {!userSettings.contactEmail && (
            <Box>
              <EmailForm onSubmit={({ value }) => onSetPrivateEmail(value)} />
            </Box>
          )}
          {userSettings.contactEmail && (
            <Box>
              <Text size="large" weight="bold">
                Hello,{' '}
                <Text color="accent-4" size="large">
                  {userSettings.contactEmail}
                </Text>
                .
              </Text>
            </Box>
          )}
        </Box>
      </Box>

      <Box direction="row">
        <Box width="2em">
          <Text color="accent-4" weight="bold">
            2.
          </Text>
        </Box>
        <Box width="30em" gap="small">
          <Text weight="bold">Set your professional name</Text>
          <Text size="medium">
            This is the name that will be shown on your public profile. You can
            change it later.
          </Text>
          {(!userProfile || !userProfile.displayName) && (
            <Box>
              <DisplayNameForm
                onSubmit={({ value }) => onSetDisplayName(value)}
              />
            </Box>
          )}
          {userProfile && userProfile.displayName && (
            <Box>
              <Text size="large" weight="bold">
                Hello,{' '}
                <Text color="accent-4" size="large">
                  {userProfile.displayName}
                </Text>
                .
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
