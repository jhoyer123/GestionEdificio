//Tabla
import { type ColumnDef, type FilterFn, type Row } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import ActionsAnuncios from "./ActionsAnuncio";

interface Anuncio {
  idAnuncio: number;
  titulo: string;
  descripcion: string;
  fechaCreacion: string;
  visiblePara: string;
  fechaExpiracion: Date;
  usuarioId: number;
}

const myCustomFilterFn: FilterFn<Anuncio> = (
  row: Row<Anuncio>,
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
  /*  if (row.original.rol.includes(filterValue)) {
    return true;
  } */
  if (row.original.descripcion.includes(filterValue)) {
    return true;
  }
  if (row.original.fechaCreacion.toString().includes(filterValue)) {
    return true;
  }
  if (row.original.visiblePara.includes(filterValue)) {
    return true;
  }
  if (row.original.fechaExpiracion.toString().includes(filterValue)) {
    return true;
  }
  if (row.original.usuarioId.toString().includes(filterValue)) {
    return true;
  }
  return false;
};

//Columnas de la tabla
export const columnsAnuncio = (
  refresh: () => Promise<void>
): ColumnDef<Anuncio>[] => [
  {
    accessorKey: "titulo",
    filterFn: myCustomFilterFn,
    header: ({ column }) => {
      return (
        <Button
          className="text-right m-auto"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Titulo
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "fechaCreacion",
    filterFn: myCustomFilterFn,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          fecha Creacion
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "visiblePara",
    header: "Visible Para",
    filterFn: myCustomFilterFn,
  },
  {
    accessorKey: "fechaExpiracion",
    header: "fechaExpiracion",
    filterFn: myCustomFilterFn,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const anuncio = row.original;
      return <ActionsAnuncios data={anuncio} refresh={refresh} />;
    },
  },
];
