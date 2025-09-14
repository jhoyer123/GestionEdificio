import Layout from "./app/Layout";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./app/pages/Login";
import RegisterPage from "./app/pages/Register";
import PrivateRoute from "./components/shared/PrivateRoute";
import { Toaster } from "@/components/ui/sonner";

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
      </Routes>
      <Toaster />
    </>
  );
};

export default App;
