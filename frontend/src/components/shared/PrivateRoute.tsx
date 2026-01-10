import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  children: ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const userString = localStorage.getItem("user");
  const usuario = userString ? JSON.parse(userString) : null;
  if (!usuario) {
    return <Navigate to="/" replace />;
  }

  return children;
}
