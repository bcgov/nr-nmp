import * as tokens from '@bcgov/design-tokens/js';
import { css } from '@emotion/react';

export const componentContainer = css({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: '3rem',
  marginRight: '3rem',
  maxWidth: '900px',
  width: '100%',
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

    '+ div > .bcds-react-aria-TextField--container': {
      borderColor: 'var(--support-border-color-danger) !important;',
    },

    '+ div > div > input': {
      borderColor: 'var(--support-border-color-danger) !important;',
    },

    '+ div > .bcds-react-aria-Select--Button': {
      borderColor: 'var(--support-border-color-danger) !important;',
    },
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
  },
});

export const formGridBreakpoints = { xs: 12, md: 6 };

export const customTableStyle = {
  
  borderStyle: 'none',
  '& .MuiDataGrid-columnHeader > .MuiDataGrid-columnSeparator': {
    visibility: 'hidden',
  },
  '& .MuiDataGrid-columnHeaders': {
    borderBottom: 'none',
  },
  '& div div div div >.MuiDataGrid-cell': {
    borderBottom: 'none',
    borderTop: '1px solid rgba(224, 224, 224, 1)',
  },
  '& .MuiDataGrid-row:hover': {
    backgroundColor: 'transparent',
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontWeight: '700',
    whiteSpace: 'break-spaces'
  },
};

export const tableActionButtonCss = css({
  paddingLeft: '0.75rem',
  color: 'var(--surface-color-primary-button-default)',
});

export const modalHeaderStyle = css({
  fontWeight: '700',
  fontSize: '1.25rem',
});

export const modalDividerStyle = css({ marginTop: '0.5rem', marginBottom: '0.5rem' });

export const addRecordGroupStyle = css({
  '.bcds-ButtonGroup': {
    overflow: 'visible',
    height: '0rem',
    '> button': {
      position: 'relative',
      bottom: '-0.25rem',
      zIndex: '10',
    },
  },
});

export const modalPaddingStyle = css({
  padding: '1rem',
});
