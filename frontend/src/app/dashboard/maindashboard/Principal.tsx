// src/components/Dashboard.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Asumiendo tu ruta de shadcn
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Asumiendo tu ruta de shadcn
import { Badge } from "@/components/ui/badge"; // Asumiendo tu ruta de shadcn
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  // No necesitamos PieLabelRenderProps si casteamos a `any` o Number(),
  // pero la dejaremos comentada para referencia si usas tipado estricto.
  // type PieLabelRenderProps,
} from "recharts";
import {
  DollarSign,
  CreditCard,
  CalendarCheck,
  FileText,
  AlertTriangle,
  Users,
  CalendarDays,
  // --- ICONOS NUEVOS ---
  CheckCircle, // Para facturas pagadas (Verde)
  Clock, // Para facturas pendientes (Amarillo)
  ClipboardList, // Para el total
} from "lucide-react";

// --- 1. Definición de Tipos (ACTUALIZADA con campos de mantenimiento) ---

interface KpiData {
  totalFacturasMes: number;
  ingresosMes: number;
  montoPendiente: number;
  reservasHoy: number;
  reservasHoySalones: number;
  // --- CAMPOS NUEVOS ---
  totalFacturasMantenimientoPagadas: number;
  totalFacturasMantenimientoPendientes: number;
  totalFacturasMantenimiento: number;
}

interface IngresoMensual {
  mes: string;
  ingresos: number;
  facturas: number;
}

interface ReservaPorArea {
  area: string;
  cantidad: number;
  porcentaje: number;
  [key: string]: any; // Firma de índice para recharts
}

interface EstadoPagos {
  pagadas: number;
  pendientes: number;
  vencidas: number;
  montoPagado: number;
  montoPendiente: number;
  montoVencido: number;
}

interface UltimaReserva {
  id: number;
  fecha: string;
  horario: string;
  area: string;
  tipoArea: string;
  residente: string;
  estado: string;
  costo: number;
}

interface FacturaVencer {
  id: number;
  numero: string;
  monto: number;
  fechaVencimiento: string;
  diasRestantes: number;
  departamento: string;
  residente: string;
  urgencia: "alta" | "media" | "baja";
}

interface TopArea {
  id: number;
  nombre: string;
  tipo: string;
  reservas: number;
}

interface ComparativaMensual {
  ingresosMesActual: number;
  ingresosMesAnterior: number;
  porcentajeCambioIngresos: number;
  reservasMesActual: number;
  reservasMesAnterior: number;
  porcentajeCambioReservas: number;
}

interface DashboardData {
  kpis: KpiData;
  ingresosMensuales: IngresoMensual[];
  reservasPorArea: ReservaPorArea[];
  estadoPagos: EstadoPagos;
  ultimasReservas: UltimaReserva[];
  facturasProximasVencer: FacturaVencer[];
  topAreasReservadas: TopArea[];
  comparativaMensual: ComparativaMensual;
}

// --- Colores para el gráfico de Donut ---
const COLORS = ["#8884d8", "#82ca9d", "#FFBB28", "#FF8042", "#0088FE"];

// --- Datos de ejemplo para el estado inicial/fallback (de tu JSON) ---
const INITIAL_DATA: DashboardData = {
  kpis: {
    totalFacturasMes: 6,
    ingresosMes: 875,
    montoPendiente: 1300,
    reservasHoy: 2,
    reservasHoySalones: 1,
    totalFacturasMantenimientoPagadas: 1,
    totalFacturasMantenimientoPendientes: 2,
    totalFacturasMantenimiento: 3,
  },
  ingresosMensuales: [{ mes: "Sep", ingresos: 875, facturas: 4 }],
  reservasPorArea: [
    { area: "salones", cantidad: 1, porcentaje: 33 }, // Asegura la dataKey y nameKey
    { area: "gimnasio", cantidad: 1, porcentaje: 33 },
    { area: "parqueo", cantidad: 1, porcentaje: 33 },
  ],
  estadoPagos: {
    pagadas: 4,
    pendientes: 2,
    vencidas: 0,
    montoPagado: 875,
    montoPendiente: 1300,
    montoVencido: 0,
  },
  ultimasReservas: [
    {
      id: 3,
      fecha: "2025-10-26",
      horario: "09:00 - 12:00",
      area: "PARQUEO",
      tipoArea: "parqueo",
      residente: "residente uno",
      estado: "confirmada",
      costo: 15,
    },
    {
      id: 2,
      fecha: "2025-10-25",
      horario: "22:00 - 23:00",
      area: "GIMNSASIO",
      tipoArea: "gimnasio",
      residente: "residente uno",
      estado: "confirmada",
      costo: 10,
    },
  ],
  facturasProximasVencer: [],
  topAreasReservadas: [],
  comparativaMensual: {
    ingresosMesActual: 875,
    ingresosMesAnterior: 0,
    porcentajeCambioIngresos: 100,
    reservasMesActual: 3,
    reservasMesAnterior: 0,
    porcentajeCambioReservas: 100,
  },
};

