"use client";
import React, { useEffect, useMemo, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getFacturasByUsuario } from "@/services/facturas.services";
import { FacturaMantPDF } from "../genFactMant/FacturaMantPDF";
import { type facturas } from "../gestiondeFacturasAdmin/ColumnsFacturas";
//import para el modal
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PagoQR from "../../pagos/PagoQR";
import { set } from "date-fns";

export default function FacturasUser() {
  const [facturas, setFacturas] = useState<facturas[]>([]);
  const [filter, setFilter] = useState<"todos" | "mantenimiento" | "reservas">(
    "todos"
  );
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPdfId, setLoadingPdfId] = useState<number | null>(null);

  const usuarioString = localStorage.getItem("user");
  const usuario = usuarioString ? JSON.parse(usuarioString) : null;
  const id = usuario ? usuario.id : null;
  const [idFact, setIdFact] = useState(0);
  const [monto, setMonto] = useState(0);

  useEffect(() => {
    let mounted = true;
    const fetchData = async (mounted: any) => {
      setLoading(true);
      try {
        const res = await getFacturasByUsuario(id);
        if (!mounted) return;
        setFacturas(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error("Error fetching facturas", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData(mounted);
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return facturas.filter((f) => {
      if (filter === "mantenimiento" && f.departamentoId === null) return false;
      if (filter === "reservas" && f.departamentoId !== null) return false;
      if (q.trim()) {
        const s = q.toLowerCase();
        return (
          (f.nroFactura || "").toLowerCase().includes(s) ||
          (f.estado || "").toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [facturas, filter, q]);

  const [loadingPdf, setLoadingPdf] = useState(false);
  const [open, setOpen] = useState(false);

  // JavaScript / React: handler para abrir PDF en nueva ventana sin bloqueo de popup
  const handleOpenPdf = async (data: facturas) => {
    try {
      setLoadingPdf(true);
      // 🧠 Generar PDF y crear blob
      const doc = <FacturaMantPDF factura={data} />;
      const blob = await pdf(doc).toBlob();

      // 🔗 Crear URL del PDF y abrir en nueva pestaña (sin bloqueo)
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");

      // 🔥 Liberar el blob después de 1 minuto
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      console.error("Error generando/abriendo PDF:", err);
    } finally {
      setLoadingPdf(false);
    }
  };

  const handlePagar = () => {
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-semibold">Mis Facturas</h2>

        <div className="flex gap-2 items-center">
          <div className="hidden sm:flex gap-2">
            <Button
              variant={filter === "todos" ? "default" : "ghost"}
              onClick={() => setFilter("todos")}
            >
              Todos
            </Button>
            <Button
              variant={filter === "mantenimiento" ? "default" : "ghost"}
              onClick={() => setFilter("mantenimiento")}
            >
              Mantenimiento
            </Button>
            <Button
              variant={filter === "reservas" ? "default" : "ghost"}
              onClick={() => setFilter("reservas")}
            >
              Reservas
            </Button>
          </div>

          <Input
            placeholder="Buscar número o estado..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full sm:w-64"
          />
        </div>
      </header>

      {loading ? (
        <div className="text-center py-8">Cargando facturas...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No hay facturas que coincidan.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((f) => (
            <article
              key={f.idFactura}
              className="border rounded-lg p-4 bg-white/60 dark:bg-slate-800 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium">
                    Factura #{f.nroFactura}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Emitida: {new Date(f.fechaEmision).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">
                    {Number(f.montoTotal).toLocaleString(undefined, {
                      style: "currency",
                      currency: "USD",
                    })}
                  </p>
                  <div className="mt-2">
                    {f.estado === "pagada" ? (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-800"
                      >
                        Pagado
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-800"
                      >
                        Pendiente
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm text-muted-foreground">
                <p>
                  Vencimiento:{" "}
                  {f.fechaVencimiento
                    ? new Date(f.fechaVencimiento).toLocaleDateString()
                    : "—"}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleOpenPdf(f)}
                  className="bg-gray-300 hover:bg-gray-200 cursor-pointer"
                >
                  {loadingPdfId === f.idFactura ? "Abriendo..." : "Ver factura"}
                </Button>
                {(f.estado === "pendiente" || f.estado === "vencida") && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => {
                      /* aquí puedes abrir detalle en app si quieres */
                      setOpen(true);
                      setIdFact(f.idFactura);
                      setMonto(f.montoTotal);
                    }}
                  >
                    Pagar factura
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      {/* Diálogo de confirmación para cancelar */}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pago por QR</AlertDialogTitle>
            <AlertDialogDescription>
              Completa el proceso para realizar el pago.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <PagoQR
            usuarioId={id}
            facturaId={idFact}
            monto={monto}
            setFacturas={setFacturas}
          />
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Volver
            </AlertDialogCancel>
            {/* <AlertDialogAction
              onClick={handlePagar}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white cursor-pointer"
            >
              Realizar Pago
            </AlertDialogAction> */}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
