/* eslint-disable no-param-reassign */
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import useAppService from '@/services/app/useAppService';
import { AppTitle, Dropdown, PageTitle } from '@/components/common';
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
import { Column } from '@/views/FieldList/fieldList.styles';
import StyledContent from '../LandingPage/landingPage.styles';
import defaultNMPFile from '@/constants/DefaultNMPFile';
import defaultNMPFileYear from '@/constants/DefaultNMPFileYear';
import ViewCard from '@/components/common/ViewCard/ViewCard';
import { FARM_INFORMATION, MANURE_IMPORTS } from '@/constants/RouteConstants';
import ProgressStepper from '@/components/common/ProgressStepper/ProgressStepper';

export default function AddAnimals() {
  const { state, setNMPFile, setProgressStep } = useAppService();
  const navigate = useNavigate();
  const apiCache = useContext(APICacheContext);
  const [animalOptions, setAnimalOptions] = useState<{ value: number; label: string }[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(null);
  const [nextDisabled, setNextDisabled] = useState(false);
  const [isAllSelected, setIsAllSelected] = useState(false);

  const [formData, setFormData] = useState<(AnimalData | null)[]>([]);
  const [elems, setElems] = useState<(React.ReactNode | null)[]>([]);
  const [formComplete, setFormComplete] = useState<(boolean | null)[]>([]);
  const [formExpanded, setFormExpanded] = useState<(boolean | null)[]>([]);

  const handleSave = useCallback(
    (data: AnimalData, index: number) => {
      setFormData((prev) => {
        prev[index] = data;
        // Save this data up the chain, to the parent
        return prev;
      });
    },
    [setFormData],
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
    setFormComplete((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setFormExpanded((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  const handleSelectAll = () => {
    const newIsAllSelected = !isAllSelected;
    setIsAllSelected(newIsAllSelected);
    // setSelectedRows(new Array(elems.length).fill(newIsAllSelected));
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
      nmpFile.years.push({ ...defaultNMPFileYear });
    }
    let data = nmpFile.years[0].FarmAnimals;
    if (data === undefined || data.length === 0) {
      data = (nmpFile.farmDetails.FarmAnimals || []).map((id) => ({ id })) as AnimalData[];
    }

    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

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
            updateIsComplete={setFormComplete}
            updateIsExpanded={setFormExpanded}
            myIndex={index}
            date={currentDate}
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
            updateIsComplete={setFormComplete}
            updateIsExpanded={setFormExpanded}
            myIndex={index}
            date={currentDate}
          />
        );
      }
      throw new Error('Unexpected animal id.');
    });

    setFormData(data);
    setElems(dataElems);
    // Default to open and incomplete to disable the buttons
    setFormComplete(Array(data.length).fill(false));
    setFormExpanded(Array(data.length).fill(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = (animalId: string) => {
    // Right now we only handle cattle
    if (animalId !== '1' && animalId !== '2') return;

    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const { length } = formData;
    setFormData((prev) => {
      prev.push({ id: animalId, date: currentDate });
      return prev;
    });
    setElems((prev) => {
      const next = [...prev];
      if (animalId === '1') {
        next.push(
          <BeefCattle
            key={`${length}`}
            startData={{ id: animalId }}
            saveData={handleSave}
            onDelete={handleDelete}
            updateIsComplete={setFormComplete}
            updateIsExpanded={setFormExpanded}
            myIndex={length}
            date={currentDate}
          />,
        );
      } else if (animalId === '2') {
        next.push(
          <DairyCattle
            key={`${length}`}
            startData={{ id: animalId }}
            saveData={handleSave}
            onDelete={handleDelete}
            updateIsComplete={setFormComplete}
            updateIsExpanded={setFormExpanded}
            myIndex={length}
            date={currentDate}
          />,
        );
      }

      return next;
    });
    // Default to open and incomplete to disable the buttons
    setFormComplete((prev) => prev.concat(false));
    setFormExpanded((prev) => prev.concat(true));
  };

  const handlePrevious = () => {
    navigate(FARM_INFORMATION);
  };

  const handleNext = () => {
    if (!state.nmpFile) {
      throw new Error('NMP file has entered impossible state in AnimalsAndManure.');
    }

    const nmpFile: NMPFile = JSON.parse(state.nmpFile);
    // TODO: Add multi-year handling
    nmpFile.years[0].FarmAnimals = formData.filter((f) => f !== null);
    // TODO: Copy the data of the other tabs
    setNMPFile(JSON.stringify(nmpFile));

    navigate(MANURE_IMPORTS);
  };

  useEffect(() => {
    if (formComplete.length === 0) {
      setNextDisabled(true);
    } else {
      setNextDisabled(formComplete.some((bool) => bool === false));
    }
  }, [formComplete, setNextDisabled]);

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

  useEffect(() => {
    setProgressStep(2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StyledContent>
      <ProgressStepper step={FARM_INFORMATION} />
      <AppTitle />
      <PageTitle title="Livestock Information" />
      <ViewCard
        heading="Add Animals"
        height="500px"
        width="700px"
        handlePrevious={handlePrevious}
        handleNext={handleNext}
        nextDisabled={nextDisabled}
      >
        <div style={{ overflow: 'auto', minHeight: '400px' }}>
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
              disabled={selectedAnimal === null || formExpanded.some((bool) => bool === true)}
              aria-label="Add"
            >
              <FontAwesomeIcon icon={faPlus} />
            </AddButton>
          </FlexContainer>
          <Header>
            <Column>Animal Type</Column>
            <Column>Annual Manure</Column>
            <Column>Date</Column>
            <Column>Actions</Column>
          </Header>
          {elems}
        </div>
      </ViewCard>
    </StyledContent>
  );
}
