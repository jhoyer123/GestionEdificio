import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TopBar from "../components/TopBar";
import { useAuth } from "../components/AuthContext";
import reservaService from "../services/reservaService";

type ReservaUser = any; // usamos any para mantener paridad con backend

export default function MisReservasScreen() {
  const { user, isLoading: authLoading } = useAuth();
  const [reservas, setReservas] = useState<ReservaUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"proximas" | "historial">("proximas");

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        setIsLoading(true);
        const data = await reservaService.getReservasByUsuario(user.id);
        setReservas(data || []);
      } catch (e) {
        console.error("MisReservas load error", e);
        setError("Hubo un problema al cargar tus reservas.");
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) load();
  }, [user, authLoading]);

  const { proximas, historial } = useMemo(() => {
    // ahora en la zona local del dispositivo (no hacemos conversiones extra)
    const ahora = new Date();

    const parseDateTime = (dateStr: string | undefined, timeStr?: string | null) => {
      if (!dateStr) return new Date(0);
      // Si la fecha ya contiene 'T' (ISO with time), usarla directamente
      if (dateStr.includes("T")) {
        try {
          // Si timeStr se proporciona, usamos la parte YYYY-MM-DD de dateStr y la combinamos
          if (timeStr) {
            const dateOnly = dateStr.slice(0, 10);
            return new Date(`${dateOnly}T${timeStr}`);
          }
          return new Date(dateStr);
        } catch (e) {
          return new Date(dateStr);
        }
      }
      // Fecha en formato YYYY-MM-DD
      const t = timeStr || "00:00:00";
      return new Date(`${dateStr}T${t}`);
    };

    const proximas: ReservaUser[] = [];
    const historial: ReservaUser[] = [];

    reservas.forEach((r) => {
      const fechaInicio = parseDateTime(r.fechaInicio, r.horaInicio);
      const fechaFin = parseDateTime(r.fechaFin || r.fechaInicio, r.horaFin || "23:59:59");

      // Próximas si no está cancelada/rechazada y su fechaFin es futura (>= ahora)
      if (r.estado !== "cancelada" && r.estado !== "rechazada" && fechaFin.getTime() >= ahora.getTime()) {
        proximas.push(r);
      } else {
        historial.push(r);
      }
    });

    proximas.sort((a, b) => parseDateTime(a.fechaInicio, a.horaInicio).getTime() - parseDateTime(b.fechaInicio, b.horaInicio).getTime());
    historial.sort((a, b) => parseDateTime(b.fechaInicio, b.horaInicio).getTime() - parseDateTime(a.fechaInicio, a.horaInicio).getTime());

    return { proximas, historial };
  }, [reservas]);

  const renderReservaCard = ({ item }: { item: ReservaUser }) => {
    return (
      <View style={styles.card}>
        <Text style={styles.areaName}>{item.areaNombre || "Área"}</Text>
        <Text style={styles.line}>{item.fechaInicio} {item.horaInicio ? ` - ${item.horaInicio}` : ""}</Text>
        {item.fechaFin && item.fechaFin !== item.fechaInicio ? (
          <Text style={styles.line}>Fin: {item.fechaFin} {item.horaFin || ""}</Text>
        ) : null}
        <Text style={styles.line}>Estado: {item.estado}</Text>
        <Text style={styles.line}>Asistentes: {item.asistentes ?? item.numAsistentes ?? "-"}</Text>
  <Text style={styles.line}>Costo: {(item.costoTotal ?? item.costo) || "0"}</Text>
        {item.motivo ? <Text style={styles.line}>Motivo: {item.motivo}</Text> : null}
      </View>
    );
  };

  if (authLoading || isLoading) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <TopBar title="Mis Reservas" />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 8 }}>Buscando tus reservas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  const itemsToShow = tab === "proximas" ? proximas : historial;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <TopBar title="Mis Reservas" />
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tabButton, tab === "proximas" && styles.tabActive]} onPress={() => setTab("proximas")}>
          <Text style={[styles.tabText, tab === "proximas" && styles.tabTextActive]}>Próximas ({proximas.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabButton, tab === "historial" && styles.tabActive]} onPress={() => setTab("historial")}>
          <Text style={[styles.tabText, tab === "historial" && styles.tabTextActive]}>Historial ({historial.length})</Text>
        </TouchableOpacity>
      </View>

      {itemsToShow.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>{tab === "proximas" ? "No tienes reservas próximas." : "Tu historial de reservas está vacío."}</Text>
        </View>
      ) : (
        <FlatList data={itemsToShow} keyExtractor={(it) => String((it.idReserva ?? it.id) || Math.random())} renderItem={renderReservaCard} contentContainerStyle={styles.list} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 12, paddingTop: 0, paddingBottom: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { color: "#b91c1c" },
  tabs: { flexDirection: "row", marginBottom: 12, gap: 8 },
  tabButton: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: "#f3f4f6", alignItems: "center" },
  tabActive: { backgroundColor: "#111827" },
  tabText: { color: "#374151", fontWeight: "600" },
  tabTextActive: { color: "#fff" },
  list: { paddingBottom: 40, gap: 12 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 12, borderColor: "#e5e7eb", borderWidth: 1, marginBottom: 8, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  areaName: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  line: { color: "#374151", marginBottom: 4 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 40 },
  emptyTitle: { fontSize: 16, color: "#6b7280" },
});
