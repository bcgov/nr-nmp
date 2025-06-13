import styled from '@emotion/styled';

import { componentContainer, buttonGroup, paragraphCss } from '../../common.styles';

export const ErrorText = styled.div`
  color: red;
`;

export const StyledContent = styled.div`
  margin-bottom: 1rem;
  ${componentContainer}

  ${paragraphCss}

  ${buttonGroup}
`;
