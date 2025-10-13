import { useEffect, useState } from "react";
import { type AreaComun } from "@/services/areasServices";
import { getAreaById } from "@/services/areasServices";
import { Skeleton } from "@/components/ui/skeleton";
import ReservaForm from "./ReservaForm";
import { Input } from "@/components/ui/input";
import type { EditState } from "@/components/shared/MainContent";
import { Button } from "@/components/ui/button";
import { getCajas } from "@/services/parqueoCajasServices";

export interface ReservaPersonalizada {
  idReserva: number;
  fechaInicio: string;
  fechaFin: string;
  horaInicio: string | null;
  horaFin: string | null;
  numAsistentes: number;
  estado: string;
  cajaId?: number | null;
  esPorHoras: boolean;
  esPorDias: boolean;
}

// NUEVA FUNCIÓN HELPER: Formatea la hora para quitar los segundos (ej: "14:00:00" -> "14:00")
const formatTime = (timeString: string | null) => {
  if (!timeString) return "";
  const [hours, minutes] = timeString.split(":");
  return `${hours}:${minutes}`;
};

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
  const [todasReservas, setTodasReservas] = useState<ReservaPersonalizada[]>(
    []
  );
  const [reservas, setReservas] = useState<ReservaPersonalizada[]>([]);
  const [loading, setLoading] = useState(true);
  const [cajones, setCajones] = useState<any[]>([]);

  const fetch = async () => {
    if (!id) return;
    try {
      const areaResponse = await getAreaById(id);

      const reservasTransformadas: ReservaPersonalizada[] =
        areaResponse.reservas.map((r: any) => ({
          idReserva: r.idReserva,
          fechaInicio: r.fechaReserva,
          fechaFin: r.fechaFinReserva || r.fechaReserva,
          horaInicio: r.horaInicio,
          horaFin: r.horaFin,
          numAsistentes: r.numAsistentes,
          estado: r.estado,
          cajaId: r.cajaId || null,
          esPorHoras: !!r.horaInicio && !!r.horaFin,
          esPorDias: !!r.fechaFinReserva,
        }));

      setArea(areaResponse);
      setTodasReservas(reservasTransformadas);

      if (areaResponse.tipoArea === "parqueo") {
        const cajonesData = await getCajas();
        setCajones(cajonesData);
      }
    } catch (error) {
      console.error("Error fetching área:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  useEffect(() => {
    const filtradas = todasReservas.filter(
      (r) => fecha >= r.fechaInicio && fecha <= r.fechaFin
    );
    setReservas(filtradas);
  }, [fecha, todasReservas]);

  if (loading) return <Skeleton className="h-64 w-full" />;

  const API_URL = import.meta.env.VITE_API_URL;
  const esGimnasio = area?.tipoArea === "gimnasio";
  const esParqueo = area?.tipoArea === "parqueo";

  // --- LÓGICA DE VISUALIZACIÓN DE BLOQUES REEMPLAZADA ---

  // Lógica para Salones: Muestra bloques dinámicos de tiempo libre y ocupado
  const generarLineaDeTiempo = () => {
    if (!area || esParqueo || esGimnasio) return [];

    const bloques: {
      inicio: string;
      fin: string;
      estado: "libre" | "ocupado";
    }[] = [];
    const reservasDelDia = reservas
      .filter((r) => r.esPorHoras && r.horaInicio && r.horaFin)
      .sort((a, b) => a.horaInicio!.localeCompare(b.horaInicio!));

    let cursorTiempo = area.horarioApertura;

    if (reservas.some((r) => r.esPorDias)) {
      return [
        {
          inicio: area.horarioApertura,
          fin: area.horarioCierre,
          estado: "ocupado",
        },
      ];
    }

    reservasDelDia.forEach((reserva) => {
      if (reserva.horaInicio! > cursorTiempo) {
        bloques.push({
          inicio: cursorTiempo,
          fin: reserva.horaInicio!,
          estado: "libre",
        });
      }
      bloques.push({
        inicio: reserva.horaInicio!,
        fin: reserva.horaFin!,
        estado: "ocupado",
      });
      cursorTiempo = reserva.horaFin!;
    });

    if (cursorTiempo < area.horarioCierre) {
      bloques.push({
        inicio: cursorTiempo,
        fin: area.horarioCierre,
        estado: "libre",
      });
    }

    if (bloques.length === 0 && area.horarioApertura) {
      bloques.push({
        inicio: area.horarioApertura,
        fin: area.horarioCierre,
        estado: "libre",
      });
    }

    return bloques;
  };

  /* // Lógica para Gimnasio: Mantiene los bloques de 1 hora pero calcula la ocupación
  const generarBloquesGimnasio = () => {
    if (!area || !esGimnasio) return [];
    const bloques: { hora: string; ocupacion: number }[] = [];
    const abrir = parseInt(area.horarioApertura.split(":")[0]);
    const cerrar = parseInt(area.horarioCierre.split(":")[0]);

    for (let h = abrir; h < cerrar; h++) {
      const bloqueInicio = `${String(h).padStart(2, "0")}:00`;
      const bloqueFin = `${String(h + 1).padStart(2, "0")}:00`;
      let ocupacion = 0;
      reservas.forEach((r) => {
        if (
          r.horaInicio &&
          r.horaFin &&
          r.horaInicio < bloqueFin &&
          r.horaFin > bloqueInicio
        ) {
          ocupacion += r.numAsistentes;
        }
      });
      bloques.push({ hora: `${bloqueInicio} - ${bloqueFin}`, ocupacion });
    }
    return bloques;
  };

   */

  const toMinutes = (h: string) => {
    const [hh, mm] = h.split(":").map(Number);
    return hh * 60 + mm;
  };

  const generarBloquesGimnasio = () => {
    if (!area || !esGimnasio) return [];
    const bloques: { hora: string; ocupacion: number }[] = [];
    const abrir = parseInt(area.horarioApertura.split(":")[0]);
    const cerrar = parseInt(area.horarioCierre.split(":")[0]);

    for (let h = abrir; h < cerrar; h++) {
      const bloqueInicio = `${String(h).padStart(2, "0")}:00`;
      const bloqueFin = `${String(h + 1).padStart(2, "0")}:00`;
      let ocupacion = 0;

      reservas.forEach((r) => {
        if (!r.horaInicio || !r.horaFin) return;

        const inicioReserva = toMinutes(r.horaInicio);
        const finReserva = toMinutes(r.horaFin);
        const inicioBloque = toMinutes(bloqueInicio);
        const finBloque = toMinutes(bloqueFin);

        // ✅ Comparación corregida: estrictamente menor y mayor
        if (inicioReserva < finBloque && finReserva > inicioBloque) {
          ocupacion += r.numAsistentes;
        }
      });

      bloques.push({ hora: `${bloqueInicio} - ${bloqueFin}`, ocupacion });
    }

    return bloques;
  };

  const bloquesDinamicos = esGimnasio
    ? generarBloquesGimnasio()
    : generarLineaDeTiempo();

  const getColorGimnasio = (ocupacion: number) => {
    if (!area) return "bg-green-200 text-black";
    const porcentaje = (ocupacion / area.capacidadMaxima) * 100;
    if (porcentaje >= 100) return "bg-red-500 text-white";
    if (porcentaje >= 60) return "bg-yellow-400 text-black";
    return "bg-green-200 text-black";
  };

  return (
    <>
      <div>
        <Button
          className="cursor-pointer"
          onClick={() =>
            setEditState({ view: "areasComunes", entity: "", id: null })
          }
        >
          Volver atrás
        </Button>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8 relative">
        {/* CABECERA */}
        <div className="flex flex-col md:flex-row gap-6">
          <img
            src={`${API_URL}/uploads/${area?.imageUrl}` || "/placeholder.png"}
            alt={area?.nombreAreaComun}
            className="w-full md:w-1/2 h-64 object-cover rounded-xl shadow"
          />
          <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold">{area?.nombreAreaComun}</h1>
            <p className="text-muted-foreground leading-relaxed">
              {area?.descripcion}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {esGimnasio && (
                <div>
                  <span className="font-semibold">Capacidad máxima:</span>{" "}
                  {area?.capacidadMaxima} personas
                </div>
              )}
              {esParqueo && (
                <div>
                  <span className="font-semibold">Cajones totales:</span>{" "}
                  {cajones.length}
                </div>
              )}
              {!esGimnasio && !esParqueo && (
                <div>
                  <span className="font-semibold">Costo por hora:</span>{" "}
                  {area?.costoBase} Bs
                </div>
              )}
              <div>
                <span className="font-semibold">Horario:</span>{" "}
                {esParqueo
                  ? "Disponible 24 horas"
                  : `${formatTime(area?.horarioApertura || "")} - ${formatTime(
                      area?.horarioCierre || ""
                    )}`}
              </div>
            </div>
          </div>
        </div>

        {/* DISPONIBILIDAD */}
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

          {esParqueo ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              {cajones.map((cajon) => {
                const reservasDelCajonHoy = reservas.filter(
                  (r) =>
                    r.cajaId === cajon.idParqueoCaja && r.estado !== "cancelada"
                );
                return (
                  <div
                    key={cajon.idParqueoCaja}
                    className="p-3 rounded-lg border bg-card shadow-sm space-y-2"
                  >
                    <p className="font-bold text-center text-lg">
                      Cajón {cajon.numeroCaja}
                    </p>
                    {reservasDelCajonHoy.length > 0 ? (
                      <div className="text-xs space-y-1">
                        <p className="font-semibold text-red-600">
                          Ocupado en los horarios:
                        </p>
                        {reservasDelCajonHoy.map((r) => (
                          <div
                            key={r.idReserva}
                            className="px-2 py-1 bg-red-100 rounded text-red-800"
                          >
                            {r.esPorDias ? (
                              <span>Todo el día</span>
                            ) : (
                              // MODIFICADO: Aplicamos el formateo de hora
                              <span>
                                {formatTime(r.horaInicio)} -{" "}
                                {formatTime(r.horaFin)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-center text-green-600 font-medium py-2 bg-green-100 rounded">
                        ✅ Libre todo el día
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            // REEMPLAZADO: Nueva lógica de renderizado para Salones y Gimnasio
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              {bloquesDinamicos.length === 0 ? (
                <p className="col-span-full text-center text-muted-foreground">
                  No hay horarios definidos para esta área.
                </p>
              ) : esGimnasio ? (
                (bloquesDinamicos as { hora: string; ocupacion: number }[]).map(
                  (b, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded text-center text-sm font-medium ${getColorGimnasio(
                        b.ocupacion
                      )}`}
                    >
                      <div className="font-bold">
                        {formatTime(b.hora.split(" - ")[0])} -{" "}
                        {formatTime(b.hora.split(" - ")[1])}
                      </div>
                      <div>
                        Ocupación: {b.ocupacion}/{area?.capacidadMaxima}
                      </div>
                    </div>
                  )
                )
              ) : (
                (
                  bloquesDinamicos as {
                    inicio: string;
                    fin: string;
                    estado: "libre" | "ocupado";
                  }[]
                ).map((b, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded text-center text-sm font-medium col-span-1 sm:col-span-2 ${
                      b.estado === "libre"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    <span className="font-bold block">
                      {b.estado === "libre" ? "✅ Disponible" : "❌ Ocupado"}
                    </span>
                    <span>
                      {formatTime(b.inicio)} - {formatTime(b.fin)}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* FORMULARIO DE RESERVA */}
        <ReservaForm
          area={area!}
          fechaInicial={fecha}
          areaComunId={idParams}
          setState={setEditState}
          refresh={fetch}
          cajones={cajones}
        />
      </div>
    </>
  );
}
