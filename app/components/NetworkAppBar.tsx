import Link from 'next/link';
import { Header, Box, Button, Nav, Text } from 'grommet';

import useAuth from 'components/useAuth';
import Logo from 'components/Logo';
import { colors } from 'utils/theme';

export default function NetworkAppBar() {
  const { isLoggedIn } = useAuth();

  return (
    <Header justify="between" pad="small">
      <Link href="/network">
        <Box direction="row" gap="xsmall">
          <Logo color="black" />
          <Text weight={900} size="large" color="black">
            net.beta
          </Text>
        </Box>
      </Link>

      {isLoggedIn && (
        <Nav direction="row" align="center">
          {/* <Link href="/network/we">The network</Link> */}
          <Link href="/network/me">Your profile</Link>
          <Link href="/network/how-to">A guide</Link>
        </Nav>
      )}

      <Link href="/profiles">
        <Box direction="row" gap="xsmall">
          <Logo />
          <Text color="brand" weight={900} size="large">
            agcy.
          </Text>
        </Box>
      </Link>
    </Header>
  );
}
