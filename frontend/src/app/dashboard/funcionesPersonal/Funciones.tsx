import React, { useState, useEffect } from "react";
// Asegúrate de que FuncionCard ya usa clases de Tailwind
import FuncionCard from "./FuncionCard";
import { getFunciones } from "@/services/funcionServices";

// src/tipos/Funcion.ts o dentro del mismo componente
export interface IFuncion {
  idFuncion: number;
  cargo: string;
  descripcion: string;
  salario: number;
}

import FuncionesFormDialog from "./FuncionesFormDialog";
import { Button } from "@/components/ui/button";

const Funciones: React.FC = () => {
  const [funciones, setFunciones] = useState<IFuncion[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [openCreate, setOpenCreate] = useState(false);

  const fetchFunciones = async () => {
    const funcionesData = await getFunciones();
    setFunciones(funcionesData);
    setCargando(false);
  };

  useEffect(() => {
    fetchFunciones();
  }, [funciones]);

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-48 text-white p-6 rounded-lg shadow-md">
        <svg
          className="animate-spin h-5 w-5 mr-3 text-blue-400"
          viewBox="0 0 24 24"
        >
          {/* Ícono simple de spinner para simular la carga */}
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Cargando funciones...
      </div>
    );
  }

  if (funciones.length === 0) {
    return (
      <div className="flex justify-center items-center h-48 bg-slate-800 text-yellow-400 border border-yellow-500 p-6 rounded-lg shadow-md">
        No se encontraron funciones para mostrar.
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen text-black dark:text-white">
      {/* Título principal */}
      <div className="flex items-center justify-between mb-6 border-b border-slate-700 pb-3">
        <h2 className="text-3xl font-bold">Funciones del Personal</h2>
        <div>
          <Button
            className="rounded-md bg-amber-300 text-black hover:bg-amber-400 cursor-pointer"
            onClick={() => setOpenCreate(true)}
          >
            Crear función
          </Button>
        </div>
      </div>

      {/* Cuadrícula de Tarjetas */}
      <div
        className="grid gap-6 
                    sm:grid-cols-1   /* 1 columna en móvil */
                    md:grid-cols-2   /* 2 columnas en tablet */
                    lg:grid-cols-3   /* 3 columnas en escritorio */
                    xl:grid-cols-4   /* 4 columnas en pantallas grandes */
                    "
      >
        {funciones.map((funcion) => (
          <FuncionCard key={funcion.idFuncion} funcion={funcion} />
        ))}
      </div>

      <FuncionesFormDialog
        open={openCreate}
        setOpen={setOpenCreate}
        mode="create"
        onSuccess={() => {
          fetchFunciones();
        }}
      />
    </div>
  );
};

export default Funciones;
