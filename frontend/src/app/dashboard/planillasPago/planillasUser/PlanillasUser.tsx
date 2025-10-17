import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getPlanillasPersonal } from "@/services/planillasServices";
import { uploadQR } from "@/services/personalServices";
import { toast } from "sonner";

interface Planilla {
  idPlanilla: number;
  fechaGeneracion?: string;
  tipo: string;
  pagado: boolean;
  idPersonal: number;
  nombrePersonal: string;
  telefonoPersonal: string;
  emailPersonal: string;
  funcion: string;
  salario?: string;
  reciboUrl?: string;
}

export default function PlanillasUser() {
  const [planillas, setPlanillas] = useState<Planilla[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  // modal planilla
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlanilla, setSelectedPlanilla] = useState<Planilla | null>(
    null
  );

  // modal subir imagen
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const usuarioString =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const usuario = usuarioString ? JSON.parse(usuarioString) : null;
  const usuarioId = usuario?.id || usuario?.idUsuario || null;

  useEffect(() => {
    let mounted = true;
    const fetchPlanillas = async () => {
      setLoading(true);
      try {
        let res: Planilla[] = [];
        if (typeof getPlanillasPersonal === "function") {
          res = await getPlanillasPersonal(usuarioId);
        } else {
          const r = await fetch(
            `/api/planillas/personal?usuarioId=${usuarioId}`
          );
          res = (await r.json()) || [];
        }
        if (mounted) setPlanillas(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error("Error fetching planillas", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (usuarioId) fetchPlanillas();
    return () => {
      mounted = false;
    };
  }, [usuarioId]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return planillas;
    return planillas.filter((p) => {
      return (
        (p.nombrePersonal || "").toLowerCase().includes(s) ||
        (p.emailPersonal || "").toLowerCase().includes(s) ||
        (p.telefonoPersonal || "").toLowerCase().includes(s) ||
        (p.funcion || "").toLowerCase().includes(s) ||
        (p.fechaGeneracion || "").toLowerCase().includes(s)
      );
    });
  }, [planillas, q]);

  const openModal = (p: Planilla) => {
    setSelectedPlanilla(p);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedPlanilla(null);
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get("imagen") as File | null;

    if (!file) {
      alert("Selecciona una imagen");
      return;
    }

    try {
      // uploadQR devuelve response.data directamente
      const data = await uploadQR(usuarioId, file);

      // Aquí ya puedes usar data.message, data.personal, etc.
      setUploadModalOpen(false);
      toast.success(data.message, {
        position: "top-right",
        duration: 4000,
      });
    } catch (err: any) {
      console.error(err);

      // Axios lanza error en err.response.data
      toast.error(err.response?.data?.message || "Error subiendo la imagen", {
        position: "top-right",
        duration: 4000,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* ENCABEZADO */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Mis Planillas</h2>
          <p className="text-sm text-muted-foreground">
            Aquí verás tus planillas de pago de sueldos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Input
            placeholder="Buscar por nombre, función, fecha..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full sm:w-72"
          />
          <Button onClick={() => setUploadModalOpen(true)}>Subir Imagen</Button>
        </div>
      </header>

      {/* LISTADO DE PLANILLAS */}
      {loading ? (
        <div className="text-center py-8">Cargando planillas...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No se encontraron planillas.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <article
              key={p.idPlanilla}
              className="border rounded-lg p-4 bg-card text-card-foreground shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium">{p.nombrePersonal}</h3>
                  <p className="text-sm text-muted-foreground">
                    {p.funcion} · {p.telefonoPersonal}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {p.emailPersonal}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">
                    {p.salario
                      ? Number(p.salario).toLocaleString(undefined, {
                          style: "currency",
                          currency: "USD",
                        })
                      : "—"}
                  </p>
                  <div className="mt-2">
                    {p.pagado ? (
                      <Badge className="bg-green-50 text-green-800">
                        Pagado
                      </Badge>
                    ) : (
                      <Badge className="bg-orange-50 text-orange-800">
                        Pendiente
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm text-muted-foreground">
                <p>Generada: {p.fechaGeneracion}</p>
                <p>
                  Tipo: <span className="font-medium">{p.tipo}</span>
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => openModal(p)}
                  disabled={loadingId === p.idPlanilla}
                >
                  Ver planilla
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* MODAL DETALLES DE PLANILLA MEJORADO */}
      {modalOpen && selectedPlanilla && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-[95%] max-w-3xl p-6 animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <header className="flex items-start justify-between border-b pb-4">
              <div>
                <h3 className="text-xl font-semibold">
                  Planilla del {selectedPlanilla.fechaGeneracion}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedPlanilla.nombrePersonal} · {selectedPlanilla.funcion}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeModal}
                className="hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </Button>
            </header>

            {/* MODAL DETALLES DE PLANILLA SIN EMOJIS */}
            {modalOpen && selectedPlanilla && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  onClick={closeModal}
                />
                <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-[95%] max-w-3xl p-6 animate-in fade-in zoom-in duration-200">
                  {/* Header */}
                  <header className="flex items-start justify-between border-b pb-4">
                    <div>
                      <h3 className="text-xl font-semibold">
                        Planilla del{" "}
                        {selectedPlanilla.fechaGeneracion}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedPlanilla.nombrePersonal} ·{" "}
                        {selectedPlanilla.funcion}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={closeModal}
                      className="hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      ✕
                    </Button>
                  </header>

                  {/* Body */}
                  <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3 text-sm">
                      {/* <div>
                        <p className="font-medium">Fecha de generación</p>
                        <p className="text-muted-foreground">
                          {selectedPlanilla.fechaGeneracion
                            ? new Date(
                                selectedPlanilla.fechaGeneracion
                              ).toLocaleString()
                            : "—"}
                        </p>
                      </div> */}

                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-muted-foreground">
                          {selectedPlanilla.emailPersonal}
                        </p>
                      </div>

                      <div>
                        <p className="font-medium">Teléfono</p>
                        <p className="text-muted-foreground">
                          {selectedPlanilla.telefonoPersonal}
                        </p>
                      </div>

                      <div>
                        <p className="font-medium">Función</p>
                        <p className="text-muted-foreground">
                          {selectedPlanilla.funcion}
                        </p>
                      </div>

                      <div>
                        <p className="font-medium">Salario</p>
                        <p className="text-muted-foreground">
                          {selectedPlanilla.salario
                            ? Number(selectedPlanilla.salario).toLocaleString(
                                undefined,
                                {
                                  style: "currency",
                                  currency: "USD",
                                }
                              )
                            : "—"}
                        </p>
                      </div>

                      <div>
                        <p className="font-medium">Estado</p>
                        <p
                          className={`font-semibold ${
                            selectedPlanilla.pagado
                              ? "text-green-600 dark:text-green-400"
                              : "text-orange-600 dark:text-orange-400"
                          }`}
                        >
                          {selectedPlanilla.pagado ? "Pagado" : "Pendiente"}
                        </p>
                      </div>
                    </div>

                    {/* Imagen del comprobante */}
                    <div className="flex flex-col items-center justify-center">
                      {selectedPlanilla.reciboUrl ? (
                        <div className="flex flex-col items-center">
                          <p className="text-sm text-muted-foreground mb-2">
                            Comprobante adjunto:
                          </p>
                          <img
                            src={`${import.meta.env.VITE_API_URL}/${
                              selectedPlanilla.reciboUrl
                            }`}
                            alt="Comprobante de pago"
                            className="w-64 h-64 object-cover rounded-lg border shadow-md"
                          />
                          <a
                            href={`${import.meta.env.VITE_API_URL}/${
                              selectedPlanilla.reciboUrl
                            }`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs mt-2 text-blue-600 hover:underline"
                          >
                            Ver en nueva pestaña
                          </a>
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground border rounded-lg p-10">
                          <p>No hay comprobante disponible</p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Footer */}
                  <footer className="mt-6 border-t pt-4 flex justify-end">
                    <Button variant="outline" onClick={closeModal}>
                      Cerrar
                    </Button>
                  </footer>
                </div>
              </div>
            )}

            {/* Footer */}
            <footer className="mt-6 border-t pt-4 flex justify-end">
              <Button variant="outline" onClick={closeModal}>
                Cerrar
              </Button>
            </footer>
          </div>
        </div>
      )}

      {/* 🟢 MODAL DE SUBIDA DE IMAGEN */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setUploadModalOpen(false)}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-lg shadow-lg w-[95%] max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Subir Imagen</h3>

            <form onSubmit={handleUpload}>
              <Input type="file" accept="image/*" name="imagen" />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUploadModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Subir</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
