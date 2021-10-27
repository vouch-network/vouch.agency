import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Box, Button, Text, Nav } from 'grommet';

import useUser from 'components/useUser';
import LoadingScreen from 'components/LoadingScreen';

export default function LoggedInLayout({ children }) {
  const { userSettings, userProfile, error } = useUser();

  if (error) {
    console.error(error);

    return (
      <Box background="status-error" pad="small" round="xsmall">
        <Text weight="bold">
          Something went wrong. Send the following error to your admin:
        </Text>
        <code>{error.message}</code>
      </Box>
    );
  }

  if (userSettings) {
    return (
      <>
        <Head>
          <title>
            {userProfile?.displayName || userSettings.username} | VOUCH AGENCY
            Creative Network
          </title>
        </Head>
        {children}
      </>
    );
  }

  return <LoadingScreen />;
}
