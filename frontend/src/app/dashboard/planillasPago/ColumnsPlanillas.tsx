import { type ColumnDef, type FilterFn, type Row } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ActionsPlanillas from "./ActionsPlanillas";

export interface Planilla {
  idPlanilla: number;
  mes?: number;
  anio?: number;
  fechaGeneracion?: string;
  tipo: string;
  pagado: boolean;
  idPersonal: number;
  nombrePersonal: string;
  telefonoPersonal: string;
  emailPersonal: string;
  funcion: string;
  salario?: string;
  qrPersonal?: string;
  qrPersonalId?: number;
}

const myCustomFilterFn: FilterFn<Planilla> = (
  row: Row<Planilla>,
  columnId: string,
  filterValue: string,
  addMeta: (meta: any) => void
) => {
  if (row.original.nombrePersonal?.includes(filterValue)) {
    return true;
  }
  if (row.original.telefonoPersonal?.includes(filterValue)) {
    return true;
  }
  if (row.original.emailPersonal?.includes(filterValue)) {
    return true;
  }
  if (row.original.funcion?.includes(filterValue)) {
    return true;
  }
  if (row.original.fechaGeneracion?.includes(filterValue)) {
    return true;
  }
  return false;
};

export const columnsPlanillas = (
  refresh: () => Promise<void>
): ColumnDef<Planilla>[] => [
  {
    accessorKey: "nombrePersonal",
    filterFn: myCustomFilterFn,
    header: "Nombre",
  },
  {
    accessorKey: "telefonoPersonal",
    filterFn: myCustomFilterFn,
    header: "Teléfono",
  },
  {
    accessorKey: "emailPersonal",
    filterFn: myCustomFilterFn,
    header: "Email",
  },
  {
    accessorKey: "funcion",
    filterFn: myCustomFilterFn,
    header: "Función",
  },
  {
    accessorKey: "fechaGeneracion",
    header: "Fecha de Generación",
  },
  {
    accessorKey: "salario",
    header: "Salario",
  },
  {
    accessorKey: "pagado",
    header: "Pagado",
    cell: ({ row }) => {
      const planilla = row.original;
      return <Badge>{planilla.pagado ? "Sí" : "No"}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const planilla = row.original;
      return <ActionsPlanillas data={planilla} refresh={refresh} />;
    },
  },
];
