// screens/AreaDetailScreen.tsx
//import { API_URL } from "../config/api";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// Imports de Navegación
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App"; // Ajusta la ruta
// Imports de tu lógica
import { type AreaComun, getAreaById } from "../services/areasService";
import { getCajas } from "../services/cajasService";
// Imports de Componentes
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { ArrowLeft } from "lucide-react-native";
import ReservaForm from "./ReservaFormMobile";

// Tipos (copiados de tu código web)
export interface ReservaPersonalizada {
  idReserva: number;
  fechaInicio: string;
  fechaFin: string;
  horaInicio: string | null;
  horaFin: string | null;
  numAsistentes: number;
  estado: string;
  cajaId?: number | null;
  esPorHoras: boolean;
  esPorDias: boolean;
}
const formatTime = (timeString: string | null) => {
  if (!timeString) return "";
  const [hours, minutes] = timeString.split(":");
  return `${hours}:${minutes}`;
};
const formatDateToYYYYMMDD = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};
// ⚠️ Usa la variable de entorno de Expo. Si no está definida, usamos fallback local.
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.26.6:3000";

// 1. DEFINE LAS PROPS: Recibe 'navigation' y 'route'
type Props = NativeStackScreenProps<RootStackParamList, "AreaDetail">;

export default function AreaDetailScreen({ navigation, route }: Props) {
  // 2. RECIBE EL ID desde 'route.params'
  const { areaId } = route.params;

  const [area, setArea] = useState<AreaComun | null>(null);
  const [fecha, setFecha] = useState(new Date()); // Usamos objeto Date
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [todasReservas, setTodasReservas] = useState<ReservaPersonalizada[]>(
    []
  );
  const [reservas, setReservas] = useState<ReservaPersonalizada[]>([]);
  const [loading, setLoading] = useState(true);
  const [cajones, setCajones] = useState<any[]>([]);

  // --- Lógica de Fetch (casi idéntica) ---
  const fetchArea = async () => {
    if (!areaId) return;
    try {
      const areaResponse = await getAreaById(areaId.toString()); // Usamos el ID de route
      // ... (toda tu lógica de transformación de reservas es idéntica)
      const reservasTransformadas: ReservaPersonalizada[] =
        areaResponse.reservas.map((r: any) => ({
          idReserva: r.idReserva,
          fechaInicio: r.fechaReserva,
          fechaFin: r.fechaFinReserva || r.fechaReserva,
          horaInicio: r.horaInicio,
          horaFin: r.horaFin,
          numAsistentes: r.numAsistentes,
          estado: r.estado,
          cajaId: r.cajaId || null,
          esPorHoras: !!r.horaInicio && !!r.horaFin,
          esPorDias: !!r.fechaFinReserva,
        }));

      setArea(areaResponse);
      setTodasReservas(reservasTransformadas);
      if (areaResponse.tipoArea === "parqueo") {
        const cajonesData = await getCajas();
        setCajones(cajonesData);
      }
    } catch (error) {
      console.error("Error fetching área:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArea();
  }, [areaId]);

  useEffect(() => {
    const fechaString = formatDateToYYYYMMDD(fecha);
    const filtradas = todasReservas.filter(
      (r) => fechaString >= r.fechaInicio && fechaString <= r.fechaFin
    );
    setReservas(filtradas);
  }, [fecha, todasReservas]);

  // --- Lógica de Bloques (idéntica) ---
  const esGimnasio = area?.tipoArea === "gimnasio";
  const esParqueo = area?.tipoArea === "parqueo";
  // ... (pega aquí tus funciones: generarLineaDeTiempo, toMinutes, generarBloquesGimnasio, getColorGimnasio)
  // ... (Las pego abajo para no saturar esta sección)

  // --- Render ---

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1F2937" />
      </SafeAreaView>
    );
  }

  // --- Funciones de Bloques (Copiadas de tu web) ---
  const generarLineaDeTiempo = () => {
    if (!area || esParqueo || esGimnasio) return [];
    const bloques: {
      inicio: string;
      fin: string;
      estado: "libre" | "ocupado";
    }[] = [];
    const reservasDelDia = reservas
      .filter((r) => r.esPorHoras && r.horaInicio && r.horaFin)
      .sort((a, b) => a.horaInicio!.localeCompare(b.horaInicio!));

    let cursorTiempo = area.horarioApertura;

    if (reservas.some((r) => r.esPorDias)) {
      return [
        {
          inicio: area.horarioApertura,
          fin: area.horarioCierre,
          estado: "ocupado",
        },
      ];
    }
    reservasDelDia.forEach((reserva) => {
      if (reserva.horaInicio! > cursorTiempo) {
        bloques.push({
          inicio: cursorTiempo,
          fin: reserva.horaInicio!,
          estado: "libre",
        });
      }
      bloques.push({
        inicio: reserva.horaInicio!,
        fin: reserva.horaFin!,
        estado: "ocupado",
      });
      cursorTiempo = reserva.horaFin!;
    });
    if (cursorTiempo < area.horarioCierre) {
      bloques.push({
        inicio: cursorTiempo,
        fin: area.horarioCierre,
        estado: "libre",
      });
    }
    if (bloques.length === 0 && area.horarioApertura) {
      bloques.push({
        inicio: area.horarioApertura,
        fin: area.horarioCierre,
        estado: "libre",
      });
    }
    return bloques;
  };
  const toMinutes = (h: string) => {
    const [hh, mm] = h.split(":").map(Number);
    return hh * 60 + mm;
  };
  const generarBloquesGimnasio = () => {
    if (!area || !esGimnasio) return [];
    const bloques: { hora: string; ocupacion: number }[] = [];
    const abrir = parseInt(area.horarioApertura.split(":")[0]);
    const cerrar = parseInt(area.horarioCierre.split(":")[0]);
    for (let h = abrir; h < cerrar; h++) {
      const bloqueInicio = `${String(h).padStart(2, "0")}:00`;
      const bloqueFin = `${String(h + 1).padStart(2, "0")}:00`;
      let ocupacion = 0;
      reservas.forEach((r) => {
        if (!r.horaInicio || !r.horaFin) return;
        const inicioReserva = toMinutes(r.horaInicio);
        const finReserva = toMinutes(r.horaFin);
        const inicioBloque = toMinutes(bloqueInicio);
        const finBloque = toMinutes(bloqueFin);
        if (inicioReserva < finBloque && finReserva > inicioBloque) {
          ocupacion += r.numAsistentes;
        }
      });
      bloques.push({ hora: `${bloqueInicio} - ${bloqueFin}`, ocupacion });
    }
    return bloques;
  };
  const bloquesDinamicos = esGimnasio
    ? generarBloquesGimnasio()
    : generarLineaDeTiempo();
  const getColorGimnasio = (ocupacion: number) => {
    if (!area) return styles.bloqueGimVerde;
    const porcentaje = (ocupacion / area.capacidadMaxima) * 100;
    if (porcentaje >= 100) return styles.bloqueGimRojo;
    if (porcentaje >= 60) return styles.bloqueGimAmarillo;
    return styles.bloqueGimVerde;
  };
  // --- Fin Funciones de Bloques ---

  // --- Handler del DatePicker ---
  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || fecha;
    setShowDatePicker(Platform.OS === "ios");
    setFecha(currentDate);
  };

  // Normalize image similar to AreaCard: soporta string/array/object
  const rawImage = (area as any)?.imageUrl;
  function resolvePath(p: any) {
    if (p === null || p === undefined) return "";
    const s = String(p);
    if (s.startsWith("http")) return s;
    if (s.startsWith("/")) return `${API_URL}${s}`;
    if (s.startsWith("uploads/")) return `${API_URL}/${s}`;
    return `${API_URL}/uploads/${s}`;
  }
  function resolveObjectPath(obj: any) {
    if (!obj) return "";
    const candidates = [obj.url, obj.path, obj.filename, obj.fileName, obj.src];
    for (const c of candidates)
      if (c && typeof c === "string") return resolvePath(c);
    return "";
  }
  let headerImageUrl = "";
  if (!rawImage) headerImageUrl = "";
  else if (Array.isArray(rawImage) && rawImage.length > 0) {
    const v = rawImage[0];
    headerImageUrl =
      typeof v === "string" ? resolvePath(v) : resolveObjectPath(v);
  } else if (typeof rawImage === "string")
    headerImageUrl = resolvePath(rawImage);
  else if (typeof rawImage === "object")
    headerImageUrl = resolveObjectPath(rawImage);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView>
        {/* Botón Volver (reemplaza tu setEditState) */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#1F2937" />
          <Text style={styles.backButtonText}>Volver a la lista</Text>
        </TouchableOpacity>

        <View style={styles.pageContainer}>
          {/* CABECERA */}
          <View style={styles.headerContainer}>
            {headerImageUrl ? (
              <Image
                source={{ uri: headerImageUrl }}
                style={styles.headerImage}
              />
            ) : (
              <View style={[styles.headerImage, styles.imagePlaceholder]}>
                <Text style={styles.placeholderText}>No hay imagen</Text>
              </View>
            )}
            <View style={styles.headerInfo}>
              <Text style={styles.title}>{area?.nombreAreaComun}</Text>
              <Text style={styles.description}>{area?.descripcion}</Text>
              <View style={styles.infoGrid}>
                {/* ... (resto de la info, adaptada) ... */}
                <Text style={styles.infoText}>
                  <Text style={styles.infoLabel}>Costo: </Text>
                  {area?.costoBase} Bs{" "}
                  {esGimnasio ? "/día" : esParqueo ? "/día" : "/hora"}
                </Text>
                <Text style={styles.infoText}>
                  <Text style={styles.infoLabel}>Horario: </Text>
                  {esParqueo
                    ? "Disponible 24 horas"
                    : `${formatTime(
                        area?.horarioApertura || ""
                      )} - ${formatTime(area?.horarioCierre || "")}`}
                </Text>
              </View>
            </View>
          </View>

          {/* DISPONIBILIDAD */}
          <View style={styles.dispoCard}>
            <Text style={styles.dispoTitle}>Disponibilidad</Text>
            <View style={styles.datePickerContainer}>
              <Text style={styles.dateLabel}>Selecciona una fecha:</Text>
              {/* Botón para abrir el picker */}
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={styles.datePickerButton}
              >
                <Text style={styles.datePickerButtonText}>
                  {formatDateToYYYYMMDD(fecha)}
                </Text>
              </TouchableOpacity>
              {/* El componente DatePicker (Modal en Android) */}
              {showDatePicker && (
                <DateTimePicker
                  value={fecha}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                />
              )}
            </View>

            {/* Grid de Disponibilidad */}
            <View style={styles.bloquesContainer}>
              {esParqueo
                ? // Lógica de Parqueo
                  cajones.map((cajon) => {
                    const reservasDelCajonHoy = reservas.filter(
                      (r) =>
                        r.cajaId === cajon.idParqueoCaja &&
                        r.estado !== "cancelada"
                    );
                    return (
                      <View key={cajon.idParqueoCaja} style={styles.cajonCard}>
                        <Text style={styles.cajonTitle}>
                          Cajón {cajon.numeroCaja}
                        </Text>
                        {reservasDelCajonHoy.length > 0 ? (
                          <View>
                            <Text style={styles.cajonOcupadoLabel}>
                              Ocupado:
                            </Text>
                            {reservasDelCajonHoy.map((r) => (
                              <View
                                key={r.idReserva}
                                style={styles.cajonOcupado}
                              >
                                <Text style={styles.cajonOcupadoText}>
                                  {r.esPorDias
                                    ? "Todo el día"
                                    : `${formatTime(
                                        r.horaInicio
                                      )} - ${formatTime(r.horaFin)}`}
                                </Text>
                              </View>
                            ))}
                          </View>
                        ) : (
                          <View style={styles.cajonLibre}>
                            <Text style={styles.cajonLibreText}>
                              ✅ Libre todo el día
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  })
                : esGimnasio
                ? // Lógica de Gimnasio
                  (
                    bloquesDinamicos as { hora: string; ocupacion: number }[]
                  ).map((b, idx) => (
                    <View
                      key={idx}
                      style={[styles.bloqueBase, getColorGimnasio(b.ocupacion)]}
                    >
                      <Text style={styles.bloqueGimHora}>
                        {formatTime(b.hora.split(" - ")[0])} -{" "}
                        {formatTime(b.hora.split(" - ")[1])}
                      </Text>
                      <Text style={styles.bloqueGimOcupacion}>
                        Ocupación: {b.ocupacion}/{area?.capacidadMaxima}
                      </Text>
                    </View>
                  ))
                : // Lógica de Salones
                  (
                    bloquesDinamicos as {
                      inicio: string;
                      fin: string;
                      estado: "libre" | "ocupado";
                    }[]
                  ).map((b, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.bloqueBase,
                        b.estado === "libre"
                          ? styles.bloqueLibre
                          : styles.bloqueOcupado,
                      ]}
                    >
                      <Text style={styles.bloqueEstadoText}>
                        {b.estado === "libre" ? "✅ Disponible" : "❌ Ocupado"}
                      </Text>
                      <Text style={styles.bloqueHoraText}>
                        {formatTime(b.inicio)} - {formatTime(b.fin)}
                      </Text>
                    </View>
                  ))}
            </View>
          </View>

          {/* FORMULARIO DE RESERVA */}
          {/* <View style={styles.debugBanner}>
            <Text style={styles.debugText}>{`DEBUG: areaLoaded=${!!area}  areaId=${areaId}  cajones=${cajones.length}`}</Text>
          </View> */}
          <ReservaForm
            area={area!}
            fechaInicial={formatDateToYYYYMMDD(fecha)}
            areaComunId={areaId}
            // setState={setEditState} // Ya no se usa
            refresh={fetchArea}
            cajones={cajones}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- ESTILOS ---
// (Estos son una traducción directa de tu Tailwind)
// --- ESTILOS REVISADOS ---
const styles = StyleSheet.create({
  // --- Estilos Base ---
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB", // Fondo más suave
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  pageContainer: {
    padding: 16,
    paddingBottom: 40, // Espacio al final
  },

  // --- Botón Volver ---
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF", // Fondo blanco para el botón
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButtonText: {
    fontSize: 16,
    color: "#1F2937",
    marginLeft: 8,
    fontWeight: "500",
  },

  // --- Cabecera y Detalles de Área ---
  headerContainer: {
    flexDirection: "column",
    marginBottom: 20, // Más espacio debajo
  },
  headerImage: {
    width: "100%",
    height: 220, // Un poco más bajo para mejor vista móvil
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    marginBottom: 16, // Espacio debajo de la imagen
  },
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#6b7280",
    fontSize: 14,
    fontStyle: "italic",
  },
  headerInfo: {
    flex: 1,
    gap: 10,
    paddingHorizontal: 4, // Pequeño padding para centrar mejor el texto
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#111827",
  },
  description: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 22,
  },
  infoGrid: {
    marginTop: 10,
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: "#374151",
  },
  infoLabel: {
    fontWeight: "700", // Más peso
    color: "#111827",
  },

  // --- Tarjeta de Disponibilidad (DispoCard) ---
  dispoCard: {
    borderRadius: 12,
    // Eliminamos el borde y usamos una sombra más marcada
    backgroundColor: "#FFFFFF",
    padding: 16,
    gap: 20, // Más espacio entre título, picker y bloques
    marginBottom: 20, // Espacio antes del formulario

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dispoTitle: {
    fontSize: 22, // Título más grande
    fontWeight: "700",
    textAlign: "center",
    color: "#1F2937",
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  datePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Espacio entre label y botón
    paddingHorizontal: 8,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  datePickerButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#9CA3AF", // Borde más visible
  },
  datePickerButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },

  // --- Grid de Disponibilidad (Bloques y Cajones) ---
  bloquesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10, // Espacio entre ítems
    justifyContent: "space-between", // Distribuye los elementos horizontalmente
    paddingHorizontal: 5, // Pequeño padding interno
  },

  // Estilos Cajones (Parqueo)
  cajonCard: {
    width: "48%", // Asegura 2 columnas con espacio
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    gap: 8,
    marginBottom: 10, // Espacio inferior para el wrap
  },
  cajonTitle: {
    fontWeight: "800", // Más peso
    textAlign: "center",
    fontSize: 17,
    color: "#1F2937",
  },
  cajonOcupadoLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#B91C1C", // Red más oscuro
    textAlign: "center",
  },
  cajonOcupado: {
    backgroundColor: "#FEE2E2",
    padding: 6,
    borderRadius: 6,
    marginTop: 4,
  },
  cajonOcupadoText: {
    color: "#991B1B",
    fontSize: 12,
    textAlign: "center",
  },
  cajonLibre: {
    backgroundColor: "#D1FAE5", // Green-100
    padding: 10,
    borderRadius: 6,
  },
  cajonLibreText: {
    color: "#065F46",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "600",
  },

  // Estilos Bloques (Salón / Gimnasio)
  bloqueBase: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "48%", // Asegura 2 columnas con espacio
    marginBottom: 10, // Espacio inferior para el wrap
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  bloqueLibre: {
    backgroundColor: "#D1FAE5",
    borderColor: "#34D399",
  },
  bloqueOcupado: {
    backgroundColor: "#FEE2E2",
    borderColor: "#F87171",
  },
  bloqueEstadoText: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#1F2937",
    marginBottom: 4,
  },
  bloqueHoraText: {
    fontSize: 13,
    color: "#4B5563",
  },

  // Estilos Gimnasio (Color más contrastante para la ocupación)
  bloqueGimVerde: {
    backgroundColor: "#ECFDF5", // Fondo más claro
    borderColor: "#34D399",
  },
  bloqueGimAmarillo: {
    backgroundColor: "#FEF3C7", // Fondo más claro
    borderColor: "#FBBF24",
  },
  bloqueGimRojo: {
    backgroundColor: "#FEF2F2", // Fondo más claro
    borderColor: "#F87171",
  },
  bloqueGimHora: {
    fontWeight: "700",
    fontSize: 14,
    color: "#1F2937",
    marginBottom: 2,
  },
  bloqueGimOcupacion: {
    fontSize: 12,
    color: "#4B5563",
  },
  // Debug
  debugBanner: {
    backgroundColor: "#FFFBEB", // bg-amber-50
    padding: 8,
    borderRadius: 4,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B", // border-amber-500
  },
  debugText: {
    color: "#92400E",
    fontSize: 12,
    fontWeight: "600",
  },
});

