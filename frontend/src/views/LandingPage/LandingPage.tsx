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
          <h1>Nutrient Management Calculator</h1>
          <p>
            The Nutrient Management Calculator provides a starting point for the efficient use of
            fertilizer and manure on farms. This tool assists in you choosing the right rate and
            nutrient source for your crops. You can start a new calculation or pick up where you
            left off by uploading an existing .nmp file.
          </p>
        </StyledContent>
        <ButtonWrapper>
          <Button
            text="Start a new calculation"
            size="lg"
            handleClick={newCalcHandler}
            aria-label="Start a new calculation"
            variant="primary"
            disabled={false}
          />
        </ButtonWrapper>
        <StyledDivider>or</StyledDivider>
        <ButtonWrapper>
          <Button
            size="lg"
            text="Upload an existing .nmp file"
            handleClick={handleUpload}
            aria-label="Upload an existing .nmp file"
            variant="primary"
            disabled={false}
          />
          <input
            id="fileUp"
            type="file"
            accept=".nmp, application/json"
            onChange={saveFile}
            aria-label="Upload an existing .nmp file"
            hidden
          />
        </ButtonWrapper>
      </Card>
    </ViewContainer>
  );
}
