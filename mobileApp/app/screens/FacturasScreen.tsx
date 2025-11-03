// FacturasScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TopBar from "../components/TopBar";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  FileText,
  Calendar,
  DollarSign,
  Search,
  X,
} from "lucide-react-native";
import { getFacturasByUsuario } from "../services/facturaService";

// Tipos
interface Factura {
  idFactura: number;
  nroFactura: string;
  fechaEmision: string;
  fechaVencimiento?: string | null;
  montoTotal: number;
  estado: "pagada" | "pendiente" | "vencida" | string;
  departamentoId?: number | null;
}

export default function FacturasScreen() {
  const navigation = useNavigation();
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  // Modal de pago
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);

  // Obtener usuario del almacenamiento
  useEffect(() => {
    const getUser = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        if (userString) {
          const user = JSON.parse(userString);
          setUserId(user.id ?? null);
        }
      } catch (error) {
        console.error("Error obteniendo usuario:", error);
      }
    };
    getUser();
  }, []);

  // Cargar facturas
  const fetchFacturas = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const res = await getFacturasByUsuario(userId);
      setFacturas(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Error fetching facturas:", error);
      Alert.alert("Error", "No se pudieron cargar las facturas");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userId) fetchFacturas();
  }, [userId]);

  // Refrescar
  const onRefresh = () => {
    setRefreshing(true);
    fetchFacturas();
  };

  // Filtrar facturas por búsqueda
  const filteredFacturas = useMemo(() => {
    if (searchQuery.trim()) {
      const s = searchQuery.toLowerCase();
      return facturas.filter(
        (f) =>
          (f.nroFactura || "").toLowerCase().includes(s) ||
          (f.estado || "").toLowerCase().includes(s)
      );
    }
    return facturas;
  }, [facturas, searchQuery]);

  // Formatear fecha
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Formatear moneda
  const formatCurrency = (amount?: number | string | null) => {
    if (amount === null || amount === undefined) return `Bs. 0.00`;
    const num = typeof amount === "number" ? amount : parseFloat(String(amount).replace(",", "."));
    if (Number.isNaN(num)) return `Bs. 0.00`;
    return `Bs. ${num.toFixed(2)}`;
  };

  // Obtener color según estado
  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "pagada":
        return "#10b981";
      case "pendiente":
        return "#f59e0b";
      case "vencida":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  // Obtener texto del estado
  const getStatusText = (estado: string) => {
    switch (estado) {
      case "pagada":
        return "Pagada";
      case "pendiente":
        return "Pendiente";
      case "vencida":
        return "Vencida";
      default:
        return estado;
    }
  };

  // Abrir modal de pago
  const handlePagar = (factura: Factura) => {
    setSelectedFactura(factura);
    setModalVisible(true);
  };

  // Ver PDF -> navegar a pantalla de detalle/descarga
  const handleVerFactura = (factura: Factura) => {
    // Navegar a InvoiceDetail que maneja descarga/visualización
    // cast to any to avoid strict navigation typing here
    (navigation as any).navigate("InvoiceDetail", { facturaId: factura.idFactura });
  };

  // Render item
  const renderFacturaItem = ({ item }: { item: Factura }) => (
    <View style={styles.facturaCard}>
      <View style={styles.facturaHeader}>
        <View style={styles.facturaInfo}>
          <Text style={styles.facturaNumero}>Factura #{item.nroFactura}</Text>
          <View style={styles.fechaContainer}>
            <Calendar size={14} color="#6b7280" />
            <Text style={styles.fechaText}>Emitida: {formatDate(item.fechaEmision)}</Text>
          </View>
        </View>

        <View style={styles.montoContainer}>
          <Text style={styles.montoText}>{formatCurrency(item.montoTotal)}</Text>
          <View style={[styles.estadoBadge, { backgroundColor: `${getStatusColor(item.estado)}20` }]}> 
            <Text style={[styles.estadoText, { color: getStatusColor(item.estado) }]}>{getStatusText(item.estado)}</Text>
          </View>
        </View>
      </View>

      {item.fechaVencimiento && (
        <View style={styles.vencimientoContainer}>
          <Text style={styles.vencimientoLabel}>Vencimiento: </Text>
          <Text style={styles.vencimientoText}>{formatDate(item.fechaVencimiento)}</Text>
        </View>
      )}

      <View style={styles.botonesContainer}>
        <TouchableOpacity style={styles.btnVerFactura} onPress={() => handleVerFactura(item)} activeOpacity={0.7}>
          <FileText size={18} color="#6b7280" />
          <Text style={styles.btnVerFacturaText}>Ver factura</Text>
        </TouchableOpacity>

        {(item.estado === "pendiente" || item.estado === "vencida") && (
          <TouchableOpacity style={[styles.btnPagar, { borderWidth: 1, borderColor: '#e5e7eb' }]} onPress={() => handlePagar(item)} activeOpacity={0.7}>
            <Text style={styles.btnPagarText}>Pagar factura</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <TopBar title="Mis Facturas" />

      {/* Búsqueda */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar número o estado..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}> 
            <X size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de facturas */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Cargando facturas...</Text>
        </View>
      ) : filteredFacturas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FileText size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>{searchQuery ? "No hay facturas que coincidan" : "No tienes facturas"}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredFacturas}
          renderItem={renderFacturaItem}
          keyExtractor={(item) => item.idFactura.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal de pago */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pago por QR</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {selectedFactura && (
              <View style={styles.modalBody}>
                <Text style={styles.modalFacturaText}>Factura #{selectedFactura.nroFactura}</Text>
                <Text style={styles.modalMontoText}>Monto: {formatCurrency(selectedFactura.montoTotal)}</Text>

                {/* Aquí irá tu componente de pago QR */}
                <View style={styles.qrPlaceholder}>
                  <Text style={styles.qrPlaceholderText}>Componente QR aquí</Text>
                </View>

                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    setModalVisible(false);
                    Alert.alert("Pago", "Procesando pago...");
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalButtonText}>Confirmar Pago</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
    textAlign: "center",
    marginRight: -28, // Compensa el ancho del botón para centrar el título
  },
  placeholder: {
    width: 28, // Mismo ancho que el botón de volver para mantener centrado el título
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  facturaCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  facturaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  facturaInfo: {
    flex: 1,
  },
  facturaNumero: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  fechaContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  fechaText: {
    fontSize: 13,
    color: "#6b7280",
  },
  montoContainer: {
    alignItems: "flex-end",
  },
  montoText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: "600",
  },
  vencimientoContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  vencimientoLabel: {
    fontSize: 13,
    color: "#6b7280",
  },
  vencimientoText: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "500",
  },
  botonesContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  btnVerFactura: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    gap: 6,
  },
  btnVerFacturaText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  btnPagar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#6366f1",
    borderRadius: 8,
    gap: 6,
  },
  btnPagarText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: "50%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  modalBody: {
    padding: 20,
  },
  modalFacturaText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  modalMontoText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#6366f1",
    marginBottom: 24,
  },
  qrPlaceholder: {
    height: 200,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  qrPlaceholderText: {
    color: "#6b7280",
  },
  modalButton: {
    backgroundColor: "#6366f1",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
