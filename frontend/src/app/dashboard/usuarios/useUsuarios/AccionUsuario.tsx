import Modal from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { set } from "react-hook-form";

export const AccionUsuario = () => {
  const [open, setOpen] = useState(true);

  const handleSave = () => {
    // Lógica para guardar los cambios
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      title="Editar Usuario"
      footer={
        <>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar</Button>
        </>
      }
    >
      <div className="space-y-4">
        <input className="w-full border p-2 rounded" placeholder="Nombre" />
        <input className="w-full border p-2 rounded" placeholder="Email" />
        <select className="w-full border p-2 rounded">
          <option>Admin</option>
          <option>Usuario</option>
        </select>
      </div>
    </Modal>
  );
};
