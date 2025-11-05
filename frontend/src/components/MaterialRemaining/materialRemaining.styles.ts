/**
 * @summary Styling for Material Remaining components
 */
import styled from '@emotion/styled';

export const MaterialRemainingContainer = styled.div`
  border: 1px solid #d1d5db;
  border-radius: 8px;
  margin: 16px 0;
  padding: 16px;
  background-color: #fafafa;
`;

export const MaterialRemainingTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #374151;
`;

export const SectionTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #4b5563;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 4px;
`;

export const MaterialRemainingItem = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 12px;
  padding: 12px;
  background-color: #ffffff;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const SourceName = styled.div`
  font-weight: 600;
  font-size: 1rem;
  color: #111827;
  margin-bottom: 8px;
`;

export const PercentageDisplay = styled.div<{ $percentRemaining: number }>`
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: ${({ $percentRemaining }) => {
    if ($percentRemaining <= 25) return '#ef4444';
    if ($percentRemaining <= 75) return '#f59e0b';
    return '#10b981';
  }};
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 24px;
  color: #6b7280;
  font-style: italic;
`;
