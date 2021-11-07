import { Box, Text } from 'grommet';

import NetworkLayout from 'components/NetworkLayout';
import Dashboard from 'components/we/Dashboard';

function We() {
  return (
    <Box width="xxlarge" gap="small">
      <Text as="h1" size="xxlarge" margin="none">
        Network
      </Text>
      <Dashboard />
    </Box>
  );
}

We.getLayout = function getLayout(page) {
  return <NetworkLayout>{page}</NetworkLayout>;
};

We.authRequired = true;

export default We;
