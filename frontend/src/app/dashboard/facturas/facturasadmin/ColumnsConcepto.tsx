//Tabla
import { type ColumnDef, type FilterFn, type Row } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { differenceInYears } from "date-fns";
import { Action } from "@radix-ui/react-alert-dialog";
import ActionConceptos from "./ActionsConceptos";

export interface concepto {
  idConcepto: number;
  titulo: string;
  descripcion: string;
  monto: number;
  frecuencia: string;
  usado: false;
}

const myCustomFilterFn: FilterFn<concepto> = (
  row: Row<concepto>,
  columnId: string,
  filterValue: string,
  addMeta: (meta: any) => void
) => {
  /* if (row.original.email.includes(filterValue)) {
    return true;
  } */
  if (row.original.titulo.includes(filterValue)) {
    return true;
  }
  return false;
};

//Columnas de la tabla
export const columnsConcepto = (
  refresh: () => Promise<void>
): ColumnDef<concepto>[] => [
  {
    accessorKey: "titulo",
    filterFn: myCustomFilterFn,
    header: "Título",
  },
  {
    accessorKey: "descripcion",
    filterFn: myCustomFilterFn,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Descripción
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "monto",
    header: "Monto",
    filterFn: myCustomFilterFn,
  },
  {
    accessorKey: "frecuencia",
    header: "Frecuencia",
    filterFn: myCustomFilterFn,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const personal = row.original;
      return <ActionConceptos data={personal} refresh={refresh} />;
    },
  },
];
