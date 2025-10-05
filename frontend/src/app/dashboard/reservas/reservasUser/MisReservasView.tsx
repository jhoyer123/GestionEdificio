// src/components/reservas/mis-reservas-view.tsx
import { useEffect, useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReservaCard } from "./ReservaCard";
import type { ReservaUser } from "./ReservasUser"; // Ajusta la ruta si es necesario
import { UserReservas } from "@/services/reservaServices";

// Función para obtener los datos del backend
const fetchUserReservas = async (): Promise<ReservaUser[]> => {
  try {
    // NOTA: Asegúrate de que este endpoint solo devuelva las reservas
    // del usuario autenticado. Deberás implementar la lógica de autenticación.
    // Obtener el string
    const usuarioString = localStorage.getItem("user");

    // Convertirlo a objeto (si existe)
    const usuario = usuarioString ? JSON.parse(usuarioString) : null;
    if (!usuario) {
      throw new Error("No se pudo obtener el usuario");
    }
    const userId = usuario.id || null;
    if (!userId) {
      throw new Error("No se pudo obtener el ID del usuario");
    }
    const response = await UserReservas(userId);
    return response;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export function MisReservasView() {
  const [reservas, setReservas] = useState<ReservaUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReservas = async () => {
      try {
        setIsLoading(true);
        const data = await fetchUserReservas();
        setReservas(data);
      } catch (err) {
        setError(
          "Hubo un problema al cargar tus reservas. Inténtalo de nuevo más tarde."
        );
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadReservas();
  }, []);

  const { proximas, historial } = useMemo(() => {
    const ahora = new Date();
    ahora.setHours(0, 0, 0, 0); // Comparar solo fechas

    const proximas = reservas.filter(
      (r) =>
        new Date(r.fechaFin) >= ahora &&
        r.estado !== "cancelada" &&
        r.estado !== "rechazada"
    );
    const historial = reservas.filter(
      (r) =>
        new Date(r.fechaFin) < ahora ||
        r.estado === "cancelada" ||
        r.estado === "rechazada"
    );

    // Ordenar: las más cercanas primero
    proximas.sort(
      (a, b) =>
        new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime()
    );
    // Ordenar: las más recientes primero
    historial.sort(
      (a, b) =>
        new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime()
    );

    return { proximas, historial };
  }, [reservas]);

  if (isLoading) {
    return (
      <p className="text-center text-muted-foreground">
        Buscando tus reservas...
      </p>
    );
  }

  if (error) {
    return <p className="text-center text-destructive">{error}</p>;
  }

  if (reservas.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Aún no tienes reservas</h2>
        <p className="text-muted-foreground mt-2">
          ¡Anímate a reservar un salón, parqueo o el gimnasio!
        </p>
        {/* Opcional: Un botón para ir a la página de creación de reservas */}
      </div>
    );
  }

  return (
    <Tabs defaultValue="proximas" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="proximas">Próximas ({proximas.length})</TabsTrigger>
        <TabsTrigger value="historial">
          Historial ({historial.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="proximas" className="mt-6">
        {proximas.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {proximas.map((reserva) => (
              <ReservaCard key={reserva.idReserva} reserva={reserva} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-10">
            No tienes reservas próximas.
          </p>
        )}
      </TabsContent>

      <TabsContent value="historial" className="mt-6">
        {historial.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {historial.map((reserva) => (
              <ReservaCard key={reserva.idReserva} reserva={reserva} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-10">
            Tu historial de reservas está vacío.
          </p>
        )}
      </TabsContent>
    </Tabs>
  );
}
