import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  FileText,
  Calendar,
  Megaphone,
  ChevronRight,
} from "lucide-react-native";

const BACKGROUND_IMAGE_URI =
  "https://i.pinimg.com/736x/ba/c8/72/bac872326e8f7179642b8ded9ac1b6e3.jpg";

const { width, height } = Dimensions.get("window");

type RootStackParamList = {
  Dashboard: undefined;
  Facturas: undefined;
  MisReservas: undefined;
  // Reservas no estaba registrada en el Stack; añadimos AreaList/AreaDetail como rutas válidas
  AreaList: undefined;
  AreaDetail: { areaId: number };
  Anuncios: undefined;
};

type DashboardScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Dashboard"
>;

interface CardItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  route: keyof RootStackParamList;
  color: string;
}

const CARDS: CardItem[] = [
  {
    id: "1",
    title: "Facturas",
    subtitle: "Revisa tus facturas y pagos pendientes",
    icon: FileText,
    route: "Facturas",
    color: "#3b82f6",
  },
  {
    id: "4",
    title: "Mis Reservas",
    subtitle: "Revisa y administra tus reservas",
    icon: Calendar,
    route: "MisReservas",
    color: "#8b5cf6",
  },
  {
    id: "2",
    title: "Hacer Reservas",
    subtitle: "Reserva mesas en tu restaurante favorito",
    icon: Calendar,
    // No existe una ruta llamada 'Reservas' en el Stack; usamos 'AreaList' que sí está registrada
    route: "AreaList",
    color: "#10b981",
  },
  {
    id: "3",
    title: "Ver Anuncios",
    subtitle: "Consulta los anuncios disponibles",
    icon: Megaphone,
    route: "Anuncios",
    color: "#f59e0b",
  },
];

export default function DashboardScreen() {
  const navigation = useNavigation<DashboardScreenNavigationProp>();

  const renderCard = (item: CardItem) => {
    const Icon = item.icon;

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.card}
        onPress={() => navigation.navigate(item.route as any)}
        activeOpacity={0.8}
      >
        <View style={styles.cardContent}>
          <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
            <Icon size={28} color="#FFFFFF" />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
          </View>

          <View style={styles.arrowContainer}>
            <ChevronRight size={24} color="#9CA3AF" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ImageBackground
        source={{ uri: BACKGROUND_IMAGE_URI }}
        /* source={require("../../assets/background.jpg")} */
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.greeting}>Hola! 👋</Text>
            <Text style={styles.title}>¿Qué deseas hacer hoy?</Text>
          </View>

          <View style={styles.cardsContainer}>{CARDS.map(renderCard)}</View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight! + 20 : 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 32,
  },
  greeting: {
    fontSize: 18,
    color: "#D1D5DB",
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    lineHeight: 38,
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    width: "100%",
    backgroundColor: "rgba(17, 24, 39, 0.85)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    lineHeight: 20,
  },
  arrowContainer: {
    marginLeft: 8,
  },
});
