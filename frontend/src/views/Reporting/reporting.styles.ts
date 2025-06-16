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
