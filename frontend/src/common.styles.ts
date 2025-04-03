import * as tokens from '@bcgov/design-tokens/js';
import { css } from '@emotion/react';

export const componentContainer = css({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: '3rem',
  marginRight: '3rem',
  maxWidth: '900px',
});

export const formCss = css({
  marginTop: '1rem',
  width: '100%',

  '.bcds-react-aria-TextField': {
    width: '100%',

    '> .bcds-react-aria-TextField--Error': {
      display: 'none;',
    },
  },

  '.bcds-react-aria-Select': {
    Button: {
      width: '100%',
    },

    '> .bcds-react-aria-Select--Error': {
      display: 'none;',
    },
  },

  '#exclamation-icon': {
    display: 'none;',
  },

  '.--error': {
    color: 'var(--support-border-color-danger);',
  },
});

export const hideCheckboxGroup = css({
  height: '0',
  overflow: 'hidden',
  width: '0',
});

export const showCheckboxGroup = css({
  '> label': {
    marginLeft: '2rem',
    marginTop: '0.5rem',
  },
});

export const paragraphCss = css({
  p: {
    color: `${tokens.typographyColorSecondary}`,
    marginTop: '1.25rem',
    marginBottom: '2.5rem',
    textAlign: 'left',
  },
});

export const buttonGroup = css({
  '.bcds-ButtonGroup': {
    marginTop: '1rem',
    marginBottom: '3rem',
  },
});

export const formGridBreakpoints = { xs: 12, md: 6 };
