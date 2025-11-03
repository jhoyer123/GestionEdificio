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
import TopBar from "../components/TopBar";
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

// format date to local YYYY-MM-DD (use local date parts to avoid TZ shifts)
const formatDateToYYYYMMDD = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

// parse YYYY-MM-DD into a local Date (midnight local)
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
  // Match web defaults: gym -> motivo 'Ejercicio' and numAsistentes '1', otherwise empty
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

  // calcular cajones disponibles similar al web form
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

  // costo calculo
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
          // redondear a entero tal como en la versión web (ej: 239.83 -> 240)
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
      // Use local date formatting to avoid timezone shifts
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
      // store reserva id in component state for pago UI
      setReservaIdState(reservaId);
      // crear factura
      try {
        const facturaRes = await createFacturaForReserva(costoAprox, reservaId);
        setFacturaId(facturaRes?.factura?.idFactura ?? facturaRes?.idFactura ?? null);
      } catch (e) {
        console.warn("No se pudo crear factura automáticamente:", e);
        setFacturaId(null);
      }
      // crear factura (debe existir factura antes de abrir pago, como en la versión web)
      const facturaRes = await createFacturaForReserva(costoAprox, reservaId);
      const newFacturaId = facturaRes?.factura?.idFactura ?? facturaRes?.idFactura ?? null;
      if (!newFacturaId) {
        Alert.alert("Error", "No se pudo crear la factura para el pago.");
        if (refresh) refresh();
        setLoading(false);
        return;
      }
      setFacturaId(newFacturaId);
      // Abrimos modal de pago (native Modal) con la factura creada
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

  if (!area) {
    return (
      <SafeAreaView style={[styles.container, { padding: 16 }]} edges={["top"]}>
        <TopBar title="Reservar" />
        <Text style={{ textAlign: "center", color: "#374151" }}>
          Cargando información del área...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <TopBar title={`Reservar ${area.nombreAreaComun}`} />

      {/* Show modality buttons for non-gimnasio areas (matches web logic) */}
      {area?.tipoArea !== "gimnasio" && (
        <View style={styles.row}>
          <TouchableOpacity
            style={[
              styles.btn,
              modalidad === "horas" ? styles.btnPrimary : styles.btnOutline,
            ]}
            onPress={() => setModalidad("horas")}
          >
            <Text
              style={
                modalidad === "horas" ? styles.btnTextPrimary : styles.btnTextOutline
              }
            >
              Por horas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.btn,
              modalidad === "dias" ? styles.btnPrimary : styles.btnOutline,
            ]}
            onPress={() => setModalidad("dias")}
          >
            <Text
              style={
                modalidad === "dias" ? styles.btnTextPrimary : styles.btnTextOutline
              }
            >
              Por días
            </Text>
          </TouchableOpacity>
        </View>
      )}

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
          <Text>{fecha}</Text>
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
            <Text>{fechaFin}</Text>
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
              <Text>{horaInicio || "--:--"}</Text>
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
              <Text>{horaFin || "--:--"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {area.tipoArea !== "gimnasio" && area.tipoArea !== "parqueo" && (
        <>
          <View style={styles.field}>
            <Text style={styles.label}>Motivo</Text>
            <TextInput
              style={styles.input}
              value={motivo}
              onChangeText={setMotivo}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Número de asistentes</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={String(numAsistentes)}
              onChangeText={setNumAsistentes}
            />
          </View>
        </>
      )}

      {area.tipoArea === "parqueo" && (
        <View style={styles.field}>
          <Text style={styles.label}>Selecciona un cajón</Text>
          <TouchableOpacity
            style={styles.inputTouchable}
            onPress={() => {
              // match web: when modalidad === 'horas' require both horas selected before enabling selection
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
            <Text>
              {cajaSeleccionada
                ? `Cajón ${cajaSeleccionada}`
                : cajonesDisponibles.length
                ? "Elige un cajón..."
                : "No hay cajones disponibles"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.cardInfo, { marginTop: 8 }]}>
        <Text style={styles.infoLabel}>Costo aproximado</Text>
        <Text style={styles.infoValue}>
          {costoAprox > 0 ? (
            costoAprox.toLocaleString("es-BO", {
              style: "currency",
              currency: "BOB",
            })
          ) : (
            <Text style={{ fontSize: 14, color: "#6B7280" }}>
              {area.tipoArea === "gimnasio"
                ? "Costo fijo por sesión."
                : modalidad === "horas"
                ? "Seleccione hora de inicio y fin."
                : "Seleccione fecha de inicio y fin."}
            </Text>
          )}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.confirmBtn}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.confirmText}>Confirmar Reserva</Text>
        )}
      </TouchableOpacity>

      {/* payment modal is shown below (native Modal). No inline or debug modal to avoid duplicates */}

      {showDatePicker && (
        <DateTimePicker
          value={
            // Choose a sensible initial Date for the picker depending on target
            datePickerMode === "date"
              ? (() => {
                  try {
                    const iso = datePickerTarget === "fechaFin" ? fechaFin : fecha;
                    return iso ? parseDateFromYYYYMMDD(iso) : new Date();
                  } catch (e) {
                    return new Date();
                  }
                })()
              : // time mode: parse HH:MM into a Date object (today)
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
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Cajones disponibles</Text>
          <FlatList
            data={cajonesDisponibles}
            keyExtractor={(item) => String(item.idParqueoCaja)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.cajonItem}
                onPress={() => {
                  setCajaSeleccionada(String(item.idParqueoCaja));
                  setShowCajonesModal(false);
                }}
              >
                <Text>Cajón {item.numeroCaja}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={{ padding: 16 }}>No hay cajones disponibles.</Text>
            }
          />
          <TouchableOpacity
            style={styles.closeModal}
            onPress={() => setShowCajonesModal(false)}
          >
            <Text style={{ color: "#fff" }}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Modal simple de pago (placeholder). Si tienes un componente PagoQR móvil lo puedes renderizar aquí. */}
      <Modal
        visible={showPagoModal}
        animationType="slide"
        onRequestClose={() => setShowPagoModal(false)}
      >
        <View style={[styles.modalContainer, { justifyContent: "center" }]}>
          {/* Render the real PagoQRMobile inside the native Modal so QR/actions are visible */}
          <PagoQRMobile
            usuarioId={user?.id ?? null}
            reservaId={reservaIdState ?? 0}
            facturaId={facturaId ?? null}
            monto={costoAprox}
            onClose={() => setShowPagoModal(false)}
            onPagoConfirmado={() => {
              if (refresh) refresh();
              setShowPagoModal(false);
            }}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 12 },
  heading: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  row: { flexDirection: "row", gap: 8, marginBottom: 8 },
  btn: { flex: 1, padding: 10, borderRadius: 8, alignItems: "center" },
  btnPrimary: { backgroundColor: "#111827" },
  btnOutline: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  btnTextPrimary: { color: "#fff", fontWeight: "600" },
  btnTextOutline: { color: "#111827", fontWeight: "600" },
  field: { marginBottom: 8 },
  label: { fontSize: 13, color: "#374151", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  inputTouchable: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  rowInputs: { flexDirection: "row", gap: 8 },
  fieldSmall: { flex: 1 },
  cardInfo: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    marginTop: 8,
  },
  infoLabel: { fontSize: 12, color: "#6B7280" },
  infoValue: { fontSize: 18, fontWeight: "700", marginTop: 4 },
  confirmBtn: {
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  confirmText: { color: "#fff", fontWeight: "700" },
  modalContainer: { flex: 1, padding: 16, backgroundColor: "#fff" },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  cajonItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  closeModal: {
    backgroundColor: "#111827",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
});
