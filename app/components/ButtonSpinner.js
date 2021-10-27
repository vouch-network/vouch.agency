import { Box, Text, Spinner } from 'grommet';

export default function ButtonSpinner() {
  return (
    <Box direction="row" gap="small" align="center">
      <Spinner
        border={[
          {
            side: 'all',
            color: 'white',
            size: 'small',
          },
          { side: 'right', color: 'neutral-2', size: 'small' },
          { side: 'top', color: 'neutral-2', size: 'small' },
          { side: 'left', color: 'neutral-2', size: 'small' },
        ]}
      />
      <Text>Uploading...</Text>
    </Box>
  );
}
