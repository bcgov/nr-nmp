/**
 * @summary Styling for AddAnimals view
 */
import styled from '@emotion/styled';
import { componentContainer, buttonGroup, paragraphCss } from '../../../common.styles';

export const StyledContent = styled.div`
  margin-bottom: 1rem;

  ${componentContainer}
  ${paragraphCss}
  ${buttonGroup}
`;

export const AppTitleStyle = styled.div`
  text-align: left;
  font-size: 1.5rem;
  font-weight: 700;
  padding-bottom: 1.5rem;
  border-bottom-style: solid;
  border-bottom-width: 2px;
  width: 100%;
  border-bottom-color: #fcba19;
  margin-bottom: 1.5rem;
`;

export const PageTitleStyle = styled.div`
  background-color: #f2f2f2;
  text-align: left;
  line-height: 1rem;
  font-size: 1rem;
  font-weight: 700;
  width: 100%;
  height: 3rem;
  padding: 1rem;
`;
