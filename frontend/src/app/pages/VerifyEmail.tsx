// src/pages/VerifyEmail.tsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get("token");
    console.log("Token recibido:", token);
    if (!token) {
      setStatus("error");
      setMessage("Token de verificación faltante.");
      return;
    }

    const verify = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/usuarios/verify-email?token=${token}`
        );
        setStatus("success");
        setMessage(res.data.message);
      } catch (err: any) {
        setStatus("error");
        setMessage(
          err.response?.data?.message || "Error verificando el correo."
        );
      }
    };

    verify();
  }, [location.search]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-xl p-6 sm:p-8 text-center">
        {status === "loading" && (
          <p className="text-gray-500 text-lg">Verificando tu correo...</p>
        )}
        {status === "success" && (
          <>
            <h2 className="text-2xl font-semibold text-green-600 mb-4">
              ¡Correo verificado!
            </h2>
            <p className="text-gray-700 mb-6">{message}</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              Ir a iniciar sesión
            </button>
          </>
        )}
        {status === "error" && (
          <>
            <h2 className="text-2xl font-semibold text-red-600 mb-4">Error</h2>
            <p className="text-gray-700 mb-6">{message}</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
            >
              Volver al login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

