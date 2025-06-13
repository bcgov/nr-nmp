/**
 * @summary The landing page for the application
 */
import { useNavigate } from 'react-router-dom';
import { Button, ButtonGroup } from '@bcgov/design-system-react-components';
import constants from '../../constants/Constants';
import useAppService from '../../services/app/useAppService';
import { deleteLocalStorageKey } from '../../utils/AppLocalStorage';
import { StyledContent } from './landingPage.styles';
import { AppTitle, PageTitle, ProgressStepper } from '../../components/common';

export default function LandingPage() {
  const { setNMPFile } = useAppService();
  const navigate = useNavigate();

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
        setNMPFile(data);
        navigate('/farm-information');
      }
    };
  };

  const newCalcHandler = () => {
    deleteLocalStorageKey(constants.NMP_FILE_KEY);
    navigate('/farm-information');
  };

  return (
    <StyledContent>
      <ProgressStepper />
      <AppTitle />
      <PageTitle title="Nutrient Management Calculator" />
      <p>
        The Nutrient Management Calculator provides a starting point for the efficient use of
        fertilizer and manure on farms. This tool assists in you choosing the right rate and
        nutrient source for your crops. You can start a new calculation or pick up where you left
        off by uploading an existing .nmp file.
      </p>
      <ButtonGroup
        alignment="start"
        ariaLabel="A group of buttons"
        orientation="horizontal"
      >
        <Button
          size="medium"
          onPress={newCalcHandler}
          aria-label="Get Started"
          variant="primary"
          isDisabled={false}
        >
          Get Started
        </Button>
        <Button
          size="medium"
          onPress={handleUpload}
          aria-label="Upload an existing .nmp file"
          isDisabled={false}
          variant="secondary"
        >
          Upload File
        </Button>
        <input
          id="fileUp"
          type="file"
          accept=".nmp, application/json"
          onChange={saveFile}
          aria-label="Upload an existing .nmp file"
          hidden
        />
      </ButtonGroup>
    </StyledContent>
  );
}
