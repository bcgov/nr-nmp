import React, { useContext, useEffect } from 'react';
import useAppService from '@/services/app/useAppService';
import { Dropdown } from '@/components/common';
import { APICacheContext } from '@/context/APICacheContext';

interface AddAnimalsProps {
  setIsFormValid: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AddAnimals({ setIsFormValid }: AddAnimalsProps) {
  const { state, setNMPFile } = useAppService();
  const apiCache = useContext(APICacheContext);

  useEffect(() => {
    apiCache.callEndpoint('api/animals/').then((response) => {

    });
  }, []);

  const {formData, setFormData} = useState<{ [name: string]: any }>({});
  return (
    <div>
      <div>
      <div>Add Animal:</div>
      <Dropdown />
      </div>
    </div>
  );
}