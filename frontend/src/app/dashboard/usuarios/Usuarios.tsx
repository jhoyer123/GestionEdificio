import { getUsuarios } from "@/services/usuariosServices";
import { DataTable } from "../../../components/shared/DataTable";
import { useEffect, useState } from "react";
import { columns } from "./Columns";
import { type propsUsuarios } from "./Columns";
 
//Solo para probar el modal
let UsuariosPrueba: propsUsuarios[] = [
  {
    id: 1,
    nombre: "Juan Pérez",
    email: "juan.perez@example.com",
    estado: "true",
    rol: { rol: "Admin" }
  },
  {
    id: 2,
    nombre: "María Gómez",
    email: "maria.gomez@example.com",
    estado: "false",
    rol: { rol: "Personal" }
  }
]
  


//Creando la tabla
export const Usuarios = () => {
  const [usuarios, setUsuarios] = useState<propsUsuarios[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getUsuarios();
      setUsuarios(data);
    };
    fetchData();
  }, []);

  return (
    <div className="container mx-auto py-10">
      {/* <DataTable columns={columns} data={usuarios} /> */}
      <DataTable columns={columns} data={UsuariosPrueba} />
    </div>
  );
};
