// src/components/PrivateRoute.jsx

import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  children: ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const userString = localStorage.getItem("user");
  //console.log("Usuario  1 en PrivateRoute:", userString);
  const usuario = userString ? JSON.parse(userString) : null;
  //console.log("Usuario en PrivateRoute:", usuario);
  // Si no hay usuario, redirigimos al login
  if (!usuario) {
    return <Navigate to="/" replace />;
  }

  return children;
}