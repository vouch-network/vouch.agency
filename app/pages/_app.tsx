import type { NextComponentType, NextPageContext } from 'next';
import { createGlobalStyle } from 'styled-components';
import { Grommet } from 'grommet';

import { GunProvider } from 'components/useGun';
import { UserProvider } from 'components/useUser';
import { AuthProvider } from 'components/useAuth';
import { ApiTokenProvider } from 'components/useApiToken';
import { SessionChannelProvider } from 'components/useSessionChannel';
import AuthGate from 'components/AuthGate';
import theme, { colors } from 'utils/theme';

// custom AppProps
type AppProps = {
  pageProps: any;
  Component: NextComponentType<NextPageContext, any, {}> & {
    getLayout?: (page?: any) => any;
    authRequired?: boolean;
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
  const authRequired = Component.authRequired || false;
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <>
      <GlobalStyle />
      <Grommet full theme={theme}>
        <SessionChannelProvider>
          <ApiTokenProvider>
            <GunProvider>
              <AuthProvider>
                <UserProvider>
                  {authRequired ? (
                    <AuthGate>
                      {getLayout(<Component {...pageProps} />)}
                    </AuthGate>
                  ) : (
                    getLayout(<Component {...pageProps} />)
                  )}
                </UserProvider>
              </AuthProvider>
            </GunProvider>
          </ApiTokenProvider>
        </SessionChannelProvider>
      </Grommet>
    </>
  );
}
export default MyApp;
