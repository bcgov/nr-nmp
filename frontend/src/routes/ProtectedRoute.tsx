import { AuthContext, useSSO } from '@bcgov/citz-imb-sso-react';
import { ReactNode, useContext } from 'react';
import { Navigate } from 'react-router-dom';

type ProtectedRouteProps = {
  requiredRole: string;
  children: ReactNode;
};

export default function ProtectedRoute({ requiredRole, children }: ProtectedRouteProps) {
  const authContext = useContext(AuthContext);
  const { hasRoles, user } = useSSO();

  // Return early if the user data isn't available yet
  if (
    authContext.state.isStale ||
    (authContext.state.userInfo !== undefined && user === undefined)
  ) {
    return null;
  }

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
