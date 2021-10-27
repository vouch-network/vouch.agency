/*
 * Usage:
 *  export const getServerSideProps = withGunAuthGate();
 *
 *  Component.getLayout = function getLayout(page) {
 *    return (
 *      <GunAuthGate>
 *        {page}
 *      </GunAuthGate>
 *    );
 *  };
 */
import { useEffect } from 'react';

import useGun from 'components/useGun';
import { withSession, getUser } from 'lib/session';

// block rendering until authenticated
export default function GunAuthGate({ children }) {
  const { isAuthenticated } = useGun();

  if (isAuthenticated) {
    return children;
  }

  return null;
}

export function withGunAuthGate() {
  return withSession(async function (context) {
    const user = getUser(context.req);

    if (!user) {
      return {
        redirect: {
          destination: '/network/login',
          permanent: false,
        },
      };
    }

    return {
      props: { user }, // will be passed to the page component as props
    };
  });
}
