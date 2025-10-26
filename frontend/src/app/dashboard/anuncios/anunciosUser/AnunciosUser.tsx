import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Megaphone, Users, UserCheck } from "lucide-react";
import { getAnuncios, marcarAnuncioVisto } from "@/services/anunciosServices";
import { useAuth } from "@/components/shared/AuthContext";
import type { Anuncio } from "../Anuncios";

//Dialog imports
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

export default function AnunciosUser() {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedAnuncio, setSelectedAnuncio] = useState<Anuncio | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    const fetchAnuncios = async () => {
      try {
        const response = await getAnuncios();
        setAnuncios(response);
      } catch (error) {
        console.error("Error al obtener los anuncios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnuncios();
  }, []);

  const rolesUser = user?.rol?.map((r) => r.nombre) || [];

  const anunciosVisibles = anuncios.filter(
    (anuncio) =>
      anuncio.visiblePara === "todos" || rolesUser.includes(anuncio.visiblePara)
  );

  const iconoPorTipo = (tipo: string) => {
    switch (tipo) {
      case "residente":
        return <UserCheck className="text-green-600" />;
      case "personal":
        return <Users className="text-blue-600" />;
      case "todos":
      default:
        return <Megaphone className="text-yellow-600" />;
    }
  };

  const handleVerAnuncio = async (anuncio: Anuncio) => {
    setSelectedAnuncio(anuncio);
    setOpen(true);

    try {
      if (user) {
        await marcarAnuncioVisto(user.id, anuncio.idAnuncio);
      }
    } catch (error) {
      console.error("Error al marcar el anuncio como visto:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh] text-gray-600">
        <Loader2 className="animate-spin w-8 h-8 mr-2" />
        Cargando anuncios...
      </div>
    );
  }

  return (
    <div className="min-h-screen py-5">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-10">
        🗞️ Anuncios del Edificio
      </h1>

      {anunciosVisibles.length === 0 ? (
        <div className="text-center text-gray-500 text-lg">
          No hay anuncios disponibles en este momento.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {anunciosVisibles.map((anuncio) => (
            <Card
              key={anuncio.idAnuncio}
              className="shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-200 cursor-pointer"
              onClick={() => handleVerAnuncio(anuncio)}
            >
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {anuncio.titulo}
                    </h2>
                    {iconoPorTipo(anuncio.visiblePara)}
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    {anuncio.descripcion.length > 120
                      ? anuncio.descripcion.slice(0, 120) + "..."
                      : anuncio.descripcion}
                  </p>
                </div>

                <div className="text-xs text-gray-500 mt-4 border-t pt-2">
                  Publicado el {anuncio.fechaCreacion}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal con contenido del anuncio completo */}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="max-w-lg break-words whitespace-normal">
          {selectedAnuncio && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-bold text-gray-800">
                  {selectedAnuncio.titulo}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600 mt-4 whitespace-pre-line max-h-[60vh] overflow-y-auto break-words whitespace-normal">
                  {selectedAnuncio.descripcion}
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter className="mt-6">
                <AlertDialogCancel>Cerrar</AlertDialogCancel>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
