import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Search,
  Users,
  Clock,
  Filter,
  Plus,
  Eye,
  MoreHorizontal,
} from "lucide-react";

// Types
type Area = {
  id: string;
  name: string;
  description: string;
  capacity: number;
  tags?: string[];
  isAvailable: boolean;
  pricePerHour?: number;
};

type Reservation = {
  id: string;
  areaId: string;
  name: string;
  ci?: string;
  date: string;
  timeSlot: string;
  attendees: number;
  note?: string;
  status: "confirmed" | "pending" | "cancelled";
  createdAt: string;
};

// Mock data - más simple para dashboard
const MOCK_AREAS: Area[] = [
  {
    id: "salon-1",
    name: "Salón de Eventos",
    description: "Amplio salón con sistema de audio y aire acondicionado",
    capacity: 80,
    tags: ["interior", "eventos", "audio"],
    isAvailable: true,
    pricePerHour: 150,
  },
  {
    id: "terraza-1",
    name: "Terraza Panorámica",
    description: "Terraza con vista, ideal para eventos al aire libre",
    capacity: 30,
    tags: ["exterior", "vista"],
    isAvailable: true,
    pricePerHour: 100,
  },
  {
    id: "cancha-1",
    name: "Cancha Deportiva",
    description: "Cancha multiusos para actividades deportivas",
    capacity: 20,
    tags: ["deporte", "exterior"],
    isAvailable: false,
    pricePerHour: 80,
  },
  {
    id: "quincho-1",
    name: "Quincho",
    description: "Espacio con parrilla para reuniones familiares",
    capacity: 25,
    tags: ["asado", "familia"],
    isAvailable: true,
    pricePerHour: 75,
  },
  {
    id: "piscina-1",
    name: "Área de Piscina",
    description: "Zona de piscina con área de descanso",
    capacity: 40,
    tags: ["piscina", "relajacion"],
    isAvailable: true,
    pricePerHour: 120,
  },
  {
    id: "coworking-1",
    name: "Sala de Reuniones",
    description: "Espacio para reuniones y trabajo colaborativo",
    capacity: 15,
    tags: ["trabajo", "reuniones"],
    isAvailable: true,
    pricePerHour: 50,
  },
];

const TIME_SLOTS = [
  "08:00 - 10:00",
  "10:30 - 12:30",
  "14:00 - 16:00",
  "16:30 - 18:30",
  "19:00 - 21:00",
  "21:30 - 23:30",
];

