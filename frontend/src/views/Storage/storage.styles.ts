/**
 * @summary Styling for ManureAndCompost view
 */
import styled from '@emotion/styled';
import { buttonGroup, componentContainer, paragraphCss } from '@/common.styles';

export const ErrorText = styled.div`
  color: red;
`;

export const StyledContent = styled.div`
  margin-bottom: 1rem;
  ${componentContainer}

  ${paragraphCss}

  ${buttonGroup}
`;

export const SystemDisplay = styled.div`
  border: 1px solid #353433;
  border-radius: 4px;
  margin: 8px;
  width: 100%;
  padding: 8px;

  .row {
    display: flex;
    justify-content: space-between;

    > .margin-right {
      margin-right: 2em;
    }
  }

  ul {
    list-style: none;
  }
`;
