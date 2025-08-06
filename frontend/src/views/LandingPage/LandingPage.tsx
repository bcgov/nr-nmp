/**
 * @summary The landing page for the application
 */
import { useNavigate } from 'react-router-dom';
import { Button, ButtonGroup } from '@bcgov/design-system-react-components';
import useAppState from '../../hooks/useAppState';
import { View } from '../../components/common';

export default function LandingPage() {
  const { dispatch } = useAppState();
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
        dispatch({ type: 'OVERWRITE_NMPFILE', newFile: JSON.parse(data as string) });
        navigate('/farm-information');
      }
    };
  };

  const newCalcHandler = () => {
    dispatch({ type: 'RESET_NMPFILE' });
    navigate('/farm-information');
  };

  return (
    <View title="Nutrient Management Calculator">
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
          variant="primary"
          isDisabled={false}
        >
          Get Started
        </Button>
        <Button
          size="medium"
          onPress={handleUpload}
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
    </View>
  );
}
