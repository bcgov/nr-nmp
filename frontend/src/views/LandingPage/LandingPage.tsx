/**
 * @summary The landing page for the application
 */
import { Wrapper, ButtonWrapper, ViewContainer, StyledDivider } from './landingPage.styles';
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
      if (data) console.log(data.toString());
    };
  };

  const newCalcHandler = () => {
    localStorage.clear();
    console.log('New Calculation');
  };
  return (
    <ViewContainer>
      <Wrapper>
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
      </Wrapper>
    </ViewContainer>
  );
}
