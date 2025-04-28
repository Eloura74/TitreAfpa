import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

interface Props {
  children: ReactNode;
}

export default function RouteAdminOnly({ children }: Props) {
  const { user } = useUser();
  if (!user.isAuthenticated || !user.isAdmin) {
    return <Navigate to="/inscription" replace />;
  }
  return <>{children}</>;
}
