import { useSSO } from '@bcgov/citz-imb-sso-react';
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

type ProtectedRouteProps = {
  requiredRole: string;
  children: ReactNode;
};

export default function ProtectedRoute({ requiredRole, children }: ProtectedRouteProps) {
  const { hasRoles } = useSSO();

  if (!hasRoles([requiredRole])) {
    return (
      <Navigate
        to="/"
        replace
        state={{ text: 'Sorry, only authorized users can access that page.' }}
      />
    );
  }
  return children;
}
