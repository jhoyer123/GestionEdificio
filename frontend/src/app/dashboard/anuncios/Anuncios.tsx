import { DataTable } from "@/components/shared/DataTable";
import { columnsAnuncio } from "./ColumnsAnuncio";
import React, { useEffect, useState } from "react";
import { getAnuncios } from "@/services/anunciosServices";
import { type EditState } from "@/components/shared/MainContent";
import { Button } from "@/components/ui/button";
import ModalCreateAnuncio from "./ModalCreateAnuncio";
//para el modal dell formulario de creacion

interface AnuncioProps {
  setEditState: React.Dispatch<React.SetStateAction<EditState>>;
}

export interface Anuncio {
  idAnuncio: number;
  titulo: string;
  descripcion: string;
  fechaCreacion: string;
  visiblePara: string;
  fechaExpiracion: Date;
  usuarioId: number;
}

const Anuncios = ({ setEditState }: AnuncioProps) => {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [open, setOpen] = useState(false);

  const fetch = async () => {
    try {
      const data = await getAnuncios();
      setAnuncios(data);
    } catch (error) {
      console.error("Error fetching anuncios:", error);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold mb-3">Gestión de Anuncios</h2>
        <Button
          className="text-black bg-amber-300 hover:bg-amber-400 mb-4 cursor-pointer"
          onClick={() => setOpen(true)}
        >
          Crear Anuncio
        </Button>
      </div>
      {/* Aquí puedes agregar la lógica para mostrar y gestionar los anuncios */}
      <DataTable columns={columnsAnuncio(fetch)} data={anuncios} />

      <ModalCreateAnuncio
        open={open}
        setOpen={setOpen}
        refresh={fetch}
      />
    </div>
  );
};

export default Anuncios;
