//Tabla
import { type ColumnDef, type FilterFn, type Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ref } from "process";
import ActionsResidentes from "./useResidentes/ActionsResidentes";

export interface propsResidente {
  idResidente: number;
  telefono: string;
  usuarioId: number;
  nombre: string;
  email: string;
  estado: boolean;
  departamento: {
    numero: number;
    fecha: string;
    tipoResidencia: string;
  };
  rol: {
    idRol: number;
    rol: string;
  }[];
  refresh: () => void;
}

const myCustomFilterFn: FilterFn<propsResidente> = (
  row: Row<propsResidente>,
  columnId: string,
  filterValue: string,
  addMeta: (meta: any) => void
) => {
  /* if (row.original.email.includes(filterValue)) {
    return true;
  } */
  if (row.original.nombre.includes(filterValue)) {
    return true;
  }
  if (row.original.telefono.includes(filterValue)) {
    return true;
  }
  if (row.original.departamento.numero.toString().includes(filterValue)) {
    return true;
  }
  return false;
};

//Columnas de la tabla
export const columns = (refresh: () => void): ColumnDef<propsResidente>[] => [
  {
    accessorKey: "nombre",
    filterFn: myCustomFilterFn,
    header: ({ column }) => {
      return (
        <Button
          className="text-right m-auto"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  /* {
    accessorKey: "email",
    filterFn: myCustomFilterFn,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  }, */
  /* {
    accessorKey: "rol",
    header: "Rol",
    filterFn: myCustomFilterFn,
  }, */
  {
    accessorKey: "telefono",
    header: "Teléfono",
    filterFn: myCustomFilterFn,
  },
  {
    accessorKey: "departamento.numero",
    header: "Nro Departamento",
    filterFn: myCustomFilterFn,
  },
  {
    accessorKey: "departamento.tipoResidencia",
    header: "Tipo de Residencia",
    filterFn: myCustomFilterFn,
  },
  {
    accessorKey: "departamento.fecha",
    header: "Fecha de Residencia",
    filterFn: myCustomFilterFn,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const personal = row.original;
      return <ActionsResidentes data={personal} refresh={refresh} />;
    },
  },
];
