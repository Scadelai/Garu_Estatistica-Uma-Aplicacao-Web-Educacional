import { createTheme } from '@mantine/core';

export const theme = createTheme({
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  primaryColor: 'cyan',
  defaultRadius: 'md',
  headings: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    fontWeight: '700',
  },
  components: {
    Paper: {
      defaultProps: {
        radius: 'lg',
      },
    },
  },
});
