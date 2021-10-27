import React, { useState } from 'react';
import Link from 'next/link';
import { Box, Button, Form, FormField, Text, TextInput } from 'grommet';
import { format } from 'fecha';

import { withGunAuthGate } from 'components/GunAuthGate';
import useUser from 'components/useUser';
import NetworkLayout from 'components/NetworkLayout';
import LoggedInLayout from 'components/LoggedInLayout';
import UserLayout from 'components/UserLayout';
import { VouchType } from 'utils/vouches';

export default function UserVouches() {
  const { vouches } = useUser();

  // TODO vouch for

  return (
    <Box>
      <Box pad={{ horizontal: 'medium' }} width="medium" gap="medium">
        <Text as="h3" margin="none">
          Vouched by
        </Text>
        <Box>
          {Object.entries(vouches).map(([timestamp, v]) => (
            <Box key={timestamp} direction="row" gap="small">
              <Text color="accent-4">{format(+timestamp, 'YYYY-MM')}</Text>
              <Box direction="row" gap="xsmall">
                <Text>
                  {VouchType.Vouched === v.vouchType
                    ? 'Vouched by'
                    : 'Unvouched by'}
                </Text>
                <Link href={`/profiles/${v.byUsername}`}>{v.byUsername}</Link>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export const getServerSideProps = withGunAuthGate();

UserVouches.getLayout = function getLayout(page) {
  return (
    <NetworkLayout>
      <LoggedInLayout>
        <UserLayout>{page}</UserLayout>
      </LoggedInLayout>
    </NetworkLayout>
  );
};
