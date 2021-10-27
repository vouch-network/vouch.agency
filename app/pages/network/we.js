import { Box, Text } from 'grommet';

import { withGunAuthGate } from 'components/GunAuthGate';
import NetworkLayout from 'components/NetworkLayout';
import LoggedInLayout from 'components/LoggedInLayout';
import Dashboard from 'components/we/Dashboard';

export default function We() {
  return (
    <Box width="xxlarge" gap="small">
      <Text as="h1" size="xxlarge" margin="none">
        Network
      </Text>
      <Dashboard />
    </Box>
  );
}

export const getServerSideProps = withGunAuthGate();

We.getLayout = function getLayout(page) {
  return (
    <NetworkLayout>
      <LoggedInLayout>{page}</LoggedInLayout>
    </NetworkLayout>
  );
};
