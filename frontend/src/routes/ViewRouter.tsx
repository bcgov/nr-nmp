/**
 * @summary Router to different views
 */
import { Routes, Route } from 'react-router-dom';

import LandingPage from '../views/LandingPage/LandingPage';

export default function ViewRouter() {
  return (
    <Routes>
      <Route
        path="/"
        Component={LandingPage}
      />
    </Routes>
  );
}
