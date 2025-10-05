import Layout from "./app/Layout";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./app/pages/Login";
import RegisterPage from "./app/pages/Register";
import PrivateRoute from "./components/shared/PrivateRoute";
import { Toaster } from "@/components/ui/sonner";
import { VerifyEmail } from "./app/pages/VerifyEmail";
import { ResetPassword } from "./app/pages/ResetPassword";
import { ForgotPassword } from "./app/pages/ForgotPassword";
//import DetalleDepartamento from "./app/dashboard/departamento/DetalleDepartamento";

export const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Ruta protegida */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        />
        {/* <Route path="/dashboard" element={<Layout />} /> */}
        {/* <Route path="/DetalleDepartamento" element={<DetalleDepartamento />} /> */}
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
      <Toaster />
    </>
  );
};

export default App;
