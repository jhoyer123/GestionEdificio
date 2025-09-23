//Tabla
import { type ColumnDef, type FilterFn, type Row } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ActionsRes from "./ActionsRes";

export interface Reserva {
  idReserva: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;
  asistentes: number;
  estado: string;
  idAreaComun: number;
  areaNombre: string;
  usuario: string;
  email: string;
  telefono: string;
  pagado: boolean;
  costoPorHora: number;
}

const myCustomFilterFn: FilterFn<Reserva> = (
  row: Row<Reserva>,
  columnId: string,
  filterValue: string,
  addMeta: (meta: any) => void
) => {
  if (row.original.areaNombre.includes(filterValue)) {
    return true;
  }
  if (row.original.telefono.includes(filterValue)) {
    return true;
  }
  if (row.original.fecha.toString().includes(filterValue)) {
    return true;
  }
  return false;
};

//Columnas de la tabla
export const columnsRes = (refresh: () => void): ColumnDef<Reserva>[] => [
  {
    accessorKey: "areaNombre",
    filterFn: myCustomFilterFn,
    header: ({ column }) => {
      return (
        <Button
          className="text-right m-auto"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombre Area Común
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "usuario",
    header: "Nombre Residente",
    filterFn: myCustomFilterFn,
  },
  {
    accessorKey: "fecha",
    header: "Fecha de Reserva",
    filterFn: myCustomFilterFn,
    cell: ({ row }) => {
      const fecha = row.original.fecha;
      return fecha ? fecha.split("T")[0] : "";
    },
  },
  {
    accessorKey: "horaInicio",
    header: "Hora de Inicio",
    filterFn: myCustomFilterFn,
  },
  {
    accessorKey: "horaFin",
    header: "Hora de Fin",
    filterFn: myCustomFilterFn,
  },
  {
    accessorKey: "estado",
    header: "Estado",
    filterFn: myCustomFilterFn,
    cell: ({ row }) => {
      const estado = row.original.estado;
      let color = "gray";
      if (estado === "confirmada") {
        color = "green";
      } else if (estado === "pendiente") {
        color = "yellow";
      } else if (estado === "cancelada") {
        color = "red";
      }
      return <Badge className={`bg-${color}-500`}>{estado}</Badge>;
    },
  },
  {
    accessorKey: "pagado",
    //como este valor es de tipo bolean, mostrar pagado si es true y no pagado si es false
    header: "Pago",
    cell: ({ row }) => {
      return row.original.pagado === true ? (
        <Badge className="bg-green-500">Pagado</Badge>
      ) : (
        <Badge className="bg-red-500">No Pagado</Badge>
      );
    },
    filterFn: myCustomFilterFn,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const personal = row.original;
      return <ActionsRes data={personal} refresh={refresh} />;
    },
  },
];