// --- Componente Principal del Dashboard ---

export const Principal: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(INITIAL_DATA); // Usar data inicial
  const [loading, setLoading] = useState(false); // Cambiado a false ya que usamos INITIAL_DATA
  const [error, setError] = useState<string | null>(null);
  const API_URL = (import.meta.env as any)?.VITE_API_URL || "";

  useEffect(() => {
    // Mantengo la lógica de fetch por si quieres usarla en producción
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/dashboard/stats`);
        setData(response.data as DashboardData);
        setError(null);
      } catch (err) {
        // En caso de error, mostramos el error pero mantenemos INITIAL_DATA
        console.error("Error fetching dashboard data:", err);
        setError(
          "No se pudieron cargar los datos del dashboard. Mostrando datos de ejemplo."
        );
        setData(INITIAL_DATA);
      } finally {
        setLoading(false);
      }
    };

    if (API_URL) {
      fetchDashboardData();
    }
  }, [API_URL]);

  if (loading) {
    return <div className="p-6">Cargando dashboard...</div>;
  }

  if (!data) {
    return <div className="p-6 text-red-500">No hay datos para mostrar.</div>;
  }

  const {
    kpis,
    comparativaMensual,
    ingresosMensuales,
    reservasPorArea,
    facturasProximasVencer,
    ultimasReservas,
    estadoPagos,
  } = data;

  // Mapeo de Componentes KPI principal
  const kpiCards = [
    {
      title: "Ingresos del Mes",
      value: `$${kpis.ingresosMes.toFixed(2)}`,
      change: `${comparativaMensual.porcentajeCambioIngresos}%`,
      changeType:
        comparativaMensual.porcentajeCambioIngresos >= 0
          ? "positivo"
          : "negativo",
      icon: <DollarSign className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Monto Pendiente",
      value: `$${kpis.montoPendiente.toFixed(2)}`,
      description: `${estadoPagos.pendientes} facturas`,
      icon: <CreditCard className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Reservas Hoy",
      value: kpis.reservasHoy.toString(),
      description: `${kpis.reservasHoySalones} en salones`,
      icon: <CalendarCheck className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Facturas Vencidas",
      value: estadoPagos.vencidas.toString(),
      description: `$${estadoPagos.montoVencido.toFixed(2)}`,
      icon: <AlertTriangle className="h-5 w-5 text-muted-foreground" />,
    },
  ];

  // Mapeo de Componentes KPI de Mantenimiento (NUEVOS)
  const mantenimientoCards = [
    {
      title: "Pagadas Mantenimiento",
      value: kpis.totalFacturasMantenimientoPagadas.toString(),
      icon: (
        <CheckCircle className="h-5 w-5 text-green-700 dark:text-green-400" />
      ),
      className:
        "bg-green-50 text-green-900 dark:bg-green-900/30 dark:text-green-200",
      textClass: "text-green-800 dark:text-green-300",
    },
    {
      title: "Pendientes Mantenimiento",
      value: kpis.totalFacturasMantenimientoPendientes.toString(),
      icon: <Clock className="h-5 w-5 text-yellow-700 dark:text-yellow-400" />,
      className:
        "bg-yellow-50 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-200",
      textClass: "text-yellow-800 dark:text-yellow-300",
    },
    {
      title: "Total Mantenimiento",
      value: kpis.totalFacturasMantenimiento.toString(),
      icon: (
        <ClipboardList className="h-5 w-5 text-blue-700 dark:text-blue-400" />
      ),
      className:
        "bg-blue-50 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200",
      textClass: "text-blue-800 dark:text-blue-300",
    },
  ];

  return (
    <div className="flex-1 space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>

      {error && (
          <AlertTriangle className="inline h-4 w-4 mr-2 text-red-500" />
        ) && <span className="text-sm text-red-500">{error}</span>}

      {/* --- 1. Fila de KPIs Principales --- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              {kpi.icon}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{kpi.value}</div>
              {kpi.change && (
                <p
                  className={`text-xs ${
                    kpi.changeType === "positivo"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {kpi.change} vs mes anterior
                </p>
              )}
              {kpi.description && (
                <p className="text-xs text-muted-foreground">
                  {kpi.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* --- 2. NUEVA FILA: KPIs de Mantenimiento (3 tarjetas coloreadas) --- */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {mantenimientoCards.map((card) => (
          <Card key={card.title} className={card.className}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
              <p className={`text-xs ${card.textClass}`}>
                Facturas de mantenimiento.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* --- 3. Fila de Gráficos Principales --- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Gráfico de Ingresos (Línea) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ingresos (Últimos Meses)</CardTitle>
            <CardDescription>
              Total de ingresos pagados por mes.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ingresosMensuales}>
                <XAxis
                  dataKey="mes"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  formatter={(value: number, name) => [
                    name === "ingresos" ? `$${value.toFixed(2)}` : value,
                    name === "ingresos" ? "Ingresos" : "Facturas",
                  ]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="ingresos"
                  stroke="#8884d8"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="facturas"
                  stroke="#82ca9d"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Reservas (Pie/Donut) */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Reservas por Área</CardTitle>
            <CardDescription>
              Distribución histórica de reservas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reservasPorArea as any}
                  dataKey="porcentaje"
                  nameKey="area"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label={(props: any) => {
                    // Mantenemos la lógica de coerción de tipos para seguridad
                    const cx = Number(props.cx || 0);
                    const cy = Number(props.cy || 0);
                    const midAngle = Number(props.midAngle || 0);
                    const innerRadius = Number(props.innerRadius || 0);
                    const outerRadius = Number(props.outerRadius || 0);
                    const percent = Number(props.percent || 0);

                    const radius =
                      innerRadius + (outerRadius - innerRadius) * 1.1;
                    const x =
                      cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                    const y =
                      cy + radius * Math.sin(-midAngle * (Math.PI / 180));

                    return (
                      <text
                        x={x}
                        y={y}
                        fill="#666"
                        textAnchor={x > cx ? "start" : "end"}
                        dominantBaseline="central"
                        fontSize={12}
                      >
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                  labelLine={false}
                >
                  {reservasPorArea.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, _name: any, entry: any) => [
                    `${value}% (${entry?.payload?.cantidad ?? 0} reservas)`,
                    entry?.payload?.area,
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* --- 4. Fila de Tablas y Listas --- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Tabla de Facturas */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Facturas Próximas a Vencer</CardTitle>
            <CardDescription>
              Facturas pendientes que vencen en los próximos días.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Residente</TableHead>
                  <TableHead>Depto.</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {facturasProximasVencer.length > 0 ? (
                  facturasProximasVencer.map((factura) => (
                    <TableRow key={factura.id}>
                      <TableCell>{factura.residente}</TableCell>
                      <TableCell>{factura.departamento}</TableCell>
                      <TableCell>${factura.monto.toFixed(2)}</TableCell>
                      <TableCell>{factura.fechaVencimiento}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            factura.urgencia === "alta"
                              ? "destructive"
                              : factura.urgencia === "media"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          Vence en {factura.diasRestantes} días
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground"
                    >
                      No hay facturas próximas a vencer.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Lista de Actividad Reciente */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas 5 reservas creadas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {ultimasReservas.slice(0, 5).map((reserva) => (
              <div key={reserva.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                    {reserva.tipoArea === "gimnasio" ? (
                      <Users className="h-5 w-5" />
                    ) : (
                      <CalendarDays className="h-5 w-5" />
                    )}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {reserva.residente}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    Reservó{" "}
                    <span className="font-semibold">{reserva.area}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {reserva.fecha} ({reserva.horario})
                  </p>
                </div>
                <div className="text-sm font-medium">
                  ${reserva.costo.toFixed(2)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
