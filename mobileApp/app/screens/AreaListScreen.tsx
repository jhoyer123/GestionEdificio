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
import { AreaCard } from "../components/AreaCard";
import { Search } from "lucide-react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../App";

type AreaListProps = {};
type SkeletonItem = { id: number };

export default function AreaListScreen(_: AreaListProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, "AreaList">>();
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

  const handleReservar = (area: AreaComun) => {
    navigation.navigate("AreaDetail", { areaId: area.idAreaComun });
  };

  const renderSkeleton = () => <View style={styles.skeletonCard} />;
  const renderArea = ({ item }: { item: AreaComun }) => (
    <AreaCard area={item} onReservar={handleReservar} />
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <TopBar title="Áreas Comunes" />

      <View style={styles.contentContainer}>
        {/* Barra de búsqueda */}
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

        {/* Lista o skeleton */}
        {loading ? (
          <FlatList
            data={Array.from({ length: 4 }, (_, i) => ({ id: i }))}
            renderItem={renderSkeleton}
            keyExtractor={(item) => item.id.toString()}
            numColumns={1}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <FlatList
            data={filtered}
            renderItem={renderArea}
            keyExtractor={(item) => item.idAreaComun.toString()}
            numColumns={1}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No se encontraron áreas disponibles.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// --- ESTILOS MEJORADOS ---
const { width } = Dimensions.get("window");
const CARD_MARGIN = 16;
const CARD_WIDTH = width - CARD_MARGIN * 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB", // fondo gris claro
  },
  contentContainer: {
    flex: 1,
    paddingTop: 8,
  },

  // --- Barra de búsqueda ---
  searchWrapper: {
    paddingHorizontal: CARD_MARGIN,
    paddingVertical: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#111827",
  },

  // --- Lista de áreas ---
  listContainer: {
    paddingHorizontal: CARD_MARGIN,
    paddingBottom: 24,
    gap: 16,
  },

  // --- Skeleton ---
  skeletonCard: {
    width: "100%",
    height: 220,
    backgroundColor: "#E5E7EB",
    borderRadius: 16,
    marginBottom: 16,
  },

  // --- Estado vacío ---
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
});
