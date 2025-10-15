import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createReserva } from "@/services/reservaServices";
import type { EditState } from "@/components/shared/MainContent";
//pago
import PagoQR from "@/app/dashboard/pagos/PagoQRReserva";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// <-- CAMBIO: Importamos los componentes de Select de shadcn/ui
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PagoQRReserva from "@/app/dashboard/pagos/PagoQRReserva";

import { createFacturaForReserva } from "@/services/facturas.services";

interface ReservaFormProps {
  setState: React.Dispatch<React.SetStateAction<EditState>>;
  refresh?: () => void;
  area: any;
  fechaInicial: string;
  areaComunId: number | null;
  cajones?: any[];
}

// <-- CAMBIO: Función auxiliar para convertir "HH:MM" a minutos. Es clave para comparar horarios.
const toMinutes = (timeStr: string | null): number => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

export default function ReservaForm({
  area,
  fechaInicial,
  areaComunId,
  setState,
  refresh,
  cajones = [],
}: ReservaFormProps) {
  const [modalidad, setModalidad] = useState<"horas" | "dias">("horas");
  const [fecha, setFecha] = useState(fechaInicial);
  const [fechaFin, setFechaFin] = useState(fechaInicial);
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [motivo, setMotivo] = useState(
    area.tipoArea === "gimnasio" ? "Ejercicio" : ""
  );
  const [numAsistentes, setNumAsistentes] = useState(
    area.tipoArea === "gimnasio" ? "1" : ""
  );
  // <-- CAMBIO: El valor del select ahora se maneja como string para compatibilidad con el componente
  const [cajaSeleccionada, setCajaSeleccionada] = useState("");
  const [loading, setLoading] = useState(false);

  // <-- CAMBIO: Nuevo estado para guardar la lista de cajones filtrados dinámicamente
  const [cajonesDisponibles, setCajonesDisponibles] = useState<any[]>([]);

  const usuarioComoString = localStorage.getItem("user");
  const usuarioId = usuarioComoString ? JSON.parse(usuarioComoString).id : null;
  const [costoAprox, setCostoAprox] = useState<number>(0);
  const [reservaId, setReservaId] = useState<number>(0);
  const [facturaId, setFacturaId] = useState<number>(0);

  const [open, setOpen] = useState(false);
  const usuarioString = localStorage.getItem("user");
  const usuario = usuarioString ? JSON.parse(usuarioString) : null;
  const id = usuario ? usuario.id : null;

  //useEffect para filtrar los cajones dinámicamente
  useEffect(() => {
    // Si no es un parqueo, no hacemos nada
    if (area.tipoArea !== "parqueo") return;

    // Si el usuario quiere reservar por días completos
    if (modalidad === "dias") {
      // Un cajón está disponible si no tiene NINGUNA reserva (ni por hora ni por día)
      // en el rango de fechas seleccionado.
      const disponibles = cajones.filter((cajon) => {
        const tieneConflicto = area.reservas?.some((r: any) => {
          if (r.cajaId !== cajon.idParqueoCaja || r.estado === "cancelada")
            return false;

          // Comprobamos si los rangos de fechas se solapan
          const inicioReserva = new Date(r.fechaReserva);
          const finReserva = new Date(r.fechaFinReserva || r.fechaReserva);
          const inicioSeleccion = new Date(fecha);
          const finSeleccion = new Date(fechaFin);

          return inicioSeleccion <= finReserva && finSeleccion >= inicioReserva;
        });
        return !tieneConflicto;
      });
      setCajonesDisponibles(disponibles);
    }
    // Si el usuario quiere reservar por horas
    else if (modalidad === "horas" && horaInicio && horaFin) {
      const inicioSeleccionado = toMinutes(horaInicio);
      const finSeleccionado = toMinutes(horaFin);

      // Si el rango es inválido, no mostramos nada
      if (inicioSeleccionado >= finSeleccionado) {
        setCajonesDisponibles([]);
        return;
      }

      const disponibles = cajones.filter((cajon) => {
        const tieneConflicto = area.reservas?.some((r: any) => {
          // El conflicto debe ser (1) para el mismo cajón, (2) en la misma fecha y (3) no estar cancelada
          if (
            r.cajaId !== cajon.idParqueoCaja ||
            r.fechaReserva !== fecha ||
            r.estado === "cancelada"
          ) {
            return false;
          }

          // Si hay una reserva de día completo, hay conflicto
          if (!r.horaInicio) return true;

          // Comparamos rangos de horas
          const inicioExistente = toMinutes(r.horaInicio);
          const finExistente = toMinutes(r.horaFin);

          // Lógica de solapamiento de rangos
          return (
            inicioSeleccionado < finExistente &&
            finSeleccionado > inicioExistente
          );
        });

        return !tieneConflicto; // Un cajón está disponible si NO tiene conflictos
      });

      setCajonesDisponibles(disponibles);
    } else {
      // Si no se ha completado el rango de horas, la lista está vacía
      setCajonesDisponibles([]);
    }

    // Reseteamos la selección si la lista cambia
    setCajaSeleccionada("");
  }, [
    area.reservas,
    cajones,
    fecha,
    fechaFin,
    horaInicio,
    horaFin,
    modalidad,
    area.tipoArea,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const reservaData: any = {
        usuarioId,
        areaComunId,
        fechaReserva: fecha,
      };

      if (area.tipoArea === "parqueo") {
        if (!cajaSeleccionada) throw new Error("Debes seleccionar un cajón.");
        reservaData.cajaId = Number(cajaSeleccionada);
      } else {
        reservaData.motivo = motivo || "General";
        reservaData.numAsistentes = Number(numAsistentes) || 1;
      }

      if (modalidad === "horas" || area.tipoArea === "gimnasio") {
        if (!horaInicio || !horaFin)
          throw new Error("Debes seleccionar hora de inicio y fin.");
        reservaData.horaInicio = horaInicio;
        reservaData.horaFin = horaFin;
      }

      if (modalidad === "dias" && area.tipoArea !== "gimnasio") {
        if (new Date(fechaFin) < new Date(fecha))
          throw new Error("La fecha final no puede ser anterior a la inicial.");
        reservaData.fechaFinReserva = fechaFin;
      }

      if (area.tipoArea === "gimnasio") {
        reservaData.motivo = "Ejercicio";
        reservaData.numAsistentes = 1;
      }

      //console.log("Datos de reserva a enviar:", reservaData);
      const response = await createReserva(reservaData);
      setReservaId(response.reserva.idReserva);
      // Crear la factura inmediatamente después de crear la reserva
      const facturaResponse = await createFacturaForReserva(
        costoAprox,
        response.reserva.idReserva
      );
      setFacturaId(facturaResponse.factura.idFactura);
      toast.success(response.message || "Reserva creada exitosamente");
      setOpen(true); // Abrir el diálogo de pago

      // Reset
      if (refresh) refresh();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Error al crear la reserva"
      );
    } finally {
      setLoading(false);
    }
  };

  // useEffect para el cálculo del costo
  useEffect(() => {
    // 1. Validar el costo base del área
    // Si no hay costo, o no es un número válido, el costo es 0.
    const costoPorHora = Number(area.costoBase);
    //console.log("Costo por hora base:", costoPorHora);
    if (!area.costoBase || isNaN(costoPorHora) || costoPorHora <= 0) {
      setCostoAprox(0);
      return;
    }

    let costoCalculado = 0;

    // 2. Lógica para modalidad "por horas"
    if (modalidad === "horas") {
      const inicioMin = toMinutes(horaInicio);
      const finMin = toMinutes(horaFin);

      // Solo calcular si tenemos un rango de tiempo válido
      if (horaInicio && horaFin && finMin > inicioMin) {
        if (area.tipoArea === "gimnasio") {
          costoCalculado = costoPorHora; // Costo fijo para el gimnasio
        } else {
          const duracionHoras = (finMin - inicioMin) / 60;
          costoCalculado = Math.ceil(duracionHoras) * costoPorHora;
        }
      }
    }
    // 3. Lógica para modalidad "por días"
    else if (modalidad === "dias") {
      const fechaIni = new Date(fecha);
      const fechaFinReserva = new Date(fechaFin);

      // Solo calcular si tenemos un rango de fechas válido
      if (fecha && fechaFin && fechaFinReserva >= fechaIni) {
        if (area.tipoArea === "gimnasio") {
          costoCalculado = costoPorHora; // Costo fijo sin importar los días
        } else {
          // Días inclusivos (ej: del 10 al 11 son 2 días)
          const dias =
            Math.round(
              (fechaFinReserva.getTime() - fechaIni.getTime()) /
                (1000 * 60 * 60 * 24)
            ) + 1;

          // Horas de operación (con valores por defecto si no existen)
          const aperturaMin = toMinutes(area.horarioApertura); // Devuelve 0 si es nulo
          const cierreMin = toMinutes(area.horarioCierre); // Devuelve 0 si es nulo

          // Si los horarios son inválidos (0 o ilógicos), asumimos 24h para el parqueo
          let horasOperacion = 24;
          if (cierreMin > aperturaMin) {
            horasOperacion = (cierreMin - aperturaMin) / 60;
          }

          costoCalculado = dias * horasOperacion * costoPorHora;

          /* // <-- ¡AÑADE ESTO PARA DEPURAR!
          console.log({
            dias: dias,
            horasOperacion: horasOperacion,
            costoPorHora: costoPorHora,
            total: costoCalculado,
          }); */
        }
      }
    }

    // 4. Actualizar el estado final
    // Nos aseguramos de que el resultado sea un número válido y no negativo.
    setCostoAprox(isNaN(costoCalculado) ? 0 : Math.max(0, costoCalculado));
  }, [modalidad, horaInicio, horaFin, fecha, fechaFin, area]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Reservar {area.nombreAreaComun}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {area.tipoArea === "parqueo"
              ? "Disponible 24 horas"
              : `Horario: ${area.horarioApertura.slice(
                  0,
                  5
                )} - ${area.horarioCierre.slice(0, 5)}`}
          </p>
          <p>Capacidad Maxima: {area.capacidadMaxima}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ... (código de botones de modalidad y fechas igual que antes) ... */}
            {(area.tipoArea === "parqueo" || area.tipoArea !== "gimnasio") && (
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={modalidad === "horas" ? "default" : "outline"}
                  onClick={() => setModalidad("horas")}
                >
                  Por horas
                </Button>
                <Button
                  type="button"
                  variant={modalidad === "dias" ? "default" : "outline"}
                  onClick={() => setModalidad("dias")}
                >
                  Por días
                </Button>
              </div>
            )}
            <div>
              <Label>Fecha inicio</Label>
              <Input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>
            {modalidad === "dias" && (
              <div>
                <Label>Fecha fin</Label>
                <Input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
            )}
            {(modalidad === "horas" || area.tipoArea === "gimnasio") && (
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
            )}
            {/* ... (código de motivo y asistentes igual que antes) ... */}
            {area.tipoArea !== "gimnasio" && area.tipoArea !== "parqueo" && (
              <>
                <div>
                  <Label>Motivo</Label>
                  <Input
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Número de asistentes</Label>
                  <Input
                    type="number"
                    min={1}
                    value={numAsistentes}
                    onChange={(e) => setNumAsistentes(e.target.value)}
                  />
                </div>
              </>
            )}
            {area.tipoArea === "parqueo" && (
              <div>
                <Label>Selecciona un cajón disponible</Label>
                {/* <-- CAMBIO: Usamos el nuevo componente Select y la lista dinámica */}
                <Select
                  value={cajaSeleccionada}
                  onValueChange={setCajaSeleccionada}
                  disabled={modalidad === "horas" && (!horaInicio || !horaFin)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Elige un horario para ver disponibilidad..." />
                  </SelectTrigger>
                  <SelectContent>
                    {cajonesDisponibles.length > 0 ? (
                      cajonesDisponibles.map((c) => (
                        <SelectItem
                          key={c.idParqueoCaja}
                          value={c.idParqueoCaja.toString()}
                        >
                          Cajón {c.numeroCaja}
                        </SelectItem>
                      ))
                    ) : (
                      <p className="p-4 text-sm text-muted-foreground">
                        No hay cajones disponibles para la selección actual.
                      </p>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={loading}
            >
              {loading ? "Reservando..." : "Confirmar Reserva"}
            </Button> */}

            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50 space-y-1">
              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Costo Aproximado de la Reserva
              </Label>
              <p className="text-2xl font-bold text-primary">
                {costoAprox !== null ? (
                  // Mostrar el monto formateado
                  costoAprox.toLocaleString("es-BO", {
                    style: "currency",
                    currency: "BOB", // Reemplazar con su moneda si no es Boliviano
                  })
                ) : (
                  // Mostrar mensaje cuando faltan datos
                  <span className="text-base font-normal text-muted-foreground">
                    {area.tipoArea === "gimnasio"
                      ? "Costo fijo por sesión."
                      : modalidad === "horas"
                      ? "Seleccione hora de inicio y fin."
                      : "Seleccione fecha de inicio y fin."}
                  </span>
                )}
              </p>
            </div>
            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={loading}
            >
              {loading ? "Reservando..." : "Confirmar Reserva"}
            </Button>
          </form>
        </CardContent>
      </Card>
      {/* Renderizamos el componente de pago solo si el costo es mayor a 0 */}
      {/* Diálogo de confirmación para cancelar */}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pago por QR</AlertDialogTitle>
            <AlertDialogDescription>
              Completa el proceso para realizar el pago.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <PagoQRReserva
            usuarioId={id}
            reservaId={reservaId}
            facturaId={facturaId}
            monto={costoAprox}
            nombreAreaComun={area.nombreAreaComun}
            //setFacturas={setFacturas}
          />
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Volver
            </AlertDialogCancel>
            {/* <AlertDialogAction
              onClick={handlePagar}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white cursor-pointer"
            >
              Realizar Pago
            </AlertDialogAction> */}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
