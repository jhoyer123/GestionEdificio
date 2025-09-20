import { useEffect, useState } from "react";
import { type AreaComun, getAreasComunes } from "@/services/areasServices";
import { AreaCard } from "./AreaCard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { EditState } from "@/components/shared/MainContent";
import { Button } from "@/components/ui/button";

export default function AreaList({
  setEditState,
}: {
  setEditState: React.Dispatch<React.SetStateAction<EditState>>;
}) {
  const [areas, setAreas] = useState<AreaComun[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAreasComunes()
      .then((data) => setAreas(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = areas.filter((a) =>
    a.nombreAreaComun.toLowerCase().includes(search.toLowerCase())
  );

  const handleReservar = (area: AreaComun) => {
    // 🔗 Aquí podrías navegar al detalle o abrir modal
    setEditState({ view: "reservas", entity: "", id: area.idAreaComun });
  };

  return (
    <div className="p-6 space-y-6">
      <Button className="bg-amber-300 text-black hover:bg-amber-400 cursor-pointer">
        Agregar Área Común
      </Button>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Áreas Comunes</h2>
        <Input
          placeholder="Buscar área..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((area) => (
            <AreaCard
              key={area.idAreaComun}
              area={area}
              onReservar={handleReservar}
            />
          ))}
        </div>
      )}
    </div>
  );
}
