import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
//***************************************************************//
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./app/screens/LoginScreen";
import { AuthProvider } from "./app/components/AuthContext";
import DashboardScreen from "./app/screens/DashboardScreen";
import FacturasScreen from "./app/screens/FacturasScreen";
import AnunciosScreen from "./app/screens/AnunciosSreen";
import MisReservasScreen from "./app/screens/MisReservasScreen";
// IMPORTACIONES FALTANTES:
import AreaListScreen from "./app/screens/AreaListScreen";
import AreaDetailScreen from "./app/screens/AreaDetailScreen";
//***************************************************************//

// 1. Define los tipos de tu Stack (¡COMPLETO!)
export type RootStackParamList = {
  Login: undefined; // El login no recibe parámetros
  Dashboard: undefined; // El dashboard no recibe parámetros
  Facturas: undefined;
  Anuncios: undefined;
  MisReservas: undefined;
  InvoiceDetail: { facturaId: number };
  // AÑADIDOS
  AreaList: undefined; // La lista no recibe parámetros
  AreaDetail: { areaId: number }; // El detalle RECIBE un ID
};

// 2. Crea el Stack
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Facturas"
            component={FacturasScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Anuncios"
            component={AnunciosScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MisReservas"
            component={MisReservasScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="InvoiceDetail"
            component={require("./app/screens/InvoiceDetailScreen").default}
            options={{ headerShown: false }}
          />
          {/* AÑADIDOS: Rutas de Áreas Comunes */}
          <Stack.Screen
            name="AreaList"
            component={AreaListScreen}
            options={{ title: "Áreas Comunes", headerShown: false }}
          />
          <Stack.Screen
            name="AreaDetail"
            component={AreaDetailScreen}
            options={{ title: "Detalle de Área", headerShown: false }}
          />
        </Stack.Navigator>
      </AuthProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  // ...
});
