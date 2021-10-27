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

export default function RemotePhotoInput({ media, onSubmit }) {
  const mediaUrl = media?.url;

  const [showForm, setShowForm] = useState();
  const [value, setValue] = useState({
    url: '',
  });

  useEffect(() => {
    if (!mediaUrl && showForm === undefined) {
      setShowForm(true);
    }
  }, [mediaUrl]);

  return (
    <Box gap="xsmall" fill>
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
        <Form
          value={value}
          onChange={(nextValue) => setValue(nextValue)}
          onSubmit={onSubmit}
        >
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
