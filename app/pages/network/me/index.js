import axios from 'axios';
import React, { useState } from 'react';
import {
  Box,
  Button,
  Form,
  FormField,
  Text,
  TextInput,
  TextArea,
} from 'grommet';

import { withGunAuthGate } from 'components/GunAuthGate';
import useUser from 'components/useUser';
import NetworkLayout from 'components/NetworkLayout';
import LoggedInLayout from 'components/LoggedInLayout';
import UserLayout from 'components/UserLayout';
// import ProfilePhotoUpload from 'components/me/ProfilePhotoUpload';
import RemotePhotoInput from 'components/RemotePhotoInput';

function PublicProfileForm({ userProfile, saveUserProfile }) {
  const [value, setValue] = useState({
    displayName: userProfile.displayName || '',
    location: userProfile.location || '',
    pronouns: userProfile.pronouns || '',
    bio: userProfile.bio || '',
  });
  const [sucessMessage, setSuccessMessage] = useState('');

  const handleChange = (nextValue) => {
    if (sucessMessage) setSuccessMessage('');

    setValue(nextValue);
  };

  const handleSubmit = async ({ value }) => {
    setSuccessMessage();

    try {
      await saveUserProfile(value);

      setSuccessMessage('Saved profile');
    } catch (err) {
      console.error(err);
      // TODO handle error
    }
  };

  return (
    <Form value={value} onChange={handleChange} onSubmit={handleSubmit}>
      <Box gap="medium">
        {sucessMessage && (
          <Box>
            <Text color="status-ok">{sucessMessage}</Text>
          </Box>
        )}

        <Box width="medium" gap="xsmall">
          <FormField
            name="displayName"
            htmlFor="display-name-input"
            label="Your name"
            required
          >
            <TextInput
              id="display-name-input"
              name="displayName"
              placeholder="Ghostface"
            />
          </FormField>
          <FormField
            name="pronouns"
            htmlFor="pronouns-input"
            label="Your pronouns"
          >
            <TextInput
              id="pronouns-input"
              name="pronouns"
              placeholder="they/he/she/it"
            />
          </FormField>
          <FormField
            name="location"
            htmlFor="location-input"
            label="Location you're based out of"
          >
            <TextInput
              id="location-input"
              name="location"
              placeholder="Hong Kong"
            />
          </FormField>
          <FormField
            name="bio"
            htmlFor="bio-input"
            label="A short bio, what you do, etc"
            info={
              <Text size="small">{180 - value.bio.length} characters left</Text>
            }
          >
            <TextArea id="bio-input" name="bio" maxLength={180} />
          </FormField>
        </Box>
      </Box>

      <Box align="end" margin={{ bottom: 'small' }}>
        <Button type="submit" label="Save changes" primary />
      </Box>
    </Form>
  );
}

export default function Me() {
  const { userProfile, saveUserProfile } = useUser();

  return (
    <Box gap="medium">
      <Box direction="row" gap="medium" justify="between" wrap>
        <Box pad={{ horizontal: 'medium' }} gap="small">
          <Text>Your profile picture</Text>
          <Box width="20rem" align="center">
            <RemotePhotoInput
              media={userProfile.profilePhoto}
              saveUserProfile={saveUserProfile}
            />
          </Box>
        </Box>

        <Box pad={{ horizontal: 'medium' }}>
          <PublicProfileForm
            userProfile={userProfile}
            saveUserProfile={saveUserProfile}
          />
        </Box>
      </Box>
    </Box>
  );
}

export const getServerSideProps = withGunAuthGate();

Me.getLayout = function getLayout(page) {
  return (
    <NetworkLayout>
      <LoggedInLayout>
        <UserLayout>{page}</UserLayout>
      </LoggedInLayout>
    </NetworkLayout>
  );
};
