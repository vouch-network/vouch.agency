import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Redirect({ to }: { to: string }) {
  const router = useRouter();

  useEffect(() => {
    if (to) {
      router.replace(to);
    }
  }, [to]);

  return null;
}
