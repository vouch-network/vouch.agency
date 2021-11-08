import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Box, Text, Spinner } from 'grommet';
import { format } from 'fecha';
import { orderBy } from 'lodash';

import useAuth from 'components/useAuth';
import useGun from 'components/useGun';
import NetworkLayout from 'components/NetworkLayout';
import UserLayout from 'components/UserLayout';
import { expandDataKeys } from 'utils/gunDB';
import { VouchType, Vouch } from 'utils/vouches';
import { GUN_PREFIX, GUN_PATH, GUN_KEY } from 'utils/constants';

// TODO better loading indicator
const Loading = () => (
  <Box pad="medium" alignSelf="center">
    <Spinner size="medium" />
  </Box>
);

function UserVouches() {
  const { getUser } = useAuth();
  const { getGun, isGunReady } = useGun();
  const [receivedVouches, setReceivedVouches] = useState<Vouch[]>();
  const [givenVouches, setGivenVouches] = useState<Vouch[]>();

  const getVouches = async () => {
    const user = (await getUser())!;
    const gun = getGun()!;

    // Vouches received:
    gun
      .get(`${GUN_PREFIX.id}:${user.id}/${GUN_PATH.vouches}`)
      .map()
      .once((data: any, giverIdentifier: string) => {
        const vouches: Vouch[] = [];

        // Skip first key, which is the gun "_"
        Object.keys(data)
          .slice(1)
          .forEach((timestamp) => {
            const [, vouchType] = data[timestamp].split('|');

            vouches.push({
              username: giverIdentifier,
              timestamp: +timestamp,
              vouchType: +vouchType,
            });
          });

        setReceivedVouches(orderBy(vouches, 'timestamp', 'desc'));
      });

    // Vouches given:
    gun
      .get(`${GUN_PREFIX.app}:${GUN_PATH.vouches}`)
      .get(`${GUN_PREFIX.id}:${user.id}}`)
      .once((data) => {
        if (!data) {
          setGivenVouches([]);
        }
      })
      .map()
      .once((data: any) => {
        const vouches: Vouch[] = [];

        // Skip first key, which is the gun "_"
        Object.keys(data)
          .slice(1)
          .forEach((timestamp) => {
            const [receiverIdentifier, vouchType] = data[timestamp].split('|');

            vouches.push({
              username: receiverIdentifier,
              timestamp: +timestamp,
              vouchType: +vouchType,
            });
          });

        setGivenVouches(orderBy(vouches, 'timestamp', 'desc'));
      });
  };

  useEffect(() => {
    if (isGunReady) {
      getVouches();
    }
  }, [isGunReady]);

  return (
    <Box pad={{ horizontal: 'medium' }} width="medium" gap="large">
      <Box gap="medium">
        <Text as="h3" margin="none">
          Vouches &amp; unvouches received
        </Text>
        <Box>
          {!receivedVouches && <Loading />}
          {receivedVouches &&
            receivedVouches.map((vouch) => (
              <Box key={vouch.timestamp} direction="row" gap="small">
                <Text color="accent-4">
                  {/* @ts-ignore */}
                  {format(vouch.timestamp, 'YYYY-MM')}
                </Text>
                <Box direction="row" gap="xsmall">
                  <Text>
                    {VouchType.Vouched === vouch.vouchType
                      ? 'Vouched by'
                      : 'Unvouched by'}
                  </Text>
                  {vouch.username === 'admin' ? (
                    'admin'
                  ) : (
                    <Link href={`/profiles/${vouch.username}`}>
                      {vouch.username}
                    </Link>
                  )}
                </Box>
              </Box>
            ))}
        </Box>
      </Box>

      <Box gap="medium">
        <Text as="h3" margin="none">
          Vouches &amp; unvouches given
        </Text>
        <Box>
          {!givenVouches && <Loading />}
          {givenVouches?.length === 0 && (
            <Text color="status-unknown">Haven't vouched for anyone yet</Text>
          )}
          {givenVouches &&
            givenVouches.map((vouch) => (
              <Box key={vouch.timestamp} direction="row" gap="small">
                <Text color="accent-4">
                  {/* @ts-ignore */}
                  {format(vouch.timestamp, 'YYYY-MM')}
                </Text>
                <Box direction="row" gap="xsmall">
                  <Text>
                    {VouchType.Vouched === vouch.vouchType
                      ? 'Vouched for'
                      : 'Unvouched for'}
                  </Text>
                  {vouch.username === 'admin' ? (
                    'admin'
                  ) : (
                    <Link href={`/profiles/${vouch.username}`}>
                      {vouch.username}
                    </Link>
                  )}
                </Box>
              </Box>
            ))}
        </Box>
      </Box>
    </Box>
  );
}

UserVouches.getLayout = function getLayout(page: any) {
  return (
    <NetworkLayout>
      <UserLayout>{page}</UserLayout>
    </NetworkLayout>
  );
};

UserVouches.authRequired = true;

export default UserVouches;
