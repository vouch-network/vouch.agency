import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Text } from 'grommet';
import { withPageAuthRequired } from '@auth0/nextjs-auth0';

import NetworkLayout from 'components/NetworkLayout';
import LoggedInLayout from 'components/LoggedInLayout';
import UserLayout from 'components/UserLayout';

export default function Admin() {
  return <Box width="large">TODO</Box>;
}

export const getServerSideProps = withPageAuthRequired();

Admin.getLayout = function getLayout(page) {
  return (
    <NetworkLayout>
      <LoggedInLayout>
        <UserLayout>{page}</UserLayout>
      </LoggedInLayout>
    </NetworkLayout>
  );
};
