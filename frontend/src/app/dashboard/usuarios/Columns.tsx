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
import { Badge } from "@/components/ui/badge";

export interface propsUsuarios {
  id: number;
  nombre: string;
  email: string;
  estado: string;
  rol: { idRol: number; rol: string };
}

const myCustomFilterFn: FilterFn<propsUsuarios> = (
  row: Row<propsUsuarios>,
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
  /*   if (row.original.rol.rol.includes(filterValue)) {
    return true;
  } */
  return false;
};

//Columnas de la tabla
export const columns: ColumnDef<propsUsuarios>[] = [
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
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const estado = row.getValue("estado");
      return estado ? (
        <div className="text-green-500 font-bold">Activo</div>
      ) : (
        <div className="text-red-500 text-bold font-bold">Inactivo</div>
      );
    },
  },*/
  {
    accessorKey: "roles",
    header: "Rol/es",
    filterFn: myCustomFilterFn,
    cell: ({ row }) => {
      // Obtenemos el array de roles de la fila actual
      const roles = row.getValue("roles");
      // Es buena práctica verificar si 'roles' es un array antes de mapearlo
      if (!Array.isArray(roles)) {
        return null; // O muestra un guion, o lo que prefieras
      }

      // 3. Mapeamos el array y renderizamos un Badge por cada rol
      return (
        <div className="flex flex-wrap gap-1">
          {" "}
          {/* Un div para alinear los badges */}
          {roles.map((rol) => {
            if (!rol.rol) return null; // Verificamos que 'rol.rol' exista
            if (rol.rol === "administrador") {
              return (
                <Badge key={rol.idRol}>
                  {rol.rol}
                </Badge>
              );
            }
            if (rol.rol === "residente") {
              return (
                <Badge key={rol.idRol} className="capitalize bg-blue-600 text-white">
                  {rol.rol}
                </Badge>
              );
            }
            if (rol.rol === "personal") {
              return (
                <Badge key={rol.idRol} variant={"outline"} className="bg-green-600 text-white">
                  {rol.rol}
                </Badge>
              );
            }
          })}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const usuario = row.original;

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
              onClick={() => navigator.clipboard.writeText(usuario.nombre)}
            >
              Ver Usuario
            </DropdownMenuItem>
            <DropdownMenuItem>Editar Usuario</DropdownMenuItem>
            <DropdownMenuItem>Eliminar Usuario</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
