/**
 * @summary A reusable Progress Bar component
 */
// import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAppService from '@/services/app/useAppService';
import SubBar from './SubBar/SubBar';
import { MainBarWrapper, ProgressBarWrapper, StyledStep } from './progressBar.styles';

function ProgressBar() {
  const { state } = useAppService();
  const navigate = useNavigate();

  // const handleHomeClick = () => navigate('/');
  // const handleFarmInfoClick = () => state.step >= 1 && navigate('/farm-information');
  // const handleAnimalManureClick = () => state.step >= 2 && navigate('/animals-and-manure');
  // const handleFieldsSoilClick = () => state.step >= 3 && navigate('/field-and-soil');
  // const handleManureCompostClick = () => state.step >= 4 && navigate('/manure-and-compost');
  // const handleCalculateNutrientsClick = () => state.step >= 5 && navigate('/calculate-nutrients');
  // const handleReportingClick = () => navigate('/calculate-nutrients');

  const handleHomeClick = () => navigate('/');
  const handleFarmInfoClick = () => navigate('/farm-information');
  const handleAnimalManureClick = () => navigate('/animals-and-manure');
  const handleFieldsSoilClick = () => navigate('/field-and-soil');
  const handleManureCompostClick = () => navigate('/manure-and-compost');
  const handleCalculateNutrientsClick = () => navigate('/calculate-nutrients');
  const handleReportingClick = () => navigate('/calculate-nutrients');

  return (
    <ProgressBarWrapper>
      <MainBarWrapper>
        <StyledStep
          onClick={handleHomeClick}
          highlight={!state.step}
        >
          Home
        </StyledStep>
        <StyledStep
          onClick={handleFarmInfoClick}
          highlight={state.step === 1}
        >
          Farm Information
        </StyledStep>
        <StyledStep
          onClick={handleAnimalManureClick}
          highlight={state.step === 2}
        >
          Animals and Manure
        </StyledStep>
        <StyledStep
          onClick={handleFieldsSoilClick}
          highlight={state.step === 3}
        >
          Fields and Soil
        </StyledStep>
        <StyledStep
          onClick={handleManureCompostClick}
          highlight={state.step === 4}
        >
          Manure and Compost
        </StyledStep>
        <StyledStep
          onClick={handleCalculateNutrientsClick}
          highlight={state.step === 5}
        >
          Calculate Nutrients
        </StyledStep>
        <StyledStep
          onClick={handleReportingClick}
          highlight={state.step === 6}
        >
          Reporting
        </StyledStep>
      </MainBarWrapper>
      <SubBar />
    </ProgressBarWrapper>
  );
}

export default ProgressBar;
