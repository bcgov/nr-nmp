/**
 * @summary Router to different views
 */
import { Routes, Route } from 'react-router-dom';
import {
  ADD_ANIMALS,
  CALCULATE_NUTRIENTS,
  CROPS,
  FARM_INFORMATION,
  FIELD_LIST,
  LANDING_PAGE,
  MANURE_IMPORTS,
  NUTRIENT_ANALYSIS,
  SOIL_TESTS,
  REPORTING,
  STORAGE,
} from '@/constants/routes';

import LandingPage from '@/views/LandingPage/LandingPage';
import FarmInformation from '@/views/FarmInformation/FarmInformation';
import CalculateNutrients from '@/views/CalculateNutrients/CalculateNutrients';
import ManureAndImports from '@/views/ManureAndImports/ManureAndImports';
import AddAnimals from '@/views/AddAnimals/AddAnimals';
import FieldList from '@/views/FieldList/FieldList';
import SoilTests from '@/views/SoilTests/SoilTests';
import Crops from '@/views/Crops/Crops';
import NutrientAnalysis from '@/views/NutrientAnalysis/NutrientAnalysis';
import Reporting from '@/views/Reporting/Reporting';
import Storage from '@/views/Storage/Storage';

export default function ViewRouter() {
  return (
    <Routes>
      <Route
        path={LANDING_PAGE}
        Component={LandingPage}
      />
      <Route
        path={FARM_INFORMATION}
        Component={FarmInformation}
      />
      <Route
        path={ADD_ANIMALS}
        Component={AddAnimals}
      />
      <Route
        path={FIELD_LIST}
        Component={FieldList}
      />
      <Route
        path={SOIL_TESTS}
        Component={SoilTests}
      />
      <Route
        path={CROPS}
        Component={Crops}
      />
      <Route
        path={MANURE_IMPORTS}
        Component={ManureAndImports}
      />
      <Route
        path={STORAGE}
        Component={Storage}
      />
      <Route
        path={NUTRIENT_ANALYSIS}
        Component={NutrientAnalysis}
      />
      <Route
        path={CALCULATE_NUTRIENTS}
        Component={CalculateNutrients}
      />
      <Route
        path={REPORTING}
        Component={Reporting}
      />
    </Routes>
  );
}
