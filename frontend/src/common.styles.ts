import * as tokens from '@bcgov/design-tokens/js';
import { css } from '@emotion/react';
import styled from '@emotion/styled';

export const componentContainer = css({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: '3rem',
  marginRight: '3rem',
  maxWidth: '900px',
  width: '100%',
  minHeight: 'calc(100vh - 160px)',
});

export const formCss = css({
  marginTop: '1rem',
  width: '100%',

  '.bcds-react-aria-TextField': {
    width: '100%',
  },

  '.bcds-react-aria-NumberField': {
    width: '100%',
  },

  '.bcds-react-aria-Select': {
    Button: {
      width: '100%',
    },
  },

  '#exclamation-icon': {
    display: 'none;',
  },

  '.bcds-react-aria-TextField[data-invalid] .bcds-react-aria-TextField--Label': {
    color: 'var(--support-border-color-danger); !important',
  },

  '.bcds-react-aria-NumberField[data-invalid] .bcds-react-aria-NumberField--Label': {
    color: 'var(--support-border-color-danger); !important',
  },

  '.bcds-react-aria-Select--Label:has(+ .bcds-react-aria-Select--Button.invalid)': {
    color: 'var(--support-border-color-danger); !important',
  },
});

export const hideCheckboxGroup = css({
  display: 'none',
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
    flexGrow: '0',
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
  '& div div div div > .MuiDataGrid-cell': {
    borderBottom: 'none',
    borderTop: '1px solid rgba(224, 224, 224, 1)',
  },
  '& .MuiDataGrid-row:hover': {
    backgroundColor: 'transparent',
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontWeight: '700',
    whiteSpace: 'break-spaces',
  },
};

export const tableActionButtonCss = css({
  paddingLeft: '0.75rem',
  color: 'var(--surface-color-primary-button-default)',
});

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

export const ErrorText = styled.div`
  color: red;
`;

export const ModalInstructions = styled.div`
  font: var(--typography-regular-body);
  margin-bottom: 4px;
`;
