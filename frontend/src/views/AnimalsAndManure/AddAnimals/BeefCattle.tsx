import { useContext, useEffect } from 'react';
import { Dropdown, InputField } from '@/components/common';
import { APICacheContext } from '@/context/APICacheContext';

export default function BeefCattle() {
  const apiCache = useContext(APICacheContext);
  useEffect(() => {
    apiCache.callEndpoint('api/animal_subtypes/1/').then((response) => {
      
    });
  }, []);
  return (
    <div>
      <Dropdown
        label="Cattle Type"
        name="animalSubtype"
      />
      <InputField
        label="Yield"
        type="text"
        name="yield"
        value={combinedCropsData.yield?.toString() || ''}
        onChange={handleChange}
      />
    </div>
  );
}
