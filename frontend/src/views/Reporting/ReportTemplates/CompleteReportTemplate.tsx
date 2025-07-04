import { useContext, useEffect, useState } from 'react';
import useAppState from '@/hooks/useAppState';
import ApplicationReportSection from './ApplicationReportSection';
import FieldDataSection from './FieldDetailSection';
import ManureCompostInventory from './ManureCompostInventory';
import ManureCompostUse from './ManureCompostUse';
import ManureCompostAnalysis from './ManureCompostAnalysis';
import { APICacheContext } from '@/context/APICacheContext';
import { SelectOption } from '@/types';

export default function CompleteReportTemplate() {
  const { nmpFile } = useAppState().state;
  const { farmDetails, years } = nmpFile;
  const { FarmName, FarmRegion, FarmSubRegion } = farmDetails;

  const [regionOptions, setRegionOptions] = useState<Array<SelectOption>>([]);
  const [subregionOptions, setSubregionOptions] = useState<Array<SelectOption>>([]);

  const apiCache = useContext(APICacheContext);

  useEffect(() => {
    apiCache.callEndpoint('api/regions/').then((response) => {
      const { data } = response;
      const regions = (data as { id: number; name: string }[]).map((row) => ({
        id: row?.id.toString(),
        label: row.name,
      }));
      setRegionOptions(regions as Array<SelectOption>);
    });
    apiCache.callEndpoint(`api/subregions/${FarmRegion}/`).then((response) => {
      const { data } = response;
      const subregions = (data as { id: number; name: string }[]).map((row) => ({
        id: row?.id.toString(),
        label: row.name,
      }));

      setSubregionOptions(subregions as Array<SelectOption>);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [FarmRegion, FarmSubRegion]);

  return (
    <div style={{ width: '744px' }}>
      <div style={{ fontSize: '32px', marginBottom: '8px', fontWeight: 'bold' }}>
        NMP Farm Report
      </div>
      <div>
        <span>Farm name: {FarmName}</span>
      </div>
      <div>
        <span>
          Farm Region: {regionOptions?.find((ele) => ele.id === FarmRegion)?.label ?? FarmRegion}
        </span>
      </div>
      <div>
        <span>
          Farm Sub Region:{' '}
          {subregionOptions?.find((ele) => ele.id === FarmSubRegion)?.label ?? FarmSubRegion}
        </span>
      </div>
      <div style={{ fontWeight: 'bold', marginTop: '64px' }}>Application Schedule</div>
      {years.map((yearEle) =>
        yearEle.Fields?.map((fieldEle) => (
          <ApplicationReportSection
            field={fieldEle}
            year={yearEle.Year}
            key={fieldEle.FieldName}
          />
        )),
      )}
      <div style={{ fontWeight: 'bold', marginTop: '64px' }}>Manure/Compost Inventory</div>
      {years[0] && (
        <ManureCompostInventory
          GeneratedManures={years[0].GeneratedManures}
          ImportedManures={years[0].ImportedManures}
        />
      )}
      <div style={{ fontWeight: 'bold', marginTop: '64px' }}>Manure and Compost Use</div>
      {years[0] && (
        <ManureCompostUse
          GeneratedManures={years[0].GeneratedManures}
          ImportedManures={years[0].ImportedManures}
        />
      )}
      <div style={{ marginTop: '64px' }}>
        {years.map((yearEle) =>
          yearEle.Fields?.map((fieldEle) => (
            <FieldDataSection
              field={fieldEle}
              year={yearEle.Year}
              key={fieldEle.FieldName}
            />
          )),
        )}
      </div>
      {years[0].FarmManures && (
        <div>
          <div style={{ fontWeight: 'bold', marginTop: '64px' }}>Manure and Compost Analysis</div>
          <ManureCompostAnalysis farmManures={years[0].FarmManures} />
        </div>
      )}
    </div>
  );
}
