import { Box, Paragraph, Clock, Layer } from 'grommet';

export default function LoadingScreen() {
  return (
    <Layer plain>
      <Box gap="small" align="center">
        <Paragraph size="large" color="neutral-3">
          <i>Where does the time go?</i>
        </Paragraph>
        <Box>
          <Clock type="digital" size="large" />
        </Box>
      </Box>
    </Layer>
  );
}
