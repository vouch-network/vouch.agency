import { useContext } from 'react';
import { ResponsiveContext } from 'grommet';

export default function useResponsiveContext() {
  return useContext(ResponsiveContext);
}
