import PropTypes from 'prop-types';
import Head from 'next/head';
import Link from 'next/link';
import { Anchor, Box, Paragraph, Header, Nav, Text } from 'grommet';
import styled from 'styled-components';

import Logo from 'components/Logo';

const fixedTextWidth = '10.5em';

const FixedBar = styled(Box)`
  position: fixed;
  right: 0;
  bottom: 0;
  width: 3em;
  height: ${fixedTextWidth};
`;

const FixedBarText = styled.div`
  // position: relative;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(90deg);
  line-height: 1;
`;

export default function PublicLayout({ children }) {
  return (
    <>
      <Head>
        <title>
          VOUCH AGENCY | "decentralized" casting, creative network run by its
          members
        </title>
      </Head>
      <Box
        as="main"
        pad={{ horizontal: 'small', top: 'small', bottom: fixedTextWidth }}
      >
        {children}

        <FixedBar
          background="white"
          round={{ size: 'xsmall', corner: 'top-left' }}
        >
          <FixedBarText>
            <Paragraph size="medium">
              <Anchor href="mailto:world@vouch.agency">
                world@vouch.agency
              </Anchor>
            </Paragraph>
          </FixedBarText>
        </FixedBar>
      </Box>
      <Box as="footer" pad="small">
        <Text size="xsmall">
          you are <Link href="/privacy">not being tracked</Link> on this site.
        </Text>
      </Box>
    </>
  );
}

PublicLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
