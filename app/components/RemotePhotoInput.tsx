import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Form,
  MaskedInput,
  Text,
  TextInput,
  Image,
  Layer,
} from 'grommet';

import type { PublicProfile } from 'utils/profiles';
import type { Media } from 'utils/media';
import Square from 'components/Square';
import StatusMessage from 'components/StatusMessage';

export default function RemotePhotoInput({
  userDisplayName,
  avatar,
  saveUserProfile,
}: {
  userDisplayName?: string;
  avatar?: string;
  saveUserProfile: (value: Partial<PublicProfile>) => Promise<any>;
}) {
  const [mediaName, mediaUrl] = (avatar || '').split('|');

  const [showForm, setShowForm] = useState<boolean>();
  const [value, setValue] = useState({
    url: '',
  });
  const [sucessMessage, setSuccessMessage] = useState<string>();

  useEffect(() => {
    if (!mediaUrl && showForm === undefined) {
      setShowForm(true);
    }
  }, [mediaUrl]);

  const handleSubmit = async ({ value }: { value: Media }) => {
    setSuccessMessage(undefined);

    try {
      await saveUserProfile({
        avatar: `${userDisplayName || 'Vouch Member'}|${value.url}`,
      });

      setSuccessMessage('Saved photo');
    } catch (err) {
      console.error(err);
      // TODO handle error
    }
  };

  return (
    <Box gap="xsmall" fill>
      {sucessMessage && (
        <StatusMessage status="ok" plain>
          {sucessMessage}
        </StatusMessage>
      )}

      <Square background="light-2">
        {mediaUrl && <Image src={mediaUrl} fit="contain" alt={mediaName} />}
      </Square>

      {!showForm && (
        <Box direction="row" gap="xsmall">
          <TextInput
            name="url"
            type="url"
            size="xsmall"
            value={mediaUrl}
            readOnly
          />

          <Button label="Edit" size="small" onClick={() => setShowForm(true)} />
        </Box>
      )}

      {showForm && (
        <Form value={value} onChange={setValue} onSubmit={handleSubmit}>
          <Box direction="row" gap="xsmall">
            <MaskedInput
              id="url-input"
              name="url"
              type="url"
              mask={[
                { fixed: 'https://' },
                {
                  placeholder: 'example.com/me.jpg',
                },
              ]}
              size="xsmall"
              required
            />

            <Button type="submit" label="Save" size="small" primary />
          </Box>
        </Form>
      )}
    </Box>
  );
}
