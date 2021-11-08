import axios from 'axios';
import React, { useState } from 'react';
import Link from 'next/link';
import { Box, Button, Form, FormField, Text, TextInput } from 'grommet';

import useUser from 'components/useUser';
import NetworkLayout from 'components/NetworkLayout';
import UserLayout from 'components/UserLayout';

function AccountInfoForm({ onSubmit, userSettings }) {
  const [value, setValue] = useState({
    contactEmail: userSettings.contactEmail || '',
    // username: username || '',
  });
  const [isSubmitting, setIsSubmitting] = useState();
  const [sucessMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (nextValue) => {
    if (sucessMessage) setSuccessMessage('');

    setValue(nextValue);
  };

  const handleSubmit = async () => {
    setErrorMessage();
    setIsSubmitting(true);

    try {
      await onSubmit(value);

      try {
        await axios.put('/api/network/emails/aliases', {
          destinationEmail: value.contactEmail,
          createOnNotFound: true,
        });

        setSuccessMessage('Updated forwarding email address.');
      } catch (err) {
        console.error(err);
        setErrorMessage('Could not update forwarding email');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Could not save changes');
    }

    setIsSubmitting();
  };

  return (
    <Form value={value} onChange={handleChange} onSubmit={handleSubmit}>
      <Box gap="medium">
        {sucessMessage && (
          <Box>
            <Text color="status-ok">{sucessMessage}</Text>
          </Box>
        )}
        {errorMessage && (
          <Box>
            <Text color="status-error">{errorMessage}</Text>
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
              value={`${userSettings.username}@${process.env.NEXT_PUBLIC_FORWARD_EMAIL_DOMAIN}`}
              readOnly
            />
          </FormField>
          <FormField
            name="contactEmail"
            htmlFor="contactEmail-input"
            label="Private contact email address"
            info={
              <Text size="small">
                This is the email address that your Vouch email address forwards
                to.{' '}
                <Link href="/network/how-to#email-forwarding">Learn more</Link>
              </Text>
            }
            disabled
          >
            <TextInput
              id="contactEmail-input"
              name="contactEmail"
              type="contactEmail"
            />
          </FormField>

          {/* TODO */}
          <Text size="small">Ability to update email coming soon</Text>
        </Box>

        {/* <Box align="center">
          <Button
            type="submit"
            label="Save changes"
            primary
            disabled={isSubmitting}
          />
        </Box> */}
      </Box>
    </Form>
  );
}

function UserAccount() {
  const { userSettings, saveUserSettings } = useUser();

  return (
    <Box>
      <Box pad={{ horizontal: 'medium' }} width="medium" gap="medium">
        <Text as="h3" margin="none">
          Account information
        </Text>
        {userSettings && (
          <AccountInfoForm
            userSettings={userSettings}
            onSubmit={saveUserSettings}
          />
        )}
      </Box>
    </Box>
  );
}

UserAccount.getLayout = function getLayout(page) {
  return (
    <NetworkLayout>
      <UserLayout>{page}</UserLayout>
    </NetworkLayout>
  );
};

UserAccount.authRequired = true;

export default UserAccount;
