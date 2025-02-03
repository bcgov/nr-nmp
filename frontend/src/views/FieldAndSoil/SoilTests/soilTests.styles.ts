/**
 * @summary Styling for FieldList view
 */
import styled from '@emotion/styled';

export const CardContent = styled.div`
  margin-bottom: 150px;
`;

export const ListItemContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 16px;
  width: 100%;
  justify-content: flex-start;
  align-items: center;
`;

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
