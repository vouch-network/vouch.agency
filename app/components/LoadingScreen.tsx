import { Box, Layer, Spinner, Text } from 'grommet';

export default function LoadingScreen({ message }: { message?: string }) {
  return (
    <Layer plain>
      <Box gap="small" align="center">
        {message && <Text color="brand">{message}</Text>}
        <Spinner size="medium" />
      </Box>
    </Layer>
  );
}
