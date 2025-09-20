import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";
import type { propsUsuarios } from "./Columns";
import { deleteUsuario } from "@/services/usuariosServices";

interface DeleteUserProps {
  data: propsUsuarios;
  setOpenDelete: React.Dispatch<React.SetStateAction<boolean>>;
  refresh: () => void;
  children?: React.ReactNode;
}

export default function DeleteUser({
  data,
  setOpenDelete,
  refresh,
  children,
}: DeleteUserProps) {
  const handleDelete = async () => {
    try {
      console.log(data);
      console.log(data.idUsuario);
      // Llamar al servicio para eliminar el usuario
      const response = await deleteUsuario(data.idUsuario);
      const message = response.message;
      toast.success(message, {
        duration: 4000,
        position: "top-left",
      });
      setOpenDelete(false);
      refresh();
    } catch (error) {
      toast.error("Error al eliminar el usuario", {
        duration: 4000,
        position: "top-left",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Mensaje principal */}
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
        <p className="text-lg font-semibold">Confirmar eliminación</p>
        <p className="text-sm mt-1">
          ¿Está seguro de que desea eliminar este usuario?
          <br />
          Esta acción no se puede deshacer.
        </p>
      </div>

      {children}

      {/* Botones */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => setOpenDelete(false)}
          className="cursor-pointer"
        >
          Cancelar
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          className="cursor-pointer"
        >
          Eliminar usuario
        </Button>
      </div>
    </div>
  );
}
