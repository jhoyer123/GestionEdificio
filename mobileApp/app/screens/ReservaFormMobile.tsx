import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useAuth } from "../components/AuthContext";
import { createReserva } from "../services/reservaService";
import { createFacturaForReserva } from "../services/facturaService";
import PagoQRMobile from "../components/PagoQRMobile";

interface ReservaFormProps {
  setState?: (s: any) => void;
  refresh?: () => void;
  area: any;
  fechaInicial: string;
  areaComunId: number | null;
  cajones?: any[];
}

const toMinutes = (timeStr: string | null): number => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

const formatDateToYYYYMMDD = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

const parseDateFromYYYYMMDD = (s?: string) => {
  if (!s) return new Date();
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

export default function ReservaForm({
  area,
  fechaInicial,
  areaComunId,
  refresh,
  cajones = [],
}: ReservaFormProps) {
  // DEBUG: mount log to verify the component renders at runtime
  React.useEffect(() => {
    try {
      console.log("[ReservaForm] mounted", {
        areaComunId,
        areaName: area?.nombreAreaComun,
      });
    } catch (e) {
      console.log("[ReservaForm] mounted (error reading area)", e);
    }
  }, []);
  const { user } = useAuth();
  const usuarioId = user?.id ?? null;

  const [modalidad, setModalidad] = useState<"horas" | "dias">("horas");
  const [fecha, setFecha] = useState<string>(fechaInicial);
  const [fechaFin, setFechaFin] = useState<string>(fechaInicial);
  const [horaInicio, setHoraInicio] = useState<string>("");
  const [horaFin, setHoraFin] = useState<string>("");
  
  const [motivo, setMotivo] = useState<string>(
    area?.tipoArea === "gimnasio" ? "Ejercicio" : ""
  );
  const [numAsistentes, setNumAsistentes] = useState<string>(
    area?.tipoArea === "gimnasio" ? "1" : ""
  );
  const [cajaSeleccionada, setCajaSeleccionada] = useState<string>("");
  const [cajonesDisponibles, setCajonesDisponibles] = useState<any[]>([]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<"date" | "time">("date");
  const [datePickerTarget, setDatePickerTarget] = useState<
    "inicio" | "fin" | "fechaFin"
  >("inicio");

  const [loading, setLoading] = useState(false);
  const [costoAprox, setCostoAprox] = useState<number>(0);
  const [showCajonesModal, setShowCajonesModal] = useState(false);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [facturaId, setFacturaId] = useState<number | null>(null);
  const [reservaIdState, setReservaIdState] = useState<number | null>(null);

  useEffect(() => {
    if (area.tipoArea !== "parqueo") return;

    if (modalidad === "dias") {
      const disponibles = cajones.filter((cajon) => {
        const tieneConflicto = area.reservas?.some((r: any) => {
          if (r.cajaId !== cajon.idParqueoCaja || r.estado === "cancelada")
            return false;
          const inicioReserva = new Date(r.fechaReserva);
          const finReserva = new Date(r.fechaFinReserva || r.fechaReserva);
          const inicioSeleccion = new Date(fecha);
          const finSeleccion = new Date(fechaFin);
          return inicioSeleccion <= finReserva && finSeleccion >= inicioReserva;
        });
        return !tieneConflicto;
      });
      setCajonesDisponibles(disponibles);
    } else if (modalidad === "horas" && horaInicio && horaFin) {
      const inicioSeleccionado = toMinutes(horaInicio);
      const finSeleccionado = toMinutes(horaFin);
      if (inicioSeleccionado >= finSeleccionado) {
        setCajonesDisponibles([]);
        return;
      }
      const disponibles = cajones.filter((cajon) => {
        const tieneConflicto = area.reservas?.some((r: any) => {
          if (
            r.cajaId !== cajon.idParqueoCaja ||
            r.fechaReserva !== fecha ||
            r.estado === "cancelada"
          )
            return false;
          if (!r.horaInicio) return true;
          const inicioExistente = toMinutes(r.horaInicio);
          const finExistente = toMinutes(r.horaFin);
          return (
            inicioSeleccionado < finExistente &&
            finSeleccionado > inicioExistente
          );
        });
        return !tieneConflicto;
      });
      setCajonesDisponibles(disponibles);
    } else {
      setCajonesDisponibles([]);
    }
    setCajaSeleccionada("");
  }, [
    area.reservas,
    cajones,
    fecha,
    fechaFin,
    horaInicio,
    horaFin,
    modalidad,
    area.tipoArea,
  ]);

  useEffect(() => {
    const costoPorHora = Number(area.costoBase) || 0;
    if (!area.costoBase || isNaN(costoPorHora) || costoPorHora <= 0) {
      setCostoAprox(0);
      return;
    }
    let costoCalculado = 0;
    if (modalidad === "horas") {
      const inicioMin = toMinutes(horaInicio);
      const finMin = toMinutes(horaFin);
      if (horaInicio && horaFin && finMin > inicioMin) {
        if (area.tipoArea === "gimnasio") {
          costoCalculado = costoPorHora;
        } else {
          const duracionHoras = (finMin - inicioMin) / 60;
          costoCalculado = Math.ceil(duracionHoras) * costoPorHora;
        }
      }
    } else if (modalidad === "dias") {
      const fechaIni = new Date(fecha);
      const fechaFinReserva = new Date(fechaFin);
      if (fecha && fechaFin && fechaFinReserva >= fechaIni) {
        if (area.tipoArea === "gimnasio") {
          costoCalculado = costoPorHora;
        } else {
          const dias =
            Math.round(
              (fechaFinReserva.getTime() - fechaIni.getTime()) /
                (1000 * 60 * 60 * 24)
            ) + 1;
          const aperturaMin = toMinutes(area.horarioApertura);
          const cierreMin = toMinutes(area.horarioCierre);
          let horasOperacion = 24;
          if (cierreMin > aperturaMin)
            horasOperacion = (cierreMin - aperturaMin) / 60;
          costoCalculado = dias * horasOperacion * costoPorHora;
          costoCalculado = Math.round(costoCalculado);
        }
      }
    }
    setCostoAprox(isNaN(costoCalculado) ? 0 : Math.max(0, costoCalculado));
  }, [modalidad, horaInicio, horaFin, fecha, fechaFin, area]);

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const current = selectedDate || new Date();
    setShowDatePicker(Platform.OS === "ios");
    if (datePickerMode === "date") {
      const localIso = formatDateToYYYYMMDD(current);
      if (datePickerTarget === "fechaFin") setFechaFin(localIso);
      else setFecha(localIso);
    } else {
      // time
      const hh = String(current.getHours()).padStart(2, "0");
      const mm = String(current.getMinutes()).padStart(2, "0");
      const timeStr = `${hh}:${mm}`;
      if (datePickerTarget === "fin") setHoraFin(timeStr);
      else setHoraInicio(timeStr);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      console.log("[ReservaForm] submit payload about to be built", {
        fecha,
        fechaFin,
        horaInicio,
        horaFin,
        modalidad,
        cajaSeleccionada,
      });
      const payload: any = {
        usuarioId,
        areaComunId,
        fechaReserva: fecha,
      };
      if (area.tipoArea === "parqueo") {
        if (!cajaSeleccionada) {
          Alert.alert(
            "Selecciona un cajón",
            "Debes elegir un cajón disponible"
          );
          setLoading(false);
          return;
        }
        payload.cajaId = Number(cajaSeleccionada);
      } else {
        payload.motivo = motivo || "General";
        payload.numAsistentes = Number(numAsistentes) || 1;
      }
      if (modalidad === "horas" || area.tipoArea === "gimnasio") {
        if (!horaInicio || !horaFin) {
          Alert.alert("Horas incompletas", "Selecciona hora de inicio y fin");
          setLoading(false);
          return;
        }
        payload.horaInicio = horaInicio;
        payload.horaFin = horaFin;
      }
      if (modalidad === "dias" && area.tipoArea !== "gimnasio") {
        if (new Date(fechaFin) < new Date(fecha)) {
          Alert.alert(
            "Fechas inválidas",
            "La fecha final no puede ser anterior"
          );
          setLoading(false);
          return;
        }
        payload.fechaFinReserva = fechaFin;
      }

      const res = await createReserva(payload);
      console.log("[ReservaForm] createReserva response", res);
      const reservaId = res.reserva?.idReserva ?? res.idReserva ?? null;
      if (!reservaId) {
        Alert.alert("Error", "No se obtuvo el id de la reserva");
        setLoading(false);
        return;
      }
      setReservaIdState(reservaId);
      
      const facturaRes = await createFacturaForReserva(costoAprox, reservaId);
      const newFacturaId =
        facturaRes?.factura?.idFactura ?? facturaRes?.idFactura ?? null;
      if (!newFacturaId) {
        Alert.alert("Error", "No se pudo crear la factura para el pago.");
        if (refresh) refresh();
        setLoading(false);
        return;
      }
      setFacturaId(newFacturaId);
      setShowPagoModal(true);
      if (refresh) refresh();
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Error al crear reserva",
        error?.response?.data?.message || error.message || "Error inesperado"
      );
    } finally {
      setLoading(false);
    }
  };

  const SimpleTopBar = ({ title }: { title: string }) => (
    <View style={styles.simpleTopBar}>
      <Text style={styles.simpleTopBarTitle}>{title}</Text>
    </View>
  );

  if (!area) {
    return (
      <SafeAreaView style={[styles.container, { padding: 16 }]} edges={["top"]}>
        <SimpleTopBar title="Reservar" />
        <Text style={{ textAlign: "center", color: "#374151" }}>
          Cargando información del área...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <SimpleTopBar title={`Reservar ${area.nombreAreaComun}`} />

      <View style={styles.formContainer}>
        
        {area?.tipoArea !== "gimnasio" && (
          <View style={styles.modalityRow}>
            <TouchableOpacity
              style={[
                styles.btnModalityBase,
                modalidad === "horas"
                  ? styles.btnModalityActive
                  : styles.btnModalityInactive,
              ]}
              onPress={() => setModalidad("horas")}
            >
              <Text
                style={
                  modalidad === "horas"
                    ? styles.btnTextModalityActive
                    : styles.btnTextModalityInactive
                }
              >
                Por horas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.btnModalityBase,
                modalidad === "dias"
                  ? styles.btnModalityActive
                  : styles.btnModalityInactive,
              ]}
              onPress={() => setModalidad("dias")}
            >
              <Text
                style={
                  modalidad === "dias"
                    ? styles.btnTextModalityActive
                    : styles.btnTextModalityInactive
                }
              >
                Por días
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.field}>
            <Text style={styles.label}>Fecha inicio</Text>
            <TouchableOpacity
              onPress={() => {
                setDatePickerMode("date");
                setDatePickerTarget("inicio");
                setShowDatePicker(true);
              }}
              style={styles.inputTouchable}
            >
              <Text style={styles.inputTouchableText}>{fecha}</Text>
            </TouchableOpacity>
          </View>

          {modalidad === "dias" && (
            <View style={styles.field}>
              <Text style={styles.label}>Fecha fin</Text>
              <TouchableOpacity
                onPress={() => {
                  setDatePickerMode("date");
                  setDatePickerTarget("fechaFin");
                  setShowDatePicker(true);
                }}
                style={styles.inputTouchable}
              >
                <Text style={styles.inputTouchableText}>{fechaFin}</Text>
              </TouchableOpacity>
            </View>
          )}

          {(modalidad === "horas" || area.tipoArea === "gimnasio") && (
            <View style={styles.rowInputs}>
              <View style={styles.fieldSmall}>
                <Text style={styles.label}>Hora inicio</Text>
                <TouchableOpacity
                  onPress={() => {
                    setDatePickerMode("time");
                    setDatePickerTarget("inicio");
                    setShowDatePicker(true);
                  }}
                  style={styles.inputTouchable}
                >
                  <Text style={styles.inputTouchableText}>
                    {horaInicio || "--:--"}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.fieldSmall}>
                <Text style={styles.label}>Hora fin</Text>
                <TouchableOpacity
                  onPress={() => {
                    setDatePickerMode("time");
                    setDatePickerTarget("fin");
                    setShowDatePicker(true);
                  }}
                  style={styles.inputTouchable}
                >
                  <Text style={styles.inputTouchableText}>
                    {horaFin || "--:--"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {area.tipoArea !== "gimnasio" && area.tipoArea !== "parqueo" && (
          <View style={styles.section}>
            <View style={styles.field}>
              <Text style={styles.label}>Motivo</Text>
              <TextInput
                style={styles.input}
                value={motivo}
                onChangeText={setMotivo}
                placeholder="Ej. Cumpleaños, Reunión familiar"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Número de asistentes</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={String(numAsistentes)}
                onChangeText={setNumAsistentes}
                placeholder="1"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        )}

        {area.tipoArea === "parqueo" && (
          <View style={styles.section}>
            <View style={styles.field}>
              <Text style={styles.label}>Selecciona un cajón</Text>
              <TouchableOpacity
                style={styles.inputTouchable}
                onPress={() => {
        
                  if (modalidad === "horas" && (!horaInicio || !horaFin)) {
                    Alert.alert(
                      "Selecciona horas",
                      "Debes elegir hora de inicio y fin para ver disponibilidad."
                    );
                    return;
                  }
                  setShowCajonesModal(true);
                }}
              >
                <Text style={styles.inputTouchableText}>
                  {cajaSeleccionada
                    ? `Cajón ${
                        cajones.find(
                          (c) => String(c.idParqueoCaja) === cajaSeleccionada
                        )?.numeroCaja || cajaSeleccionada
                      }`
                    : cajonesDisponibles.length
                    ? "Elige un cajón disponible..."
                    : "No hay cajones disponibles"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={[styles.cardInfo, { marginTop: 16 }]}>
          <Text style={styles.infoLabel}>Costo aproximado (BOB)</Text>
          {costoAprox > 0 ? (
            <Text style={styles.infoValue}>
              {costoAprox.toLocaleString("es-BO", {
                style: "currency",
                currency: "BOB",
              })}
            </Text>
          ) : (
            <Text
              style={[styles.infoValue, { fontSize: 14, color: "#6B7280" }]}
            >
              {area.tipoArea === "gimnasio"
                ? "Costo fijo por sesión."
                : modalidad === "horas"
                ? "Seleccione hora de inicio y fin."
                : "Seleccione fecha de inicio y fin."}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmText}>Confirmar Reserva y Pagar</Text>
          )}
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={
            datePickerMode === "date"
              ? (() => {
                  try {
                    const iso =
                      datePickerTarget === "fechaFin" ? fechaFin : fecha;
                    return iso ? parseDateFromYYYYMMDD(iso) : new Date();
                  } catch (e) {
                    return new Date();
                  }
                })()
              : 
                (() => {
                  try {
                    const time =
                      datePickerTarget === "fin" ? horaFin : horaInicio;
                    if (!time) return new Date();
                    const [hh, mm] = time.split(":").map(Number);
                    const d = new Date();
                    d.setHours(isNaN(hh) ? 0 : hh, isNaN(mm) ? 0 : mm, 0, 0);
                    return d;
                  } catch (e) {
                    return new Date();
                  }
                })()
          }
          mode={datePickerMode}
          display="default"
          onChange={onChangeDate}
        />
      )}

      <Modal
        visible={showCajonesModal}
        animationType="slide"
        onRequestClose={() => setShowCajonesModal(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
          <View style={styles.modalContainer}>
            <SimpleTopBar title="Seleccionar Cajón" /> 
            <Text style={styles.modalSubTitle}>
              Elige un cajón disponible para la fecha y horario seleccionados:
            </Text>
            <FlatList
              data={cajonesDisponibles}
              keyExtractor={(item) => String(item.idParqueoCaja)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.cajonItem,
                    String(item.idParqueoCaja) === cajaSeleccionada &&
                      styles.cajonItemSelected,
                  ]}
                  onPress={() => {
                    setCajaSeleccionada(String(item.idParqueoCaja));
                    setShowCajonesModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.cajonItemText,
                      String(item.idParqueoCaja) === cajaSeleccionada &&
                        styles.cajonItemTextSelected,
                    ]}
                  >{`Cajón ${item.numeroCaja}`}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.modalEmptyText}>
                  No hay cajones disponibles para el período seleccionado.
                </Text>
              }
              style={styles.cajonList}
            />
            <TouchableOpacity
              style={styles.closeModal}
              onPress={() => setShowCajonesModal(false)}
            >
              <Text style={styles.closeModalText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Modal de Pago QR */}
      <Modal
        visible={showPagoModal}
        animationType="slide"
        onRequestClose={() => setShowPagoModal(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
          <View style={[styles.modalContainer, { justifyContent: "center" }]}>
            <PagoQRMobile
              usuarioId={user?.id ?? null}
              reservaId={reservaIdState ?? 0}
              facturaId={facturaId ?? null}
              monto={costoAprox}
              onClose={() => setShowPagoModal(false)}
              onPagoConfirmado={() => {
                if (refresh) refresh();
                setShowPagoModal(false);
                // Opcional: navegar a la lista de reservas
              }}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// --- ESTILOS REVISADOS ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB", // Fondo claro
  },
  // --- Estilos para SimpleTopBar (Nuevo) ---
  simpleTopBar: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    alignItems: "center", // Centra el título para un aspecto limpio sin botón
  },
  simpleTopBarTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  // ----------------------------------------

  formContainer: {
    padding: 16,
  },
  section: {
    marginTop: 10,
  },

  // --- Modalidad de Reserva ---
  modalityRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
    padding: 4,
    borderRadius: 10,
    backgroundColor: "#E5E7EB", // Fondo para el selector
  },
  btnModalityBase: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  btnModalityActive: {
    backgroundColor: "#FFFFFF", // El activo sobresale
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  btnModalityInactive: {
    backgroundColor: "transparent",
  },
  btnTextModalityActive: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 14,
  },
  btnTextModalityInactive: {
    color: "#6B7280",
    fontWeight: "600",
    fontSize: 14,
  },

  // --- Campos y Inputs ---
  field: { marginBottom: 12 },
  label: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB", // Borde más suave
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    color: "#1F2937",
    fontSize: 16,
  },
  inputTouchable: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    minHeight: 48,
  },
  inputTouchableText: {
    fontSize: 16,
    color: "#1F2937",
  },
  rowInputs: { flexDirection: "row", gap: 10 },
  fieldSmall: { flex: 1 },

  // --- Costo Aproximado Card ---
  cardInfo: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderLeftWidth: 4, // Barra lateral de color
    borderLeftColor: "#10B981", // Verde para destacar
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: 4,
    color: "#111827",
  },

  // --- Botón de Confirmación ---
  confirmBtn: {
    backgroundColor: "#059669", // Un verde más llamativo que el negro
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  confirmText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },

  // --- Modal Cajones ---
  modalContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  modalSubTitle: {
    fontSize: 14,
    color: "#4B5563",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  cajonList: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  cajonItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  cajonItemSelected: {
    backgroundColor: "#E0F2F1", // Fondo verde claro
    borderLeftWidth: 4,
    borderLeftColor: "#059669",
  },
  cajonItemText: {
    fontSize: 16,
    color: "#1F2937",
  },
  cajonItemTextSelected: {
    fontWeight: "bold",
    color: "#065F46",
  },
  modalEmptyText: {
    padding: 16,
    textAlign: "center",
    color: "#6B7280",
    fontStyle: "italic",
  },
  closeModal: {
    backgroundColor: "#1F2937", // Botón oscuro para cerrar
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    margin: 16,
  },
  closeModalText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
