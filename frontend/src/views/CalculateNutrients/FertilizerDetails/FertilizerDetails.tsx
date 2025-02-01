/**
 * @summary The fertilizerdeatils modal on the calculate nutrients page
 */
import { useContext, useEffect, useState } from 'react';
import { Dropdown } from '../../../components/common';
import defaultNMPFile from '@/constants/DefaultNMPFile';
import { APICacheContext } from '@/context/APICacheContext';

export default function FertilizerDetails({ field, setFields }) {
  const apiCache = useContext(APICacheContext);
  const [nmpFile, setNmpFile] = useState(defaultNMPFile);
  //var for info we are asking user for on this form
  const [fertilizerForm, setFertilizerForm] = useState<{
    id: number;
    fertilizerTypeId: number;
    fertilizerName: string;
    applRate: number;
    applUnitId: string;
    applDate: string | null;
    applMethodId: string;
    customN: number | null;
    customP2o5: number | null;
    customK2o: number | null;
    fertN: number;
    fertP2o5: number;
    fertK2o: number;
    liquidDensity: number;
    liquidDensityUnitId: string;
  }>({
    id: 0,
    fertilizerTypeId: 0,
    fertilizerName: '',
    applRate: 0,
    applUnitId: '0',
    applDate: null,
    applMethodId: '',
    customN: null,
    customP2o5: null,
    customK2o: null,
    fertN: 0,
    fertP2o5: 0,
    fertK2o: 0,
    liquidDensity: 0,
    liquidDensityUnitId: '0',
  });
  
  const initialAgronomicBalance: AgronomicBalanceInterface = { N: 0, P: 0, K: 0 };

  // list of fertilizers and their nutrients based on fertilizer model
  const [fertilizerList, setFertilizerList] = useState<any[]>([]);

  // Fetch fertilizer data from the API
  useEffect(() => {
    apiCache.callEndpoint('api/fertilizers')
      .then((response: { status?: any; data: any }) => {
        if (response.status === 200) {
          setFertilizerList(response.data);
        }
      })
      .catch(error => {
        console.error("Error fetching fertilizers:", error);
      });
  }, [apiCache]);

  const handleChange = () => {
    console.log(fertilizerForm);

  // Fertilizer list filters if chosen type is solid or liquid
  const solidFertilizerOptions = fertilizerList.filter(f => (f.fertilizerTypeId.toString).includes('1') || f.fertilizerTypeId.includes('2'));
  const liquidFertilizerOptions = fertilizerList.filter(f => f.fertilizerTypeId.includes('3') || f.fertilizerTypeId.includes('4'));

  return (
    <div>
      <form>
        <Dropdown
          label="Fertilizer Type"
          name="Fertilizer Type"
          value={fertilizerForm.fertilizerTypeId}
          options={[
            { value: 0, label: 'Dry Fertilizer' },
            { value: 1, label: 'Dry Fertilizer (Custom)' },
            { value: 2, label: 'Liquid Fertilizer' },
            { value: 3, label: 'Liquid Fertilizer (Custom)' },
          ]}
          onChange={handleChange}
        />
        {/* Fertilizer dropdown based on type solid or liquid */}
        <Dropdown
          label="Fertilizer"
          name="fertilizerName"
          value={fertilizerForm.fertilizerName}
          options={fertilizerForm.fertilizerTypeId === 0 || fertilizerForm.fertilizerTypeId === 1 
            ? solidFertilizerOptions.map(f => ({ value: f.fertilizerId, label: f.fertilizerId })) 
            : liquidFertilizerOptions.map(f => ({ value: f.fertilizerId, label: f.fertilizerId }))}
          onChange={handleChange}
        />
        <Dropdown
          label="Application Unit"
          name="applUnitId"
          value={fertilizerForm.applUnitId}
          options={[
            { value: 0, label: 'lb/ac' },
            { value: 1, label: 'kg/ha' },
            { value: 2, label: 'L/ac' },
            { value: 3, label: 'US gallons/ac' },
          ]}
          onChange={handleChange}
        />
        {(fertilizerForm.fertilizerTypeId === 2 || fertilizerForm.fertilizerTypeId === 3) && (
          <div>
            <input
              type="number"
              name="liquidDensity"
              value={fertilizerForm.liquidDensity}
              onChange={handleChange}
              placeholder="Density"
            />
            <Dropdown
              label="Density Units"
              name="liquidDensityUnitId"
              value={fertilizerForm.liquidDensityUnitId}
              options={[
                { value: 0, label: 'kg/US Gallon' },
                { value: 1, label: 'kg/L' },
              ]}
              onChange={handleChange}
            />
          </div>
        )}
        <button
          type="submit"
          onClick={handleChange}
        >
          Submit
        </button>
      </form>
    </div>
};
