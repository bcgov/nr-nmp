/**
 * @summary Router to different views
 */
import { Routes, Route } from 'react-router-dom';
import {
  ANIMALS_MANURE,
  CALCULATE_NUTRIENTS,
  FARM_INFORMATION,
  FIELD_SOIL,
  LANDING_PAGE,
  MANURE_COMPOST,
} from '@/constants/RouteConstants';

import LandingPage from '../views/LandingPage/LandingPage';
import FarmInformation from '../views/FarmInformation/FarmInformation';
import FieldAndSoil from '@/views/FieldAndSoil/FieldAndSoil';
import AnimalsAndManure from '@/views/AnimalsAndManure/AnimalsAndManure';
import CalculateNutrients from '@/views/CalculateNutrients/CalculateNutrients';
import ManureAndCompost from '@/views/ManureAndCompost/ManureAndCompost';

export default function ViewRouter() {
  return (
    <Routes>
      <Route
        path={LANDING_PAGE}
        Component={LandingPage}
      />
      <Route
        path={`${FARM_INFORMATION}`}
        Component={FarmInformation}
      />
      <Route
        path={`${FIELD_SOIL}`}
        Component={FieldAndSoil}
      />
      <Route
        path={`${MANURE_COMPOST}`}
        Component={ManureAndCompost}
      />
      <Route
        path={`${CALCULATE_NUTRIENTS}`}
        Component={CalculateNutrients}
      />
      <Route
        path={`${ANIMALS_MANURE}`}
        Component={AnimalsAndManure}
      />
    </Routes>
  );
}
