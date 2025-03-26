/**
 * @summary A reusable Progress Bar component
 */
import useAppService from '@/services/app/useAppService';
import { MainBarWrapper, ProgressBarWrapper, StyledStep } from './progressBar.styles';

function ProgressBar() {
  const { state } = useAppService();

  return (
    <ProgressBarWrapper>
      <MainBarWrapper>
        <StyledStep highlight={!state.step}>Home</StyledStep>
        <StyledStep highlight={state.step === 1}>Farm Information</StyledStep>
        <StyledStep highlight={state.step === 2}>Animals and Manure</StyledStep>
        <StyledStep highlight={state.step === 3}>Fields and Soil</StyledStep>
        <StyledStep highlight={state.step === 4}>Manure and Compost</StyledStep>
        <StyledStep highlight={state.step === 5}>Calculate Nutrients</StyledStep>
        <StyledStep highlight={state.step === 6}>Reporting</StyledStep>
      </MainBarWrapper>
    </ProgressBarWrapper>
  );
}

export default ProgressBar;
