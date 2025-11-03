// screens/AreaListScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TopBar from "../components/TopBar";
import { type AreaComun, getAreasComunes } from "../services/areasService";
import { AreaCard } from "../components/AreaCard"; // Importa la tarjeta nativa
import { Search } from "lucide-react-native"; // Importa de lucide-react-native

// 1. IMPORTA EL TIPO DE NAVEGACIÓN
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../App"; // Ajusta la ruta a tu App.tsx
// ...

// 2. DEFINE LAS PROPS DEL COMPONENTE
// Ya no usas setEditState, ahora recibes 'navigation'
// 2. DEFINE LAS PROPS DEL COMPONENTE usando RootStackParamList
type AreaListProps = {};

// Tipado para el skeleton
type SkeletonItem = { id: number };

export default function AreaListScree(_: AreaListProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, "AreaList">>();
  const [areas, setAreas] = useState<AreaComun[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAreasComunes()
      .then((data) => setAreas(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = areas.filter((a) =>
    a.nombreAreaComun.toLowerCase().includes(search.toLowerCase())
  );

  // 4. MODIFICA handleReservar para usar el navegador
  const handleReservar = (area: AreaComun) => {
    // DEBUG: imprime el estado del navegador y el objetivo para diagnosticar
    try {
      // Algunas implementaciones no exponen getState, así que protegemos el acceso
      // Esto nos ayudará a ver qué rutas están registradas en tiempo de ejecución
      // cuando reproduzcas el problema pega el output que aparezca en Metro
      // (o en Logcat) aquí.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const navAny = navigation as any;
      const state = typeof navAny.getState === "function" ? navAny.getState() : null;
      
    } catch (e) {
      console.warn("[AreaList] failed to inspect navigation state", e);
    }

    // La función que te lleva a la pantalla "AreaDetail" con el parámetro 'areaId'
    navigation.navigate("AreaDetail", { areaId: area.idAreaComun });
  };

  // --- Render Skeletons ---
  const renderSkeleton = () => <View style={styles.skeletonCard} />;

  // --- Render Items ---
  const renderArea = ({ item }: { item: AreaComun }) => (
    <AreaCard area={item} onReservar={handleReservar} />
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <TopBar title="Áreas Comunes" />
      <View style={styles.contentContainer}>

  {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchContainer}>
            <Search size={18} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              placeholder="Buscar área..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
          </View>
        </View>

        {/* Lista / Loading */}
        {loading ? (
          <FlatList
            data={Array.from({ length: 6 }, (_, i) => ({ id: i }))}
            renderItem={renderSkeleton}
            keyExtractor={(item) => item.id.toString()}
            numColumns={NUM_COLUMNS}
            contentContainerStyle={styles.listContainer}
            {...(NUM_COLUMNS > 1 ? { columnWrapperStyle: styles.columnWrapper } : {})}
          />
        ) : (
          <FlatList
            data={filtered}
            renderItem={renderArea}
            keyExtractor={(item) => item.idAreaComun.toString()}
            numColumns={NUM_COLUMNS}
            contentContainerStyle={styles.listContainer}
            // columnWrapperStyle solo es válido cuando numColumns > 1
            {...(NUM_COLUMNS > 1 ? { columnWrapperStyle: styles.columnWrapper } : {})}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No se encontraron áreas.</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// --- Estilos ---
const { width } = Dimensions.get("window");
const CARD_MARGIN = 16;
// Mostramos una tarjeta por fila para ocupar todo el ancho
const NUM_COLUMNS = 1;
const CARD_WIDTH = width - CARD_MARGIN * 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB", // bg-gray-50
  },
  contentContainer: {
    flex: 1,
    // space-y-6 (manejado por padding/margins)
  },
  header: {
    paddingHorizontal: CARD_MARGIN,
    paddingTop: 16,
  },
  title: {
    fontSize: 24, // text-2xl
    fontWeight: "700", // font-bold
    color: "#111827",
  },
  searchWrapper: {
    paddingHorizontal: CARD_MARGIN,
    paddingVertical: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: "#111827",
  },
  listContainer: {
    paddingHorizontal: CARD_MARGIN / 2, // Margen en los bordes de la lista
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: "space-around", // Distribuye el espacio
    paddingVertical: CARD_MARGIN / 2, // 'gap' vertical
  },
  skeletonCard: {
    width: CARD_WIDTH,
    height: 300, // Altura aproximada de la tarjeta real
    backgroundColor: "#E5E7EB", // bg-gray-200
    borderRadius: 16, // rounded-xl
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
  },
});
