// src/components/reservas/reserva-card.tsx
import { parseISO } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Clock, Users, Building } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { ReservaUser } from "./ReservasUser"; // Ajusta la ruta si es necesario
import { ReservaActions } from "./ReservaActions";

interface ReservaCardProps {
  reserva: ReservaUser;
}

// Función para obtener el color del Badge según el estado
const getBadgeVariant = (
  estado: ReservaUser["estado"]
): "default" | "secondary" | "destructive" | "outline" => {
  switch (estado) {
    case "confirmada":
      return "default";
    case "pendiente":
      return "secondary";
    case "cancelada":
      return "destructive";
    case "rechazada":
      return "destructive";
    default:
      return "outline";
  }
};

// Componente para mostrar un ícono con texto
const InfoItem = ({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string | number;
}) => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <Icon className="h-4 w-4" />
    <span>{text}</span>
  </div>
);

export function ReservaCard({ reserva }: ReservaCardProps) {

  //esto deberia formatear la fecha pero no modificarla

  const formatDate = (dateStr: string) => {
    // parseISO interpreta correctamente YYYY-MM-DD como fecha local sin modificarla
    return format(parseISO(dateStr), "EEEE, d 'de' MMMM 'de' yyyy", {
      locale: es,
    });
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return "";
    // Asumimos que el formato es HH:mm:ss, lo convertimos a HH:mm
    const [hours, minutes] = timeStr.split(":");
    return `${hours}:${minutes}`;
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg mb-1">{reserva.areaNombre}</CardTitle>
            <CardDescription>{reserva.motivo}</CardDescription>
          </div>
          <Badge
            variant={getBadgeVariant(reserva.estado)}
            className="capitalize"
          >
            {reserva.estado}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        <Separator className="mb-4" />

        {/* Renderizado condicional: por días o por horas */}
        {reserva.esPorDias && (
          <div className="space-y-3">
            <InfoItem icon={CalendarDays} text="Reserva por Días" />
            <p className="font-semibold">{formatDate(reserva.fechaInicio)}</p>
            <p className="text-sm text-muted-foreground -mt-2">hasta el</p>
            <p className="font-semibold">{formatDate(reserva.fechaFin)}</p>
          </div>
        )}

        {reserva.esPorHoras && (
          <div className="space-y-3">
            <InfoItem
              icon={CalendarDays}
              text={formatDate(reserva.fechaInicio)}
            />
            <InfoItem
              icon={Clock}
              text={`De ${formatTime(reserva.horaInicio)} a ${formatTime(
                reserva.horaFin
              )} hrs`}
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center bg-muted/50 px-6 py-3">
        <div className="text-sm">
          <span className="font-semibold text-lg">${reserva.costoTotal}</span>
          <span className="text-muted-foreground">
            {" "}
            {reserva.pagado ? "(Pagado)" : "(Pendiente de Pago)"}
          </span>
        </div>
        {/* Solo mostrar acciones para reservas próximas */}
        {(reserva.estado === "confirmada" ||
          reserva.estado === "pendiente") && (
          <ReservaActions idReserva={reserva.idReserva} />
        )}
      </CardFooter>
    </Card>
  );
}
