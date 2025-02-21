/* eslint-disable no-param-reassign */
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import useAppService from '@/services/app/useAppService';
import { Dropdown } from '@/components/common';
import { APICacheContext } from '@/context/APICacheContext';
import { AnimalData } from './types';
import NMPFile from '@/types/NMPFile';
import BeefCattle from './BeefCattle';
import {
  Header,
  FlexContainer,
  AddButton,
  MarginWrapperOne,
  MarginWrapperTwo,
} from './addAnimals.styles';
import { Column } from '@/views/FieldAndSoil/FieldList/fieldList.styles';
import defaultNMPFile from '@/constants/DefaultNMPFile';
import blankNMPFileYearData from '@/constants/BlankNMPFileYearData';
import DairyCattle from './DairyCattle/DairyCattle';

interface AddAnimalsProps {
  saveData: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function AddAnimals({ saveData }: AddAnimalsProps) {
  const { state } = useAppService();
  const apiCache = useContext(APICacheContext);
  const [animalOptions, setAnimalOptions] = useState<{ value: number; label: string }[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(null);

  const [formData, setFormData] = useState<(AnimalData | null)[]>([]);
  const [elems, setElems] = useState<(React.ReactNode | null)[]>([]);

  const handleSave = useCallback(
    (data: AnimalData, index: number) => {
      setFormData((prev) => {
        prev[index] = data;
        // Save this data up the chain, to the parent
        saveData((parentPrev) => {
          // This is the first tab, so the 0th index
          parentPrev[0] = prev.filter((d) => d !== null);
          return parentPrev;
        });
        return prev;
      });
    },
    [setFormData, saveData],
  );

  const handleDelete = (index: number) => {
    // Avoid array deletions by setting index to null
    setFormData((prev) => {
      prev[index] = null;
      return prev;
    });
    setElems((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  // Init data & elems on first render
  useEffect(() => {
    // Uncomment once we cache session state
    /*
    if (!state.nmpFile) {
      throw new Error('NMP file has entered bad state in AddAnimals. (can be caused by refresh)');
    }
    const nmpFile: NMPFile = JSON.parse(state.nmpFile);
    */
    let nmpFile: NMPFile;
    if (state.nmpFile) nmpFile = JSON.parse(state.nmpFile);
    else {
      nmpFile = { ...defaultNMPFile };
      nmpFile.years.push({ ...blankNMPFileYearData });
    }
    let data = nmpFile.years[0].FarmAnimals;
    if (data === undefined || data.length === 0) {
      data = (nmpFile.farmDetails.FarmAnimals || []).map((id) => ({ id }));
    }

    const dataElems = data.map((d, index) => {
      if (d === null) {
        return null;
      }
      if (d.id === '1') {
        return (
          <BeefCattle
            // eslint-disable-next-line react/no-array-index-key
            key={`${index}`}
            startData={d}
            startExpanded={index === 0}
            saveData={handleSave}
            onDelete={handleDelete}
            myIndex={index}
          />
        );
      }
      if (d.id === '2') {
        return (
          <DairyCattle
            // eslint-disable-next-line react/no-array-index-key
            key={`${index}`}
            startData={d}
            startExpanded={index === 0}
            saveData={handleSave}
            onDelete={handleDelete}
            myIndex={index}
          />
        );
      }
      throw new Error('Unexpected animal id.');
    });

    setFormData(data);
    setElems(dataElems);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = (animalId: string) => {
    // Right now we only handle cattle
    if (animalId !== '1' && animalId !== '2') return;

    setFormData((prev) => {
      prev.push({ id: animalId });
      return prev;
    });
    const { length } = formData;
    setElems((prev) => {
      const next = [...prev];
      if (animalId === '1') {
        next.push(
          <BeefCattle
            key={`${length}`}
            startData={{ id: animalId }}
            saveData={handleSave}
            onDelete={handleDelete}
            myIndex={length}
          />,
        );
      } else if (animalId === '2') {
        next.push(
          <DairyCattle
            key={`${length}`}
            startData={{ id: animalId }}
            saveData={handleSave}
            onDelete={handleDelete}
            myIndex={length}
          />,
        );
      }

      return next;
    });
  };

  useEffect(() => {
    apiCache.callEndpoint('api/animals/').then((response) => {
      if (response.status === 200) {
        const { data } = response;
        const animals: { value: number; label: string }[] = (data as { id: number; name: string }[])
          .map((row) => ({ value: row.id, label: row.name }))
          // Temp, remove non-cattle as an option
          .filter((opt) => opt.value === 1 || opt.value === 2);
        setAnimalOptions(animals);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div style={{ overflowY: 'scroll' }}>
        <Header>
          <Column>Animal Type</Column>
          <Column>Annual Manure Amount</Column>
          <Column align="right">Actions</Column>
        </Header>
        {elems}
      </div>
      <FlexContainer>
        <MarginWrapperOne>Add:</MarginWrapperOne>
        <MarginWrapperTwo>
          <Dropdown
            label=""
            name="Animals"
            value={selectedAnimal || ''}
            options={animalOptions}
            onChange={(e) => setSelectedAnimal(e.target.value)}
            flex="0.5"
          />
        </MarginWrapperTwo>
        <AddButton
          type="button"
          onClick={() => {
            handleAdd(selectedAnimal as string);
            setSelectedAnimal(null);
          }}
          disabled={selectedAnimal === null}
          aria-label="Add"
        >
          <FontAwesomeIcon icon={faPlus} />
        </AddButton>
      </FlexContainer>
    </div>
  );
}
