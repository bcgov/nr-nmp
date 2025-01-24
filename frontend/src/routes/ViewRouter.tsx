/**
 * @summary Router to different views
 */
import { Routes, Route } from 'react-router-dom';

import LandingPage from '../views/LandingPage/LandingPage';
import FarmInformation from '../views/FarmInformation/FarmInformation';
import FieldAndSoil from '@/views/FieldAndSoil/FieldAndSoil';
import CalculateNutrients from '@/views/CalculateNutrients/CalculateNutrients';

export default function ViewRouter() {
  return (
    <Routes>
      <Route
        path="/"
        Component={LandingPage}
      />
      <Route
        path="/farm-information"
        Component={FarmInformation}
      />
      <Route
        path="/field-and-soil"
        Component={FieldAndSoil}
      />
      <Route
        path="/calculate-nutrients"
        Component={CalculateNutrients}
      />
    </Routes>
  );
}
