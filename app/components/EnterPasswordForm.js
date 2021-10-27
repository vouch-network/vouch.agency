import { useState } from 'react';
import {
  Box,
  Button,
  Form,
  FormField,
  CheckBox,
  Text,
  TextInput,
} from 'grommet';

export default function EnterPasswordForm({ onSubmit }) {
  const [value, setValue] = useState({
    passphrase: '',
  });

  return (
    <Form
      value={value}
      onChange={(nextValue) => setValue(nextValue)}
      onSubmit={() => onSubmit(value)}
    >
      <Box gap="medium">
        <TextInput id="passphrase-input" name="passphrase" type="password" />

        <Box align="center">
          <Button type="submit" label="Continue" primary />
        </Box>
      </Box>
    </Form>
  );
}
