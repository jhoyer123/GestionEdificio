// AnunciosScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  RefreshControl,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Megaphone, Users, UserCheck, ArrowLeft, X } from "lucide-react-native";
import { getAnuncios, marcarAnuncioVisto } from "../services/anunciosService";

// Tipos
interface Anuncio {
  idAnuncio: number;
  titulo: string;
  descripcion: string;
  visiblePara: string;
  fechaCreacion: string;
}

interface User {
  id: number;
  rol?: Array<{ nombre: string }>;
}

export default function AnunciosScreen() {
  const navigation = useNavigation();
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAnuncio, setSelectedAnuncio] = useState<Anuncio | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Obtener usuario del almacenamiento
  useEffect(() => {
    const getUserData = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        if (userString) {
          const userData = JSON.parse(userString);
          setUser(userData);
        }
      } catch (error) {
        console.error("Error obteniendo usuario:", error);
      }
    };
    getUserData();
  }, []);

  // Cargar anuncios
  const fetchAnuncios = async () => {
    try {
      const response = await getAnuncios();
      setAnuncios(response);
    } catch (error) {
      console.error("Error al obtener los anuncios:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnuncios();
  }, []);

  // Refrescar
  const onRefresh = () => {
    setRefreshing(true);
    fetchAnuncios();
  };

  // Filtrar anuncios visibles según el rol del usuario
  const rolesUser = user?.rol?.map((r) => r.nombre) || [];
  const anunciosVisibles = anuncios.filter(
    (anuncio) =>
      anuncio.visiblePara === "todos" || rolesUser.includes(anuncio.visiblePara)
  );

  // Obtener icono según el tipo de anuncio
  const getIconByType = (tipo: string) => {
    switch (tipo) {
      case "residente":
        return <UserCheck size={24} color="#10b981" />;
      case "personal":
        return <Users size={24} color="#3b82f6" />;
      case "todos":
      default:
        return <Megaphone size={24} color="#f59e0b" />;
    }
  };

  // Obtener color de fondo según el tipo
  const getColorByType = (tipo: string) => {
    switch (tipo) {
      case "residente":
        return "#10b98120";
      case "personal":
        return "#3b82f620";
      case "todos":
      default:
        return "#f59e0b20";
    }
  };

  // Abrir modal de anuncio
  const handleVerAnuncio = async (anuncio: Anuncio) => {
    setSelectedAnuncio(anuncio);
    setModalVisible(true);

    try {
      if (user) {
        await marcarAnuncioVisto(user.id, anuncio.idAnuncio);
      }
    } catch (error) {
      console.error("Error al marcar el anuncio como visto:", error);
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Renderizar item de anuncio
  const renderAnuncioItem = ({ item }: { item: Anuncio }) => (
    <TouchableOpacity
      style={[
        styles.anuncioCard,
        { backgroundColor: getColorByType(item.visiblePara) },
      ]}
      onPress={() => handleVerAnuncio(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.titulo}
        </Text>
        <View style={styles.iconContainer}>
          {getIconByType(item.visiblePara)}
        </View>
      </View>

      <Text style={styles.cardDescription} numberOfLines={4}>
        {item.descripcion}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>
          Publicado el {item.fechaCreacion}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>Anuncios</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Cargando anuncios...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header con botón de volver */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Anuncios del Edificio</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Lista de anuncios */}
      {anunciosVisibles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Megaphone size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>
            No hay anuncios disponibles en este momento
          </Text>
        </View>
      ) : (
        <FlatList
          data={anunciosVisibles}
          renderItem={renderAnuncioItem}
          keyExtractor={(item) => item.idAnuncio.toString()}
          contentContainerStyle={styles.listContainer}
          numColumns={1}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal de detalle del anuncio */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={2}>
                {selectedAnuncio?.titulo}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {selectedAnuncio && (
              <ScrollView
                style={styles.modalBody}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.modalDescription}>
                  {selectedAnuncio.descripcion}
                </Text>

                <View style={styles.modalFooter}>
                  <Text style={styles.modalDate}>
                    Publicado el {selectedAnuncio.fechaCreacion}
                  </Text>
                </View>
              </ScrollView>
            )}

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // --- Contenedor principal ---
  container: {
    flex: 1,
    backgroundColor: "#F2F4F7", // Gris cálido más profesional
  },

  // --- Header superior ---
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  backButton: {
    padding: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    flex: 1,
    marginRight: -32,
  },
  placeholder: {
    width: 28,
  },

  // --- Estado de carga ---
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F4F7",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },

  // --- Estado vacío ---
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    marginTop: 18,
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
  },

  // --- Lista y tarjetas ---
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  anuncioCard: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
    marginRight: 10,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardDescription: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 22,
    marginBottom: 14,
  },
  cardFooter: {
    borderTopWidth: 0.7,
    borderTopColor: "#E5E7EB",
    paddingTop: 10,
  },
  dateText: {
    fontSize: 13,
    color: "#6B7280",
  },

  // --- Modal de detalle ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 22,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    flex: 1,
    marginRight: 10,
  },
  modalBody: {
    paddingHorizontal: 22,
    paddingVertical: 18,
  },
  modalDescription: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 25,
  },
  modalFooter: {
    marginTop: 22,
    paddingTop: 16,
    borderTopWidth: 0.5,
    borderTopColor: "#E5E7EB",
  },
  modalDate: {
    fontSize: 14,
    color: "#6B7280",
  },
  modalButtonContainer: {
    paddingHorizontal: 22,
    paddingTop: 10,
  },
  modalButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
});
