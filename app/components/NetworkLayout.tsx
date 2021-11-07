import { ReactNode } from 'react';
import Head from 'next/head';
import { Box } from 'grommet';

import NetworkAppBar from 'components/NetworkAppBar';
import NetworkFooter from 'components/NetworkFooter';

type Props = {
  children: ReactNode;
  centerHorizontally?: boolean;
};

export default function NetworkLayout({ centerHorizontally, children }: Props) {
  const mainProps: any = {};
  const wrapperProps: any = {};

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
        <title>VOUCH AGENCY Creative Network</title>
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

          <NetworkFooter />
        </Box>
      </Box>
    </>
  );
}
