import { useContext, useEffect, useState } from 'react';
import useAppState from '@/hooks/useAppState';
import ApplicationReportSection from './ApplicationReportSection';
import FieldDataSection from './FieldDetailSection';
import ManureCompostInventory from './ManureCompostInventory';
import ManureCompostUse from './ManureCompostUse';
import ManureCompostAnalysis from './ManureCompostAnalysis';
import { APICacheContext } from '@/context/APICacheContext';
import { Region, SelectOption, Subregion } from '@/types';
import LiquidStorageCapacitySection from './LiquidStorageCapacitySection';

export default function CompleteReportTemplate() {
  const { nmpFile } = useAppState().state;
  const { farmDetails, years } = nmpFile;
  const { FarmName, FarmRegion, FarmSubRegion } = farmDetails;

  const [regionOptions, setRegionOptions] = useState<SelectOption<Region>[]>([]);
  const [subregionOptions, setSubregionOptions] = useState<SelectOption<Subregion>[]>([]);

  const apiCache = useContext(APICacheContext);

  useEffect(() => {
    apiCache.callEndpoint('api/regions/').then((response) => {
      const { data } = response;
      const regions: SelectOption<Region>[] = (data as Region[]).map((row) => ({
        id: row.id.toString(),
        label: row.name,
        value: row,
      }));
      setRegionOptions(regions);
    });
    apiCache.callEndpoint(`api/subregions/${FarmRegion}/`).then((response) => {
      const { data } = response;
      const subregions: SelectOption<Subregion>[] = (data as Subregion[]).map((row) => ({
        id: row.id.toString(),
        label: row.name,
        value: row,
      }));

      setSubregionOptions(subregions);
    });
  }, [apiCache, FarmRegion]);

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
          Farm Region: {regionOptions.find((ele) => ele.id === FarmRegion)?.label ?? FarmRegion}
        </span>
      </div>
      <div>
        <span>
          Farm Sub Region:{' '}
          {subregionOptions.find((ele) => ele.id === FarmSubRegion)?.label ?? FarmSubRegion}
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
          FarmAnimals={years[0].FarmAnimals}
          GeneratedManures={years[0].GeneratedManures}
          ImportedManures={years[0].ImportedManures}
          ManureStorageSystems={years[0].ManureStorageSystems}
        />
      )}
      <div style={{ fontWeight: 'bold', marginTop: '64px' }}>Manure and Compost Use</div>
      {years[0] && <ManureCompostUse ManureStorageSystems={years[0].ManureStorageSystems} />}

      <div style={{ fontWeight: 'bold', marginTop: '64px' }}>
        Liquid Storage Capacity: October to March
      </div>
      {years[0] && (
        <LiquidStorageCapacitySection ManureStorageSystems={years[0].ManureStorageSystems} />
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
      {years[0].NutrientAnalyses.length > 0 && (
        <div>
          <div style={{ fontWeight: 'bold', marginTop: '64px' }}>Manure and Compost Analysis</div>
          <ManureCompostAnalysis nutrientAnalyses={years[0].NutrientAnalyses} />
        </div>
      )}
    </div>
  );
}
