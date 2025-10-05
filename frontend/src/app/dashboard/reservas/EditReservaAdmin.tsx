// Nuevo archivo: /components/reservas/EditarReservaPage.tsx
import { useEffect, useState } from "react";
import { type AreaComun } from "@/services/areasServices";
import { getAreaById } from "@/services/areasServices";
import { getReservaById, updateReserva } from "@/services/reservaServices";
import { getCajas } from "@/services/parqueoCajasServices";
import { Skeleton } from "@/components/ui/skeleton";
import FormEditarReserva from "./FormEditarReserva";
import { Input } from "@/components/ui/input";
import type { EditState } from "@/components/shared/MainContent";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Reserva } from "./ColumnsRes";
import type { ReservaPersonalizada } from "../areasComunes/AreaDetailPage";

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

interface EditarReservaPageProps {
  setEditState: React.Dispatch<React.SetStateAction<EditState>>;
  reservaId: number | null;
}

export default function EditarReservaAdmin({
  setEditState,
  reservaId,
}: EditarReservaPageProps) {
  const [reservaActual, setReservaActual] = useState<Reserva | null>(null);
  const [area, setArea] = useState<AreaComun | null>(null);
  const [fecha, setFecha] = useState<string>(formatDateToYYYYMMDD(new Date()));
  const [todasReservas, setTodasReservas] = useState<any[]>([]);
  const [reservas, setReservas] = useState<ReservaPersonalizada[]>([]);
  const [loading, setLoading] = useState(true);
  const [cajones, setCajones] = useState<any[]>([]);

  // OBTENER DATOS
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const reservaData = await getReservaById(reservaId || 0);
        setReservaActual(reservaData);
        if (reservaData?.fechaInicio) setFecha(reservaData.fechaInicio);

        const areaData = await getAreaById(reservaData.areaComunId);
        const otrasReservas = areaData.reservas.filter(
          (r: any) => r.idReserva !== reservaId
        );

        const reservasTransformadas: ReservaPersonalizada[] = otrasReservas.map(
          (r: any) => ({
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
          })
        );

        areaData.reservas = otrasReservas;
        setArea(areaData);
        setTodasReservas(reservasTransformadas);

        if (areaData.tipoArea === "parqueo") {
          const cajonesData = await getCajas();
          setCajones(cajonesData);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast.error("No se pudieron cargar los datos de la reserva.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [reservaId]);

  useEffect(() => {
    const filtradas = todasReservas.filter(
      (r) => fecha >= r.fechaInicio && fecha <= r.fechaFin
    );
    setReservas(filtradas);
  }, [fecha, todasReservas]);

  const esGimnasio = area?.tipoArea === "gimnasio";
  const esParqueo = area?.tipoArea === "parqueo";

  // helpers (pegar arriba en el mismo scope)
  const startOfDay = (d: Date) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };

  const isDateBefore = (yyyyMMdd: string, compare = new Date()) => {
    // yyyy-MM-dd -> comparo solo fecha (sin hora)
    const d = new Date(`${yyyyMMdd}T00:00:00`);
    return startOfDay(d).getTime() < startOfDay(compare).getTime();
  };

  const isSameDate = (yyyyMMdd: string, compare = new Date()) => {
    const d = new Date(`${yyyyMMdd}T00:00:00`);
    return startOfDay(d).getTime() === startOfDay(compare).getTime();
  };

  // --- CONDICIÓN DE EDICIÓN (REEMPLAZAR) ---
  const reservaEditable = (() => {
    if (!reservaActual) return false;

    const estado = (reservaActual.estado || "").toLowerCase();
    if (estado === "cancelada" || estado === "rechazada") return false;
    if ((reservaActual as any).pagado === true) return false;

    // Campos reales según tu JSON:
    const fechaInicio = (reservaActual as any).fechaReserva as string | null; // ej "2025-10-04"
    const fechaFin = (reservaActual as any).fechaFinReserva as string | null; // ej null o "2025-10-05"
    const horaFin = (reservaActual as any).horaFin as string | null; // ej "12:00:00" o null

    const now = new Date();

    // Si hay fechaFin (reserva por días o rango), priorizamos ella
    if (fechaFin) {
      // 1) si fechaFin < hoy -> no editable
      if (isDateBefore(fechaFin, now)) return false;

      // 2) si fechaFin === hoy -> chequear horaFin si existe
      if (isSameDate(fechaFin, now)) {
        if (horaFin) {
          const endIso = `${fechaFin}T${horaFin}`; // "2025-10-04T12:00:00"
          if (new Date(endIso).getTime() < now.getTime()) return false;
        }
      }

      // fechaFin > hoy -> editable
      return true;
    }

    // Si no hay fechaFin (reserva de un día)
    if (fechaInicio) {
      if (isDateBefore(fechaInicio, now)) return false; // fecha pasada -> no editable

      if (isSameDate(fechaInicio, now)) {
        // si es hoy, chequear horaFin (si existe)
        if (horaFin) {
          const endIso = `${fechaInicio}T${horaFin}`;
          if (new Date(endIso).getTime() < now.getTime()) return false;
        }
      }

      // fecha futura o hoy (y hora no pasada) -> editable
      return true;
    }

    // Si no hay información de fecha, por defecto permitir editar (o cambiar a false según preferencia)
    return true;
  })();

  // --- BLOQUES DE DISPONIBILIDAD ---
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

  const handleUpdate = async (formData: any) => {
    if (!reservaActual) return;
    try {
      console.log(formData);
      /* const response = await updateReserva(reservaActual.idReserva, formData);
      const message = response.message;
      toast.success(message || "Reserva actualizada correctamente ✅");
      setEditState({ view: "reservasAdmin", entity: "", id: null }); */
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Error al actualizar la reserva"
      );
    }
  };

  if (loading || !area || !reservaActual) {
    return <Skeleton className="h-screen w-full" />;
  }

  // --- SI NO ES EDITABLE ---
  if (!reservaEditable) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 text-center px-6">
        <div className="max-w-lg p-8 bg-white border shadow-md rounded-xl space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">
            ⚠️ Esta reserva no puede editarse
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Esta reserva no se puede modificar porque ya está{" "}
            <span className="font-semibold">pagada</span>,{" "}
            <span className="font-semibold">cancelada</span>,{" "}
            <span className="font-semibold">rechazada</span> o su{" "}
            <span className="font-semibold">fecha ya ha pasado</span>.
          </p>
          <Button
            onClick={() =>
              setEditState({ view: "reservasAdmin", entity: "", id: null })
            }
            className="mt-2 cursor-pointer"
          >
            Volver a Reservas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        <Button
          onClick={() =>
            setEditState({ view: "reservasAdmin", entity: "", id: null })
          }
        >
          Cancelar y Volver
        </Button>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8 relative">
        <h1 className="text-3xl font-bold">
          Editando Reserva en: {area?.nombreAreaComun}
        </h1>

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

          {/* Render de bloques */}
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

        {/* FORMULARIO */}
        <FormEditarReserva
          area={area!}
          fechaInicial={fecha}
          reservaParaEditar={reservaActual}
          onSave={handleUpdate}
          cajones={cajones}
        />
        {/* {reservaEditable ? (
          <FormEditarReserva
            area={area!}
            fechaInicial={fecha}
            reservaParaEditar={reservaActual}
            onSave={handleUpdate}
            cajones={cajones}
          />
        ) : (
          <div className="p-6 bg-gray-100 border rounded-lg text-center text-gray-600 font-medium">
            ⚠️ Esta reserva no puede editarse porque está pagada, cancelada,
            rechazada o su fecha ya ha pasado.
          </div>
        )} */}
      </div>
    </>
  );
}
