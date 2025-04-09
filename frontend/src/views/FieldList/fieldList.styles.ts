/**
 * @summary Styling for FieldList view
 */
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { componentContainer, buttonGroup, paragraphCss } from '../../common.styles';

export const ContentWrapper = styled.div<{ hasFields: boolean }>`
  margin-bottom: ${({ hasFields }) => (hasFields ? '170px' : '0')};
`;

export const ListItemContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
`;

export const ButtonWrapper = styled.div`
  bottom: 16px;
  right: 16px;
  padding: 5px;
  button {
    width: 100px;
    height: 40px;
  }
`;

export const TopRightButtonWrapper = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  button {
    width: 100px;
    height: 40px;
  }
`;

export const CenterButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  button {
    width: 100px;
    height: 40px;
  }
`;

export const ButtonContainer = styled.div<{ hasFields: boolean }>`
  display: flex;
  justify-content: ${({ hasFields }) => (hasFields ? 'flex-end' : 'center')};
  margin: 16px 0;
  button {
    width: 100px;
    height: 40px;
  }
`;

export const Header = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 10px;
  font-weight: bold;
  margin-bottom: 10px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
`;

export const Column = styled.div<{ align?: string }>`
  text-align: ${({ align }) => (align === 'right' ? 'right' : 'left')};
`;

export const ListItem = styled.div<{ align?: string }>`
  text-align: ${({ align }) => (align === 'right' ? 'right' : 'left')};
`;

export const ErrorText = styled.div`
  color: red;
`;

export const StyledContent = styled.div`
  margin-bottom: 1rem;
  ${componentContainer}

  ${paragraphCss}

  ${buttonGroup}
`;

export const subHeader = css({
  fontWeight: '700',
  size: '1.25rem',
  lineHeight: '100%',
  letterSpacing: '0px',
});

export const customTableStyle = {
  borderStyle: 'none',
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
};

export const tableActionButtonCss = css({
  paddingLeft: '0.75rem',
  color: 'var(--surface-color-primary-button-default)',
});

export default {
  customTableStyle,
  StyledContent,
  subHeader,
  tableActionButtonCss,
};
