import type { NextComponentType, NextPageContext } from 'next';
// import { UserProvider } from '@auth0/nextjs-auth0';
import { createGlobalStyle } from 'styled-components';
import { Grommet } from 'grommet';

import { GunProvider } from 'components/useGun';
import { UserProvider } from 'components/useUser';
import theme, { colors } from 'utils/theme';

// custom AppProps type to accomodate layout
type AppProps = {
  pageProps: any;
  Component: NextComponentType<NextPageContext, any, {}> & {
    getLayout: (page?: any) => any;
  };
};

const GlobalStyle = createGlobalStyle`
  html,
  body {
    padding: 0;
    margin: 0;
  }

  a {
    // Match grommet link styles
    color: ${colors.brand};
    font-weight: 600;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  * {
    box-sizing: border-box;
    scroll-behavior: smooth;
  }
`;

function MyApp({ Component, pageProps }: AppProps) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <>
      <GlobalStyle />
      <Grommet full theme={theme}>
        <GunProvider sessionUser={pageProps.user}>
          <UserProvider user={pageProps.user}>
            {getLayout(<Component {...pageProps} />)}
          </UserProvider>
        </GunProvider>
      </Grommet>
    </>
  );
}
export default MyApp;
