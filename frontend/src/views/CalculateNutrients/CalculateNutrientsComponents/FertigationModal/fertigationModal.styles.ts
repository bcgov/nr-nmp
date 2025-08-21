import { css } from '@emotion/react';

export const modalContentStyles = css({
  maxHeight: '80vh',
  overflowY: 'auto',
  padding: '1rem',
});

export const calculationDisplayStyles = css({
  display: 'flex',
  gap: '1rem',
  justifyContent: 'space-between',
  marginTop: '1rem',
  '@media (max-width: 768px)': {
    flexDirection: 'column',
  },
});

export const calculationItemStyles = css({
  flex: 1,
  minWidth: '150px',
});

export const calculationLabelStyles = css({
  fontSize: '14px',
  fontWeight: 'bold',
  display: 'block',
  marginBottom: '4px',
});

export const calculationValueStyles = css({
  fontSize: '16px',
  fontWeight: 'bold',
});

export const concentrationDisplayStyles = css({
  display: 'flex',
  gap: '1rem',
  justifyContent: 'space-between',
  marginTop: '1rem',
  '@media (max-width: 768px)': {
    flexDirection: 'column',
  },
});

export const concentrationItemStyles = css({
  flex: 1,
  minWidth: '280px',
});

export const concentrationHeaderStyles = css({
  fontWeight: 'bold',
  textAlign: 'center',
  fontSize: '14px',
  marginBottom: '8px',
  lineHeight: '1.2',
});

export const solubilityHeaderStyles = css({
  fontWeight: 'bold',
  textAlign: 'center',
  fontSize: '14px',
  marginBottom: '8px',
  marginTop: '1rem',
});

export const solubilityStatusStyles = css({
  textAlign: 'center',
  padding: '8px 16px',
  borderRadius: '4px',
  fontWeight: 'bold',
  fontSize: '14px',
});

export const solubilityStatusSoluble = css(solubilityStatusStyles, {
  backgroundColor: '#d4edda',
  color: '#155724',
});

export const solubilityStatusNotSoluble = css(solubilityStatusStyles, {
  backgroundColor: '#f8d7da',
  color: '#721c24',
});

export const solubilityStatusNormal = css({
  textAlign: 'center',
  padding: '8px 16px',
  backgroundColor: '#f8f9fa',
  color: '#6c757d',
  borderRadius: '4px',
  fontSize: '14px',
  fontStyle: 'italic',
});

export const dryApplicationTimeStyles = css({
  marginTop: '1rem',
  textAlign: 'center',
});

export const nutrientTablesContainerStyles = css({
  display: 'flex',
  gap: '1rem',
  justifyContent: 'space-between',
  marginTop: '1.5rem',
  '@media (max-width: 768px)': {
    flexDirection: 'column',
  },
});

export const nutrientTableItemStyles = css({
  flex: 1,
  minWidth: '250px',
});

export const nutrientTableHeaderStyles = css({
  fontWeight: 'bold',
  textAlign: 'center',
  fontSize: '14px',
  marginBottom: '8px',
});

export const dataGridStyles = css({
  fontSize: '12px',
});
