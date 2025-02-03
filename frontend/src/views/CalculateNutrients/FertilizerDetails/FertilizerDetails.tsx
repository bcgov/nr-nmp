/**
 * @summary The fertilizerdeatils modal on the calculate nutrients page
 */
import { useContext, useEffect, useState } from 'react';
import { Dropdown } from '../../../components/common';
import handleChange from '@/utils/HandleChange';
import defaultNMPFile from '@/constants/DefaultNMPFile';
import { APICacheContext } from '@/context/APICacheContext';

export default function FertilizerDetails({ field, setFields }) {
  const apiCache = useContext(APICacheContext);
  // existing farm info
  const [nmpFile, setNmpFile] = useState(defaultNMPFile);

  // var for info we are asking user for on this form
  const [fertDetails, setFertDetails] = useState<{
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

  // list of fertilizers and their nutrients based on fertilizer model
  const [fertilizerList, setFertilizerList] = useState<any[]>([]);

  // Fetch fertilizer data from the API
  useEffect(() => {
    apiCache
      .callEndpoint('api/fertilizers/')
      .then((response) => {
        if (response.status === 200) {
          const fertArray: string[] = (
            response.data as { id: number; name: string; fertilizerTypeId: number }[]
          ).map((row) => row.name);
          setFertilizerList(fertArray);
        }
      })
      .catch((error) => {
        console.error('Error fetching fertilizers:', error);
      });
  }, [apiCache]);

  // Fertilizer list filters if chosen type is solid or liquid
  const solidFertilizerOptions = fertilizerList.filter(
    (f) => f.fertilizerTypeId === 1 || f.fertilizerTypeId === 2,
  );
  const liquidFertilizerOptions = fertilizerList.filter(
    (f) => f.fertilizerTypeId === 3 || f.fertilizerTypeId === 4,
  );

  return (
    <div>
      <form>
        <Dropdown
          label="Fertilizer Type"
          name="Fertilizer Type"
          value={fertDetails.fertilizerTypeId}
          options={[
            { value: 0, label: 'Dry Fertilizer' },
            { value: 1, label: 'Dry Fertilizer (Custom)' },
            { value: 2, label: 'Liquid Fertilizer' },
            { value: 3, label: 'Liquid Fertilizer (Custom)' },
          ]}
          onChange={(e) => handleChange(e, setFertDetails)}
        />
        {/* Fertilizer dropdown based on type solid or liquid */}
        <Dropdown
          label="Fertilizer"
          name="fertilizerName"
          value={fertDetails.fertilizerName}
          options={
            fertDetails.fertilizerTypeId === 0 || fertDetails.fertilizerTypeId === 1
              ? solidFertilizerOptions.map((f) => ({
                  value: f.fertilizerId,
                  label: f.fertilizerId,
                }))
              : liquidFertilizerOptions.map((f) => ({
                  value: f.fertilizerId,
                  label: f.fertilizerId,
                }))
          }
          onChange={(e) => handleChange(e, setFertDetails)}
        />
        <Dropdown
          label="Application Unit"
          name="applUnitId"
          value={fertDetails.applUnitId}
          options={[
            { value: 0, label: 'lb/ac' },
            { value: 1, label: 'kg/ha' },
            { value: 2, label: 'L/ac' },
            { value: 3, label: 'US gallons/ac' },
          ]}
          onChange={(e) => handleChange(e, setFertDetails)}
        />
        {/* if liquid add these inputs */}
        {(fertDetails.fertilizerTypeId === 2 || fertDetails.fertilizerTypeId === 3) && (
          <div>
            <input
              type="number"
              name="liquidDensity"
              value={fertDetails.liquidDensity}
              onChange={(e) => handleChange(e, setFertDetails)}
              placeholder="Density"
            />
            <Dropdown
              label="Density Units"
              name="liquidDensityUnitId"
              value={fertDetails.liquidDensityUnitId}
              options={[
                { value: 0, label: 'kg/US Gallon' },
                { value: 1, label: 'kg/L' },
              ]}
              onChange={(e) => handleChange(e, setFertDetails)}
            />
          </div>
        )}
        <button
          type="submit"
          onClick={(e) => console.log(e)}
        >
          Submit
        </button>
      </form>
    </div>
  );
}
