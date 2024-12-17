/**
 * @summary Router to different views
 */
import { Routes, Route } from 'react-router-dom';

import LandingPage from '../views/LandingPage/LandingPage';
import FarmInformation from '../views/FarmInformation/FarmInformation';
import AdminDashboard from '@/views/AdminDashboard/AdminDashboard';
import ProtectedRoute from './ProtectedRoute';

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
        path="/admin"
        element={
          <ProtectedRoute requiredRole="Admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
