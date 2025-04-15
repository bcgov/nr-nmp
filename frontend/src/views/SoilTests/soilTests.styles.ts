/**
 * @summary Styling for FieldList view
 */
import styled from '@emotion/styled';
import { componentContainer, buttonGroup, paragraphCss } from '../../common.styles';

export const InfoBox = styled.div`
  background-color: rgba(200, 200, 200, 0.3);
  padding: 10px;
  border-radius: 5px;
  text-align: left;
  margin: 15px 0 15px 0;
  ul {
    padding-left: 10px;
    margin-top: 5px;
  }
  li {
    margin-bottom: 2px;
  }
`;

export const StyledContent = styled.div`
  margin-bottom: 1rem;
  ${componentContainer}

  ${paragraphCss}

  ${buttonGroup}
`;
