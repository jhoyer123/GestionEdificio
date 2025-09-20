import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";
import type { propsResidente } from "./ColumnsR";
import { deleteUsuario } from "@/services/usuariosServices";
import { deleteResidente } from "@/services/residenteServices";
import { IdCardLanyardIcon } from "lucide-react";

interface DeleteUserProps {
  data: propsResidente;
  setOpenDelete: React.Dispatch<React.SetStateAction<boolean>>;
  refresh: () => void;
  children?: React.ReactNode;
}

export default function DeleteResidente({
  data,
  setOpenDelete,
  refresh,
  children,
}: DeleteUserProps) {
  const handleDelete = async () => {
    try {
      if (data.rol.length === 1) {
        // ✅ El usuario tiene un solo rol → se elimina completo
        const response = await deleteUsuario(data.usuarioId);
        const message = response.message;
        toast.success(message, {
          duration: 4000,
          position: "top-left",
        });
      } else {
        // ✅ El usuario tiene varios roles → solo eliminar "residente"
        const rolResidente = data.rol.find((rol) => rol.rol === "residente");
        const response = await deleteResidente(
          data.usuarioId,
          { idRol: rolResidente?.idRol }
        );
        const message = response.message;
        toast.success(message, {
          duration: 4000,
          position: "top-left",
        });
      }
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
      {/* Mensaje principal dinámico */}
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
        {data.rol.length === 1 ? (
          <>
            <p className="text-sm mt-1">
              Este usuario solo tiene un rol asignado y será eliminado en su
              totalidad.
              <br />
              ¿Desea continuar?
            </p>
          </>
        ) : (
          <>
            <p className="text-lg font-semibold">Confirmar eliminación</p>
            <p className="text-sm mt-1">
              Este usuario tiene múltiples roles asignados.
              <br />
              Solo se eliminará el rol <strong>residente</strong>.
              <br />
              ¿Está seguro de continuar?
            </p>
          </>
        )}
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
          {data.rol.length === 1
            ? "Eliminar usuario"
            : "Eliminar rol residente"}
        </Button>
      </div>
    </div>
  );
}
