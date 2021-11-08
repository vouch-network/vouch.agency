import type { NextComponentType, NextPageContext } from 'next';
import type { ReactNode } from 'react';

import { UserProvider } from 'components/useUser';
import { AuthProvider } from 'components/useAuth';
import useAuth from 'components/useAuth';
import Redirect from 'components/Redirect';
import LoadingScreen from 'components/LoadingScreen';

type Props = {
  children: any;
};

export default function AuthGate({ children }: Props) {
  const { isReady, isLoggedIn } = useAuth();

  if (isReady && isLoggedIn) {
    return children;
  }

  if (isReady && isLoggedIn === false) {
    return <Redirect to="/network/login" />;
  }

  return <LoadingScreen />;
}
