//Tabla
import { type ColumnDef, type FilterFn, type Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { differenceInYears } from "date-fns";
import ActionsPersonal from "./usePersonal/ActionsPersonal";

export interface propsPersonal {
  idPersonal: number;
  fechaNacimiento: string;
  telefono: string;
  direccion: string;
  funcionId: number;
  genero: string;
  usuarioId: number;
  nombre: string;
  email: string;
  estado: string;
  rol: {
    idRol: number;
    rol: string;
  }[];
}

const myCustomFilterFn: FilterFn<propsPersonal> = (
  row: Row<propsPersonal>,
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
  /*  if (row.original.rol.includes(filterValue)) {
    return true;
  } */
  if (row.original.telefono.includes(filterValue)) {
    return true;
  }
  if (row.original.direccion.includes(filterValue)) {
    return true;
  }
  return false;
};

//Columnas de la tabla
export const columns = (
  
  refresh: () => Promise<void>

): ColumnDef<propsPersonal>[] => [
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
    accessorKey: "direccion",
    filterFn: myCustomFilterFn,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Dirección
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  }, 
  {
    accessorKey: "genero",
    header: "Género",
    filterFn: myCustomFilterFn,
  },
  {
    accessorKey: "telefono",
    header: "Teléfono",
    filterFn: myCustomFilterFn,
  },
  {
    accessorKey: "cargo",
    header: "Cargo",
    filterFn: myCustomFilterFn,
  },
  {
    accessorKey: "fechaNacimiento",
    header: "Edad",   
    accessorFn: (row) => differenceInYears(new Date(), new Date(row.fechaNacimiento))
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const personal = row.original;
      return <ActionsPersonal data={personal} refresh={refresh} />;
    },
  },
];