export default function AreasComunes() {
  const [areas] = useState<Area[]>(MOCK_AREAS);
  const [query, setQuery] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [open, setOpen] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "available" | "unavailable"
  >("all");

  const filtered = useMemo(() => {
    let result = areas;

    // Filter by search query
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.tags?.some((t) => t.includes(q))
      );
    }

    // Filter by availability
    if (filterStatus !== "all") {
      result = result.filter((a) =>
        filterStatus === "available" ? a.isAvailable : !a.isAvailable
      );
    }

    return result;
  }, [query, areas, filterStatus]);

  const [form, setForm] = useState<Partial<Reservation>>({
    date: new Date().toISOString().slice(0, 10),
    timeSlot: TIME_SLOTS[0],
    attendees: 1,
    status: "pending",
  });

  function openReservation(area: Area) {
    setSelectedArea(area);
    setForm({
      areaId: area.id,
      date: new Date().toISOString().slice(0, 10),
      timeSlot: TIME_SLOTS[0],
      attendees: 1,
      status: "pending",
    });
    setOpen(true);
  }

  function handleReserve() {
    if (!selectedArea) return;

    const r: Reservation = {
      id: `res-${Date.now()}`,
      areaId: selectedArea.id,
      name: (form.name || "").trim(),
      ci: form.ci,
      date: form.date || new Date().toISOString().slice(0, 10),
      timeSlot: form.timeSlot || TIME_SLOTS[0],
      attendees: form.attendees || 1,
      note: form.note,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    if (!r.name) {
      alert("Por favor ingresa el nombre del solicitante");
      return;
    }

    if (r.attendees > (selectedArea.capacity || 9999)) {
      alert(
        `El número de asistentes excede la capacidad del área (${selectedArea.capacity})`
      );
      return;
    }

    setReservations((prev) => [...prev, r]);
    setOpen(false);
    alert("Reserva registrada exitosamente");
  }

  function getReservationsForArea(areaId: string) {
    return reservations.filter(
      (r) => r.areaId === areaId && r.status === "confirmed"
    );
  }

  const availableAreas = areas.filter((a) => a.isAvailable).length;
  const totalReservations = reservations.filter(
    (r) => r.status === "confirmed"
  ).length;

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Áreas Comunes
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Gestión de espacios y reservas del edificio
          </p>
        </div>

        <Button
          onClick={() => alert("Nueva área - Función en desarrollo")}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Área
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Áreas</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {areas.length}
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-blue-600 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Disponibles</p>
                <p className="text-2xl font-semibold text-green-600">
                  {availableAreas}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ocupadas</p>
                <p className="text-2xl font-semibold text-red-600">
                  {areas.length - availableAreas}
                </p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Reservas Activas
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {totalReservations}
                </p>
              </div>
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              className="pl-9"
              placeholder="Buscar áreas por nombre o características..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <Select
          value={filterStatus}
          onValueChange={(v: any) => setFilterStatus(v)}
        >
          <SelectTrigger className="w-[200px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las áreas</SelectItem>
            <SelectItem value="available">Solo disponibles</SelectItem>
            <SelectItem value="unavailable">No disponibles</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Areas Table/Grid */}
      <div className="grid gap-4">
        {filtered.map((area) => (
          <Card key={area.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {area.name}
                      </h3>
                      {area.isAvailable ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Disponible
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-red-100 text-red-800 border-red-200"
                        >
                          Ocupada
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      {area.description}
                    </p>

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>Capacidad: {area.capacity}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>${area.pricePerHour}/hora</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {getReservationsForArea(area.id).length} reservas
                        </span>
                      </div>
                    </div>

                    {/* Tags */}
                    {area.tags && area.tags.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {area.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => alert(`Ver detalles de ${area.name}`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver
                  </Button>

                  <Button
                    size="sm"
                    disabled={!area.isAvailable}
                    onClick={() => openReservation(area)}
                    className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
                  >
                    Reservar
                  </Button>

                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Recent Reservations */}
              {getReservationsForArea(area.id).length > 0 && (
                <div className="border-t bg-gray-50 px-6 py-3">
                  <p className="text-xs font-medium text-gray-600 mb-2">
                    Próximas reservas:
                  </p>
                  <div className="space-y-1">
                    {getReservationsForArea(area.id)
                      .slice(0, 2)
                      .map((r, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs text-gray-500"
                        >
                          <span>
                            {new Date(r.date).toLocaleDateString()} •{" "}
                            {r.timeSlot}
                          </span>
                          <span>
                            {r.name} • {r.attendees} personas
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No se encontraron áreas que coincidan con los criterios de búsqueda
          </p>
        </div>
      )}

      {/* Reservation Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger />
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva Reserva - {selectedArea?.name}</DialogTitle>
            <p className="text-sm text-gray-600">
              Capacidad: {selectedArea?.capacity} personas • $
              {selectedArea?.pricePerHour}/hora
            </p>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nombre del solicitante *</Label>
                <Input
                  placeholder="Nombre completo"
                  value={form.name || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>

              <div>
                <Label>CI (opcional)</Label>
                <Input
                  placeholder="Cédula de identidad"
                  value={form.ci || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ci: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Fecha *</Label>
                <Input
                  type="date"
                  value={form.date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date: e.target.value }))
                  }
                />
              </div>

              <div>
                <Label>Horario *</Label>
                <Select
                  onValueChange={(val) =>
                    setForm((f) => ({ ...f, timeSlot: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={form.timeSlot} />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Asistentes *</Label>
                <Input
                  type="number"
                  min={1}
                  max={selectedArea?.capacity}
                  value={form.attendees || 1}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      attendees: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <Label>Observaciones</Label>
              <Input
                placeholder="Comentarios adicionales..."
                value={form.note || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, note: e.target.value }))
                }
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleReserve}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Confirmar Reserva
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