/* const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: "#1F2937",
    marginLeft: 8,
  },
  pageContainer: {
    padding: 16,
  },
  debugText: {
    color: "#92400E",
    fontSize: 12,
    fontWeight: "600",
  },
  headerContainer: {
    flexDirection: "column",
  },
  headerImage: {
    width: "100%",
    height: 256, // h-64
    borderRadius: 12, // rounded-xl
    backgroundColor: "#E5E7EB",
  },
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#6b7280",
    fontSize: 14,
  },
  headerInfo: {
    flex: 1,
    paddingTop: 16,
    gap: 12,
  },
  title: {
    fontSize: 28, // text-3xl
    fontWeight: "bold",
    color: "#111827",
  },
  description: {
    fontSize: 16,
    color: "#4B5563", // text-muted-foreground
    lineHeight: 24,
  },
  infoGrid: {
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#374151",
  },
  infoLabel: {
    fontWeight: "600",
    color: "#111827",
  },
  dispoCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    padding: 10,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dispoTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    color: "#111827",
  },
  datePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  datePickerButton: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  datePickerButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  bloquesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  // Estilos Cajones (Parqueo)
  cajonCard: {
    width: "45%", // Aprox cols-2
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FAFAFA",
    gap: 8,
  },
  cajonTitle: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  cajonOcupadoLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#DC2626", // text-red-600
  },
  cajonOcupado: {
    backgroundColor: "#FEE2E2", // bg-red-100
    padding: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  cajonOcupadoText: {
    color: "#991B1B", // text-red-800
    fontSize: 12,
    textAlign: "center",
  },
  cajonLibre: {
    backgroundColor: "#D1FAE5", // bg-green-100
    padding: 8,
    borderRadius: 4,
  },
  cajonLibreText: {
    color: "#065F46", // text-green-800
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
  // Estilos Bloques (Salón / Gimnasio)
  bloqueBase: {
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    width: "45%", // Aprox cols-2
  },
  bloqueLibre: {
    backgroundColor: "#D1FAE5", // bg-green-100
  },
  bloqueOcupado: {
    backgroundColor: "#FEE2E2", // bg-red-100
  },
  bloqueEstadoText: {
    fontWeight: "bold",
  },
  bloqueHoraText: {
    fontSize: 12,
  },
  // Estilos Gimnasio
  bloqueGimVerde: {
    backgroundColor: "#A7F3D0",
  },
  bloqueGimAmarillo: {
    backgroundColor: "#FDE047",
  },
  bloqueGimRojo: {
    backgroundColor: "#F87171",
  },
  bloqueGimHora: {
    fontWeight: "bold",
  },
  bloqueGimOcupacion: {
    fontSize: 12,
  },
});
 */
