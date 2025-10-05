// src/app/(user)/mis-reservas/page.tsx

import { MisReservasView } from "@/app/dashboard/reservas/reservasUser/MisReservasView";
import { Suspense } from "react";

export type ReservaUser = {
  idReserva: number;
  fechaInicio: string; // Formato YYYY-MM-DD
  fechaFin: string; // Formato YYYY-MM-DD
  horaInicio: string | null; // Formato HH:MM:SS
  horaFin: string | null; // Formato HH:MM:SS
  esPorHoras: boolean;
  esPorDias: boolean;
  motivo: string;
  estado: "pendiente" | "confirmada" | "rechazada" | "cancelada";
  areaNombre: string;
  pagado: boolean;
  costoTotal: number;
};
// Metadata para SEO (opcional pero recomendado)
export const metadata = {
  title: "Mis Reservas",
  description: "Consulta y gestiona tus reservas de áreas comunes.",
};

export default function MisReservasPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Mis Reservas</h1>
      <Suspense fallback={<p>Cargando tus reservas...</p>}>
        <MisReservasView />
      </Suspense>
    </div>
  );
}
