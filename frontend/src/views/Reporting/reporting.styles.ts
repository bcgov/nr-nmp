import styled from '@emotion/styled';

import { componentContainer, buttonGroup, paragraphCss } from '../../common.styles';

export const SectionHeader = styled.div({
  width: '100%',
  lineHeight: '3rem',
  textAlign: 'center',
  backgroundColor: '#f2f2f2',
  marginBottom: '3rem',
});

export const StyledContent = styled.div({
  marginBottom: '1rem',
  backgroundColor: 'green',
  ...componentContainer,
  paragraphCss,
  buttonGroup,
});

export const Error = styled.div`
  display: flex;
  border: 1px solid #c81212;
  width: 400px;
  margin-bottom: 9px;
  box-shadow:
    0 2px 3px rgba(0, 0, 0, 0.4),
    0 0 45px rgba(255, 255, 255, 0.7) inset;
`;

export const Message = styled.div`
  display: flex;
  color: black !important;
  font-size: 12px;
  font-weight: bold;
  align-items: center;
`;

export const Icon = styled.img`
  margin: 0.25em;
`;

export const customTableStyle = {
  '& .MuiDataGrid-columnHeader > .MuiDataGrid-columnSeparator': {
    visibility: 'hidden',
  },
  '& .MuiDataGrid-row--borderBottom > div': {
    backgroundColor: 'lightblue !important',
  },
  '& div div div div >.MuiDataGrid-cell': {
    whiteSpace: 'break-spaces',
  },
  '& .MuiDataGrid-row:hover': {
    backgroundColor: 'transparent',
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontWeight: '700',
    whiteSpace: 'break-spaces',
  },
};
