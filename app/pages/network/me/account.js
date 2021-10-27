import React, { useState } from 'react';
import Link from 'next/link';
import { Box, Button, Form, FormField, Text, TextInput } from 'grommet';

import { withGunAuthGate } from 'components/GunAuthGate';
import useUser from 'components/useUser';
import NetworkLayout from 'components/NetworkLayout';
import LoggedInLayout from 'components/LoggedInLayout';
import UserLayout from 'components/UserLayout';

function AccountInfoForm({ onSubmit, userSettings }) {
  const [value, setValue] = useState({
    contactEmail: userSettings.contactEmail || '',
    // username: username || '',
  });
  const [sucessMessage, setSuccessMessage] = useState('');

  const handleSubmit = async () => {
    try {
      await onSubmit(value);

      setSuccessMessage('Saved account information');
    } catch (err) {
      // TODO show error
    }
  };

  return (
    <Form
      value={value}
      onChange={(nextValue) => setValue(nextValue)}
      onSubmit={handleSubmit}
    >
      <Box gap="medium">
        {sucessMessage && (
          <Box>
            <Text color="status-ok">{sucessMessage}</Text>
          </Box>
        )}

        <Box gap="xsmall">
          <FormField
            name="username"
            htmlFor="username-input"
            label="Vouch email address"
            disabled
          >
            <TextInput
              id="username-input"
              name="username"
              value={`${userSettings.username}@vouch.agency`}
              readOnly
            />
          </FormField>
          <FormField
            name="contactEmail"
            htmlFor="contactEmail-input"
            label="Private contact email address"
          >
            <TextInput
              id="contactEmail-input"
              name="contactEmail"
              type="contactEmail"
            />
          </FormField>

          <Text size="small">
            {/* TODO change password */}
            Password change coming soon
          </Text>
        </Box>

        <Box align="center">
          <Button type="submit" label="Save changes" primary />
        </Box>
      </Box>
    </Form>
  );
}

export default function UserAccount() {
  const { userSettings, saveUserSettings } = useUser();

  return (
    <Box>
      <Box pad={{ horizontal: 'medium' }} width="medium" gap="medium">
        <Text as="h3" margin="none">
          Account information
        </Text>
        <AccountInfoForm
          userSettings={userSettings}
          onSubmit={saveUserSettings}
        />
      </Box>
    </Box>
  );
}

export const getServerSideProps = withGunAuthGate();

UserAccount.getLayout = function getLayout(page) {
  return (
    <NetworkLayout>
      <LoggedInLayout>
        <UserLayout>{page}</UserLayout>
      </LoggedInLayout>
    </NetworkLayout>
  );
};
