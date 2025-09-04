import { useContext, useEffect, useState } from 'react';
import useAppState from '@/hooks/useAppState';
import ApplicationReportSection from './ApplicationReportSection';
import FieldDataSection from './FieldDetailSection';
import ManureCompostInventory from './ManureCompostInventory';
import ManureCompostUse from './ManureCompostUse';
import ManureCompostAnalysis from './ManureCompostAnalysis';
import { APICacheContext } from '@/context/APICacheContext';
import { ManureType, Region, SelectOption, Subregion } from '@/types';
import LiquidStorageCapacitySection from './LiquidStorageCapacitySection';
import { FieldContainer, FieldInfoItem, FieldInfoSection } from '../reporting.styles';

export default function CompleteReportTemplate() {
  const { nmpFile } = useAppState().state;
  const { farmDetails, years } = nmpFile;
  const { farmName, farmRegion, farmSubregion } = farmDetails;

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
    apiCache.callEndpoint(`api/subregions/${farmRegion}/`).then((response) => {
      const { data } = response;
      const subregions: SelectOption<Subregion>[] = (data as Subregion[]).map((row) => ({
        id: row.id.toString(),
        label: row.name,
        value: row,
      }));

      setSubregionOptions(subregions);
    });
  }, [apiCache, farmRegion]);

  return (
    <div style={{ width: '744px' }}>
      <FieldContainer>
        <FieldInfoSection>
          <FieldInfoItem>
            <span
              style={{
                fontWeight: 'bold',
                textDecoration: 'underline',
                fontSize: '32px',
                marginBottom: '8px',
              }}
            >
              NMP Farm Report
            </span>
          </FieldInfoItem>
          <FieldInfoItem>
            <span>
              <strong>Farm name:</strong> {farmName}
            </span>
          </FieldInfoItem>
          <FieldInfoItem>
            <span>
              <strong>Farm region:</strong>{' '}
              {regionOptions.find((ele) => ele.id === farmRegion?.toString())?.label ?? farmRegion}
            </span>
          </FieldInfoItem>
          <FieldInfoItem>
            <span>
              <strong>Farm subregion:</strong>{' '}
              {subregionOptions.find((ele) => ele.id === farmSubregion?.toString())?.label ??
                farmSubregion}
            </span>
          </FieldInfoItem>
        </FieldInfoSection>
      </FieldContainer>
      <div style={{ fontWeight: 'bold', marginTop: '32px' }}>Application Schedule</div>
      {years.map((yearEle) =>
        yearEle.fields?.map((fieldEle) => (
          <ApplicationReportSection
            field={fieldEle}
            year={yearEle.year}
            key={fieldEle.fieldName}
          />
        )),
      )}
      <div style={{ fontWeight: 'bold', marginTop: '64px', marginBottom: '8px' }}>
        Manure / Compost Inventory
      </div>
      {years[0] && (
        <ManureCompostInventory
          FarmAnimals={years[0].farmAnimals}
          GeneratedManures={years[0].generatedManures}
          ImportedManures={years[0].importedManures}
          ManureStorageSystems={years[0].manureStorageSystems}
        />
      )}
      <div style={{ fontWeight: 'bold', marginTop: '64px', marginBottom: '8px' }}>
        Manure and Compost Use
      </div>
      {years[0] && (
        <ManureCompostUse
          ManureStorageSystems={years[0].manureStorageSystems}
          NutrientAnalysisData={years[0].nutrientAnalyses}
          GeneratedManures={years[0].generatedManures}
          ImportedManures={years[0].importedManures}
        />
      )}

      <div style={{ fontWeight: 'bold', marginTop: '64px' }}>
        Liquid Storage Capacity: October to March
      </div>
      {years[0] &&
        years[0].manureStorageSystems &&
        years[0].manureStorageSystems.length > 0 &&
        years[0].manureStorageSystems
          .filter((storeEle) => storeEle.manureType === ManureType.Liquid)
          .map((storeEle) => (
            <LiquidStorageCapacitySection
              key={storeEle.name}
              storageSystemLiquid={storeEle}
            />
          ))}

      <div style={{ marginTop: '64px' }}>
        {years.map((yearEle) =>
          yearEle.fields?.map((fieldEle) => (
            <FieldDataSection
              field={fieldEle}
              year={yearEle.year}
              key={fieldEle.fieldName}
            />
          )),
        )}
      </div>
      {years[0].nutrientAnalyses.length > 0 && (
        <div>
          <div style={{ fontWeight: 'bold', marginTop: '64px' }}>Manure and Compost Analysis</div>
          <ManureCompostAnalysis nutrientAnalyses={years[0].nutrientAnalyses} />
        </div>
      )}
    </div>
  );
}
