import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { set } from "date-fns";
import { updateEstadoReserva } from "@/services/reservaServices";
import { toast } from "sonner";
import axios from "axios";

interface GestionEstadoRProps {
  // Aquí puedes definir las props que necesites, como la reserva actual y una función para actualizarla
  data?: any;
  setOpenEditEstado: React.Dispatch<React.SetStateAction<boolean>>;
  refresh?: () => void;
}

export default function GestionEstadoR({
  data,
  setOpenEditEstado,
  refresh,
}: GestionEstadoRProps) {
  // estados posibles: Pendiente | Confirmada | Rechazada | Cancelada
  const handleConfirmar = () => {
    handleChangeEstado("confirmada");
  };
  const handleRechazar = () => {
    handleChangeEstado("rechazada");
  };
  const handleCancelar = () => {
    handleChangeEstado("cancelada");
  };

  // Aquí puedes agregar la lógica para manejar los cambios de estado, como llamadas a una API
  const handleChangeEstado = async (nuevoEstado: string) => {
    try {
      // Lógica para actualizar el estado en la API
      const response = await updateEstadoReserva(data.idReserva, nuevoEstado);
      const message = response.message;
      toast.success(message, { duration: 4000, position: "top-right" });
      setOpenEditEstado(false);
      refresh?.();
    } catch (error) {
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message
          : "Error en el login",
        {
          duration: 4000,
          position: "bottom-left",
        }
      );
      console.log("Error del backend:", error);
    }
  };
  return (
    <>
      <CardContent className="flex flex-col gap-4">
        <p className="text-gray-700">
          Estado actual:{" "}
          <span
            className={
              data.estado === "pendiente"
                ? "text-yellow-600 font-semibold"
                : data.estado === "confirmada"
                ? "text-green-600 font-semibold"
                : "text-red-600 font-semibold"
            }
          >
            {data.estado}
          </span>
        </p>

        {/* Botones dinámicos según el estado */}
        {data.estado === "pendiente" && (
          <div className="flex gap-2">
            <Button
              onClick={() => setOpenEditEstado(false)}
              className="text-white flex-1"
            >
              Salir
            </Button>
            <Button
              onClick={handleConfirmar}
              className="bg-green-500 text-white flex-1"
            >
              Confirmar
            </Button>
            <Button
              onClick={handleRechazar}
              className="bg-red-500 text-white flex-1"
            >
              Rechazar
            </Button>
          </div>
        )}

        {data.estado === "confirmada" && (
          <div className="flex gap-2">
            <Button
              onClick={() => setOpenEditEstado(false)}
              className="text-white flex-1"
            >
              Salir
            </Button>
            <Button
              onClick={handleCancelar}
              className="bg-red-500 text-white flex-1"
            >
              Cancelar
            </Button>
          </div>
        )}

        {(data.estado === "rechazada" || data.estado === "cancelada") && (
          <p className="text-sm text-gray-500 italic">
            No se puede modificar este estado.
          </p>
        )}
      </CardContent>
    </>
  );
}
