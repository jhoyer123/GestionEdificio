// Archivo: ColumnsRes.tsx

import { type ColumnDef, type FilterFn } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ActionsRes from "./ActionsRes";

// PASO 1: Actualizar la interfaz para reflejar datos opcionales
export interface Reserva {
  idReserva: number;
  fechaInicio: string;
  fechaFin: string | null; // Añadido para reservas de varios días
  horaInicio: string | null; // Convertido a opcional
  horaFin: string | null; // Convertido a opcional
  motivo: string;
  asistentes: number;
  estado: "confirmada" | "pendiente" | "cancelada" | string; // Tipado más específico
  idAreaComun: number;
  tipoAreaComun: string;
  areaNombre: string;
  usuario: string;
  email: string;
  telefono: string;
  pagado: boolean;
  costoPorHora: number;
  cajaId?: number | null;
  cajonNumero?: string | null;
}

// --- Funciones de Formateo para mantener el código limpio ---
const formatDate = (dateString: string | null) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  // Usamos toLocaleDateString para un formato amigable (ej: 29/9/2025)
  return date.toLocaleDateString("es-BO", { timeZone: "UTC" });
};

const formatTime = (timeString: string | null) => {
  if (!timeString) return "";
  // Quita los segundos si existen
  const [hours, minutes] = timeString.split(":");
  return `${hours}:${minutes}`;
};

// --- Columnas de la tabla ---
export const columnsRes = (
  refresh: () => void,
  setEditState: React.Dispatch<
    React.SetStateAction<{ view: string; entity: string; id: number | null }>
  >
): ColumnDef<Reserva>[] => [
  {
    accessorKey: "areaNombre",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Área Común
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "usuario",
    header: "Residente",
  },
  // PASO 2: La nueva columna unificada que reemplaza a fecha y horas
  {
    id: "periodo",
    header: "Periodo de Reserva",
    cell: ({ row }) => {
      const { fechaInicio, fechaFin, horaInicio, horaFin } = row.original;

      // Caso 1: Reserva por horas en un día específico
      if (horaInicio && horaFin) {
        return (
          <div className="flex flex-col">
            <span className="font-semibold">{formatDate(fechaInicio)}</span>
            <span className="text-sm text-gray-600">
              {formatTime(horaInicio)} - {formatTime(horaFin)}
            </span>
          </div>
        );
      }

      // Caso 2: Reserva por varios días
      if (fechaFin && fechaFin !== fechaInicio) {
        return (
          <div className="flex flex-col">
            <span className="font-semibold">Del {formatDate(fechaInicio)}</span>
            <span className="font-semibold">Al {formatDate(fechaFin)}</span>
          </div>
        );
      }

      // Caso 3: Reserva de un día completo
      return (
        <div className="flex flex-col">
          <span className="font-semibold">{formatDate(fechaInicio)}</span>
          <span className="text-sm text-gray-600">(Todo el día)</span>
        </div>
      );
    },
  },
  {
    accessorKey: "costoTotal",
    header: "Costo Total",
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const estado = row.original.estado;

      // PASO 3: Forma más robusta de asignar colores a los badges
      const styleMap = {
        confirmada: "bg-green-500 hover:bg-green-600",
        pendiente: "bg-yellow-500 hover:bg-yellow-600",
        cancelada: "bg-red-500 hover:bg-red-600",
      };

      const badgeClass =
        styleMap[estado as keyof typeof styleMap] || "bg-gray-500";

      return <Badge className={`${badgeClass} text-white`}>{estado}</Badge>;
    },
  },
  {
    accessorKey: "pagado",
    header: "Pago",
    cell: ({ row }) => {
      return row.original.pagado ? (
        <Badge className="bg-green-500 text-white hover:bg-green-600">
          Pagado
        </Badge>
      ) : (
        <Badge className="bg-orange-500 text-white hover:bg-orange-600">
          No Pagado
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const reserva = row.original;
      return <ActionsRes data={reserva} refresh={refresh} setEditState={setEditState} />;
    },
  },
];
