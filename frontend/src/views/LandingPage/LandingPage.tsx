/**
 * @summary The landing page for the application
 */
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import constants from '../../constants/Constants';
import useAppService from '../../services/app/useAppService';
import { deleteLocalStorageKey } from '../../utils/AppLocalStorage';
import { ButtonWrapper, StyledDivider, StyledContent } from './landingPage.styles';
import { Button, Card } from '../../components/common';
import DialogModal from '@/components/common/DialogModal/DialogModal';

export default function LandingPage() {
  const { setNMPFile } = useAppService();
  const navigate = useNavigate();

  // Props for dialog modal
  const location = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [modalDialog, _] = useState(
    location.state !== null && typeof location.state === 'object' ? location.state.text : undefined,
  );
  const [isVisible, setIsVisible] = useState<boolean>(modalDialog !== undefined);

  useEffect(() => {
    // Clear state text to prevent modal appearing on refresh
    navigate(location, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <>
      <Card
        width="500px"
        height="500px"
        justifyContent="center"
      >
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
      <DialogModal
        text={modalDialog || ''}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
      />
    </>
  );
}
