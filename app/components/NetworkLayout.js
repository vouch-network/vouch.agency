import PropTypes from 'prop-types';
import Head from 'next/head';
import { Box, Main } from 'grommet';

import NetworkAppBar from 'components/NetworkAppBar';
import NetworkFooter from 'components/NetworkFooter';

export default function NetworkLayout({ centerHorizontally, children }) {
  const mainProps = {};
  const wrapperProps = {};

  if (centerHorizontally) {
    mainProps.fill = true;
    wrapperProps.fill = true;
    wrapperProps.justify = 'center';
  } else {
    wrapperProps.height = { min: '100vh' };
  }

  return (
    <>
      <Head>
        <title>
          VOUCH AGENCY | "decentralized" casting, creative network run by its
          members
        </title>
        <link
          href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=fallback"
          rel="stylesheet"
        />
      </Head>
      <Box as="main" {...mainProps}>
        <NetworkAppBar />
        <Box {...wrapperProps}>
          <Box pad="small" align="center" {...wrapperProps}>
            {children}
          </Box>
          <Box background="black">
            <NetworkFooter />
          </Box>
        </Box>
      </Box>
    </>
  );
}

NetworkLayout.propTypes = {
  centerHorizontally: PropTypes.bool,
  children: PropTypes.node.isRequired,
};
