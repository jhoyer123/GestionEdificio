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

export interface propsResidente {
  residenteId: number;
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
  rol: string;
}

const myCustomFilterFn: FilterFn<propsResidente> = (
  row: Row<propsResidente>,
  columnId: string,
  filterValue: string,
  addMeta: (meta: any) => void
) => {
  if (row.original.email.includes(filterValue)) {
    return true;
  }
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
export const columns: ColumnDef<propsResidente>[] = [
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
  {
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
  },
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
    accessorKey: "departamento.fecha",
    header: "Fecha de Residencia",
    filterFn: myCustomFilterFn,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const personal = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(personal.nombre)}
            >
              Ver Personal
            </DropdownMenuItem>
            <DropdownMenuItem>Editar Personal</DropdownMenuItem>
            <DropdownMenuItem>Eliminar Personal</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
