/**
 * @summary The landing page for the application
 */
import {
  ButtonWrapper,
  ViewContainer,
  StyledDivider,
  StyledContent,
  Card,
} from './landingPage.styles';
import { Button } from '../../components/common';

export default function LandingPage() {
  const handleUpload = () => {
    const upload = document.getElementById('fileUp');
    if (upload) upload.click();
  };

  const isValidFile = (file: File): boolean =>
    file.type === 'application/json' || file.name.endsWith('.nmp');

  const saveFile = (e: any) => {
    const file = e.target.files[0];
    if (!isValidFile(file)) {
      return;
    }
    const fr = new FileReader();
    fr.readAsText(file);
    fr.onload = () => {
      const data = fr.result;
      if (data) {
        console.log(data.toString());
        // The alert is temporary, will be removed once the data is being used
        // eslint-disable-next-line no-alert
        alert(data.toString());
      }
    };
  };

  const newCalcHandler = () => {
    localStorage.clear();
    console.log('New Calculation');
    // The alert is temporary, will be removed once the data is being used
    // eslint-disable-next-line no-alert
    alert('New Calculation');
  };

  return (
    <ViewContainer>
      <Card>
        <StyledContent>
          <h3>About the nutrient calculator</h3>
          <p>
            The Nutrient Management Calculator is a simple tool to help farmers maintain soil
            nutritent levels, taking into consideration many different farm types. You can start a
            new calculation or pick up where you left off by uploading an old .nmp file!
          </p>
        </StyledContent>
        <ButtonWrapper>
          <Button
            text="New Calculation"
            size="lg"
            handleClick={newCalcHandler}
            aria-label="New Calculation"
            variant="primary"
            disabled={false}
          />
        </ButtonWrapper>
        <StyledDivider>or</StyledDivider>
        <ButtonWrapper>
          <Button
            size="lg"
            text="Load Existing File"
            handleClick={handleUpload}
            aria-label="Upload File"
            variant="primary"
            disabled={false}
          />
          <input
            id="fileUp"
            type="file"
            accept=".nmp, application/json"
            onChange={saveFile}
            aria-label="Upload File"
            hidden
          />
        </ButtonWrapper>
      </Card>
    </ViewContainer>
  );
}
