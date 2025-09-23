import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createReserva } from "@/services/reservaServices";
import { type AreaComun } from "@/services/areasServices";
import { type Reserva } from "@/services/reservaServices";
import type { EditState } from "@/components/shared/MainContent";

interface ReservaFormProps {
  setState: React.Dispatch<React.SetStateAction<EditState>>;
  refresh?: () => void;
  area: AreaComun;
  fechaInicial: string; // 👉 ahora es string YYYY-MM-DD
  reservas: Reserva[];
  areaComunId: number | null;
}

export default function ReservaForm({
  area,
  fechaInicial,
  reservas,
  areaComunId,
  refresh,
  setState,
}: ReservaFormProps) {
  const [fecha, setFecha] = useState(fechaInicial);
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [motivo, setMotivo] = useState("");
  const [numAsistentes, setNumAsistentes] = useState("");
  const [loading, setLoading] = useState(false);

  // vamos a sacar el id del localstorage
  const usuarioComoString = localStorage.getItem("user");
  const usuarioId = usuarioComoString ? JSON.parse(usuarioComoString).id : null;

  const calcularCosto = () => {
    if (!horaInicio || !horaFin) return 0;
    const inicio = parseInt(horaInicio.split(":")[0]);
    const fin = parseInt(horaFin.split(":")[0]);
    const horas = Math.max(fin - inicio, 0);
    return horas * (area.costoPorHora || 0);
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
        areaComunId,
        fechaReserva: formatDateToYYYYMMDD(fechaDateObj),
        horaInicio,
        horaFin,
        motivo,
        numAsistentes: Number(numAsistentes) || 1,
      };

      console.log(reservaData);
      await createReserva(reservaData);
      setFecha(""); // o el valor inicial que quieras, ej: hoy
      setHoraInicio("");
      setHoraFin("");
      setMotivo("");
      setNumAsistentes("");
      toast.success("Reserva creada correctamente ✅");
      if (refresh) refresh();
    } catch (error: any) {
      toast.error(error.response.data.message || "Error al crear la reserva");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Reservar {area.nombreAreaComun}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Horario disponible: {area.horarioInicio} - {area.horarioFin}
          </p>
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Reservando..." : "Confirmar Reserva"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
