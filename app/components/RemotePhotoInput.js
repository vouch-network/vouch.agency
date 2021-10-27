import axios from 'axios';
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

import Square from 'components/Square';

export default function RemotePhotoInput({ media, saveUserProfile }) {
  const mediaUrl = media?.url;

  const [showForm, setShowForm] = useState();
  const [value, setValue] = useState({
    url: '',
  });
  const [sucessMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!mediaUrl && showForm === undefined) {
      setShowForm(true);
    }
  }, [mediaUrl]);

  const handleSubmit = async ({ value }) => {
    setSuccessMessage();

    console.log(value);

    try {
      await saveUserProfile({
        profilePhoto: value,
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
        <Box>
          <Text color="status-ok">{sucessMessage}</Text>
        </Box>
      )}

      <Square background="light-2">
        {mediaUrl && <Image src={mediaUrl} fit="contain" />}
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
