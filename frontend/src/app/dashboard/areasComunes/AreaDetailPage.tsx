import { useEffect, useState } from "react";
import { type AreaComun } from "@/services/areasServices";
import { getAreaById } from "@/services/areasServices";
import { Skeleton } from "@/components/ui/skeleton";
import ReservaForm from "./ReservaForm";
import { Input } from "@/components/ui/input";
import type { EditState } from "@/components/shared/MainContent";
import type { Reserva } from "@/services/reservaServices";
import { Button } from "@/components/ui/button";

const formatDateToYYYYMMDD = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

interface AreaDetailPageProps {
  setEditState: React.Dispatch<React.SetStateAction<EditState>>;
  idParams: number | null;
}

export default function AreaDetailPage({
  setEditState,
  idParams,
}: AreaDetailPageProps) {
  const id = idParams?.toString();
  const [area, setArea] = useState<AreaComun | null>(null);
  const [fecha, setFecha] = useState<string>(formatDateToYYYYMMDD(new Date()));
  const [todasReservas, setTodasReservas] = useState<Reserva[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    console.log("Fetching area with ID:", id);
    if (!id) return;
    try {
      const areaResponse = await getAreaById(id);
      setArea(areaResponse);
      setTodasReservas(areaResponse.reservas);
    } catch (error) {
      console.error("Error fetching area:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetch();
  }, []);

  useEffect(() => {
    const soloFecha = todasReservas.filter((r) => {
      const diaReserva = r.fechaReserva.toString().slice(0, 10);
      return diaReserva === fecha;
    });
    setReservas(soloFecha);
  }, [fecha, todasReservas]);

  if (loading) return <Skeleton className="h-64 w-full" />;

  return (
    <>
      <div>
        <Button className="cursor-pointer"
        onClick={() => setEditState({ view: "areasComunes ", entity: "", id:null })}>Volver</Button>
      </div>
      <div className="max-w-4xl mx-auto p-6 space-y-8 relative">
        {/* Botón arriba a la izquierda */}

        {/* ---------- ENCABEZADO ---------- */}
        <div className="flex flex-col md:flex-row gap-6">
          <img
            src={
              area?.imagenUrl ||
              "https://i.pinimg.com/736x/c8/c3/2a/c8c32a35a83c485a00079636e4335c80.jpg"
            }
            alt={area?.nombreAreaComun}
            className="w-full md:w-1/2 h-64 object-cover rounded-xl shadow"
          />
          <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold">{area?.nombreAreaComun}</h1>
            <p className="text-muted-foreground leading-relaxed">
              {area?.descripcion}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-semibold">Costo por hora:</span>{" "}
                {area?.costoPorHora} Bs
              </div>
              <div>
                <span className="font-semibold">Horario:</span>{" "}
                {area?.horarioInicio} – {area?.horarioFin}
              </div>
            </div>
          </div>
        </div>

        {/* ---------- DISPONIBILIDAD ---------- */}
        <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-center">Disponibilidad</h2>

          <div className="flex items-center gap-3 justify-center">
            <label className="text-sm font-medium">Selecciona una fecha:</label>
            <Input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-48"
            />
          </div>
          <h3 className="text-xl text-center bg-blend-color-burn">
            Reservaciones para esta fecha
          </h3>
          <div className="bg-muted/40 rounded-lg p-3">
            {reservas.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay reservas para esta fecha
              </p>
            ) : (
              <ul className="space-y-1 text-sm">
                {reservas.map((r) => (
                  <li
                    key={r.idReserva}
                    className="px-3 py-1 bg-background rounded-md border bg-red-200/50"
                  >
                    {r.horaInicio} – {r.horaFin}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ---------- FORMULARIO DE RESERVA ---------- */}
        <ReservaForm
          area={area!}
          fechaInicial={fecha}
          reservas={reservas}
          areaComunId={idParams}
          setState={setEditState}
          refresh={fetch}
        />
      </div>
    </>
  );
}
