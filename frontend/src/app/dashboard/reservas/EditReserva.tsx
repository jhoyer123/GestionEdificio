import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { createReserva, updateReserva } from "@/services/reservaServices";
import { type Reserva } from "./ColumnsRes";

interface ReservaFormProps {
  refresh?: () => void;
  data: Reserva;
  setOpenEdit: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function EditReserva({
  refresh,
  data,
  setOpenEdit,
}: ReservaFormProps) {
  const [fecha, setFecha] = useState(
    data.fecha ? data.fecha.split("T")[0] : ""
  );
  const [horaInicio, setHoraInicio] = useState(data.horaInicio);
  const [horaFin, setHoraFin] = useState(data.horaFin);
  const [motivo, setMotivo] = useState(data.motivo);
  const [numAsistentes, setNumAsistentes] = useState(
    data.asistentes.toString()
  );
  const [loading, setLoading] = useState(false);

  // vamos a sacar el id del localstorage
  const usuarioComoString = localStorage.getItem("user");
  const usuarioId = usuarioComoString ? JSON.parse(usuarioComoString).id : null;

  const calcularCosto = () => {
    if (!horaInicio || !horaFin) return 0;
    const inicio = parseInt(horaInicio.split(":")[0]);
    const fin = parseInt(horaFin.split(":")[0]);
    const horas = Math.max(fin - inicio, 0);
    return horas * (data.costoPorHora || 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!horaInicio || !horaFin || !motivo) {
      toast.error("Completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      const formatDateToYYYYMMDD = (d: Date) => d.toISOString().split("T")[0]; // "YYYY-MM-DD"
      const fechaDateObj = new Date(fecha);
      const reservaData = {
        usuarioId,
        areaComunId: data.idAreaComun,
        fechaReserva: formatDateToYYYYMMDD(fechaDateObj),
        horaInicio,
        horaFin,
        motivo,
        numAsistentes: Number(numAsistentes) || 1,
      };

      console.log(reservaData);
      console.log(data.idReserva);
      const response = await updateReserva(data.idReserva, reservaData);
      const message = response.message;
      setFecha(""); // o el valor inicial que quieras, ej: hoy
      setHoraInicio("");
      setHoraFin("");
      setMotivo("");
      setNumAsistentes("");
      toast.success(message, {
        duration: 4000,
        position: "top-left",
      });
      setOpenEdit(false);
      if (refresh) refresh();
    } catch (error: any) {
      toast.error(error.response.data.message || "Error al crear la reserva");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CardHeader>
        {/* Aqui colocar fatos como el nombre del area */}
        <h4>Area: {data.areaNombre}</h4>
        <h4>Costo: {data.costoPorHora} Bs/hora</h4>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Fecha</Label>
            <Input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Hora inicio</Label>
              <Input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
              />
            </div>
            <div>
              <Label>Hora fin</Label>
              <Input
                type="time"
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Motivo</Label>
            <Input
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej. Fiesta, Reunión..."
            />
          </div>

          <div>
            <Label>Número de asistentes</Label>
            <Input
              type="number"
              min={1}
              value={numAsistentes}
              onChange={(e) => setNumAsistentes(e.target.value)}
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </div>

          <div className="flex justify-between items-center bg-muted p-3 rounded-md">
            <p className="font-semibold">Costo estimado:</p>
            <p className="text-lg font-bold text-primary">
              {calcularCosto().toFixed(2)} Bs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              type="button"
              className="w-full cursor-pointer bg-red-500"
              onClick={() => setOpenEdit(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={loading}
            >
              {loading ? "Reservando..." : "Confirmar Reserva"}
            </Button>
          </div>
        </form>
      </CardContent>
    </>
  );
}
