import { deepMerge } from 'grommet/utils';
import { grommet } from 'grommet/themes';

export const colors = {
  brand: '#808000',
  'accent-1': '#c9f299',
  'accent-2': '#dc0073',
  'accent-3': '#fcfc58',
  'accent-4': '#00a1e4',
  'neutral-1': '#628395',
  'neutral-2': '#222e50',
  'neutral-3': '#7a5c58',
  'neutral-4': '#4c1a57',
};

const sansSerifFont =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif';
const serifFont = '"EB Garamond", Garamond, Baskerville, "Hoefler Text", serif';

// https://github.com/grommet/grommet/wiki/Grommet-v2-theming-documentation
const lightTheme = deepMerge(grommet, {
  global: {
    colors: {
      ...colors,
      active: colors['accent-1'],
      focus: colors['accent-1'],
    },
    font: {
      family: sansSerifFont,
    },
  },
  formField: {
    border: { position: 'inner', side: 'all' },
  },
  button: {
    border: {
      radius: '.4rem',
    },
    padding: {
      horizontal: '1.2rem',
      vertical: '.4rem',
    },
    size: {
      small: {
        border: {
          radius: '.4rem',
        },
        pad: {
          horizontal: '.6rem',
          vertical: '.3rem',
        },
      },
      medium: {
        border: {
          radius: '.4rem',
        },
        pad: {
          horizontal: '1.2rem',
          vertical: '.4rem',
        },
      },
      large: {
        border: {
          radius: '.4rem',
        },
        pad: {
          horizontal: '1.3rem',
          vertical: '.6rem',
        },
      },
    },
  },
  heading: {
    font: {
      family: serifFont,
    },
  },
  paragraph: {
    font: {
      family: serifFont,
    },
  },
});

export default lightTheme;
