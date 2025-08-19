import styled from '@emotion/styled';

import { css } from '@emotion/react';
// import { componentContainer, buttonGroup, paragraphCss } from '../../common.styles';

export const SectionHeader = styled.div({
  width: '100%',
  lineHeight: '3rem',
  textAlign: 'center',
  backgroundColor: '#f2f2f2',
  marginBottom: '3rem',
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
    padding: '8px 12px',
    fontSize: '14px',
  },
  '& .MuiDataGrid-row:hover': {
    backgroundColor: 'transparent',
  },
  '& .MuiDataGrid-columnHeaderTitleContainer': {
    height: 'auto',
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontWeight: '700',
    whiteSpace: 'break-spaces',
    fontSize: '14px',
    overflow: 'visible',
  },
  marginBottom: '16px',
  border: '1px solid #e0e0e0',
  borderRadius: '4px',
};

export const ROW_HEIGHT = 48;

export const FieldContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  // padding: 24px;
  background-color: #ffffff;
  border-radius: 8px;
`;

export const FieldInfoSection = styled.div`
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 24px;
  border-left: 4px solid #007cba;
`;

export const FieldInfoItem = styled.div`
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.6;

  &:last-child {
    margin-bottom: 0;
  }

  span {
    color: #333;
  }
`;

export const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 24px 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e9ecef;
`;

export const TableHeader = styled.div`
  display: flex;
  font-weight: 600;
  text-align: center;
  margin: 20px 0 8px 0;
  font-size: 16px;
  color: #495057;

  div {
    padding: 12px 8px;
    background-color: #f1f3f4;
    border: 1px solid #dee2e6;

    &:first-of-type {
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
    }

    &:last-of-type {
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
    }
  }
`;

export const SubsectionLabel = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #495057;
  margin: 16px 0 8px 0;
  padding: 8px 12px;
  background-color: #e9ecef;
  border-radius: 4px;
  border-left: 3px solid #6c757d;
`;

export const inventoryTableHeader = css({
  fontWeight: 'bold',
  backgroundColor: 'lightblue',
});

export const inventoryTableCss = css({
  fontSize: '14px',
  th: {
    paddingLeft: '1rem',
    borderStyle: 'none',
  },
  tr: {
    td: {
      borderColor: 'rgba(224, 224, 224, 1)',
      borderWidth: '1px',
      borderTopStyle: 'solid',
      paddingLeft: '1rem',
      paddingTop: '0.25rem',
      paddingBottom: '0.25rem',
    },
  },
});
