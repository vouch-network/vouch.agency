import Link from 'next/link';
import { Box, Button, Text } from 'grommet';

import NetworkLayout from 'components/NetworkLayout';
import LoadingScreen from 'components/LoadingScreen';
import NetworkGraph from 'components/NetworkGraph';
import useUser from 'components/useUser';

export default function Network() {
  const { user } = useUser();

  return (
    <Box direction="row" align="center" gap="small" wrap>
      <NetworkGraph
        background="light-2"
        round="small"
        width="800px"
        height="600px"
        // only render graph in browser
        suppressHydrationWarning
      />

      <Box pad="large" gap="medium">
        <Box>
          <Text size="xlarge" weight="bold">
            Hello
          </Text>
        </Box>

        <Box align="center">
          <Button
            label="Go to Network"
            // href="/network/we"
            href="/network/me"
            primary
            size="large"
          />
        </Box>
      </Box>
    </Box>
  );
}

Network.getLayout = function getLayout(page) {
  return <NetworkLayout centerHorizontally>{page}</NetworkLayout>;
};

export async function getServerSideProps(context) {
  const user = context.req.session?.get('user') || null;

  return {
    props: { user }, // will be passed to the page component as props
  };
}
