// /screens/LoginScreen.tsx (o como lo llames)
import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground, // Para la imagen de fondo
  Image, // Para el logo
  Alert, // Para reemplazar los toasts
  KeyboardAvoidingView, // Para que el teclado no tape
  Platform,
  ActivityIndicator, // Para mostrar un spinner al cargar
  ScrollView,
} from "react-native";
import { useForm, Controller } from "react-hook-form"; // Usa Controller
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack"; // Tipado para navegación
import { login } from "../services/authService"; // Asumimos que este servicio ya usa axios
import axios from "axios";
import { Eye, EyeOff, Mail, Lock } from "lucide-react-native"; // ¡Ya lo tenías!
import { useAuth } from "../components/AuthContext"; // ¡Esto funciona igual!
import AsyncStorage from "@react-native-async-storage/async-storage"; // Reemplazo de localStorage

// Imagen de fondo y logo
const BACKGROUND_IMAGE_URI =
  "https://i.pinimg.com/736x/8e/ff/86/8eff8648a0340025ebb66660b3fdc6ce.jpg";
const LOGO_URI =
  "https://i.pinimg.com/736x/92/fd/b0/92fdb00d64061d527d71235ac42712bf.jpg";

// Define el tipo para tus rutas de navegación si tienes un Stack
type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  ForgotPassword: undefined;
  // ... otras rutas
};

// Define el tipo del prop de navegación
type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

// El FormData de tu código original
type FormData = {
  email: string;
  password: string;
  token?: string; // 2FA
  recaptchaToken: string; // siempre requerido (pero lo omitiremos por ahora)
};

export default function LoginScreen() {
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFAToken, setTwoFAToken] = useState("");
  const [showRecaptcha, setShowRecaptcha] = useState(false); // La lógica se mantiene, la UI se omite
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Estado de carga

  const { loginUser } = useAuth();
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const {
    control, // Usamos 'control' en lugar de 'register'
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      email: "",
      password: "",
      recaptchaToken: "not-implemented", // Simulado
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        token: twoFactorRequired ? twoFAToken : null,
      };

      // 1. Llamada a la API (idéntica)
      const response = await login(payload);

      // 2. Manejo de 2FA (idéntico)
      if (response.twoFactorRequired) {
        setTwoFactorRequired(true);
        Alert.alert("Verificación Requerida", "Ingresa tu código 2FA");
        setIsLoading(false);
        return;
      }

      // 3. Éxito de Login
      loginUser(response.usuario);
      // REEMPLAZO: localStorage -> AsyncStorage
      await AsyncStorage.setItem("user", JSON.stringify(response.usuario));

      // REEMPLAZO: toast.success -> Alert.alert
      Alert.alert("¡Bienvenido!", response.message);

      // REEMPLAZO: navigate("/dashboard") -> navigation.replace(...)
      // Usamos 'replace' para que el usuario no pueda "volver" al login
      navigation.replace("Dashboard");
    } catch (error) {
      // 4. Manejo de Errores (idéntico)
      if (
        axios.isAxiosError(error) &&
        error.response?.data?.intentosRestantes !== undefined
      ) {
        const intentosRestantes = error.response.data.intentosRestantes;
        if (intentosRestantes <= 2) {
          setShowRecaptcha(true); // La lógica se activa
          Alert.alert(
            "Verificación Adicional",
            "Se requerirá un captcha (funcionalidad nativa pendiente)."
          );
        }
      }

      // REEMPLAZO: toast.error -> Alert.alert
      Alert.alert(
        "Error de Inicio de Sesión",
        axios.isAxiosError(error)
          ? error.response?.data?.message
          : "Ocurrió un error inesperado"
      );
    } finally {
      setIsLoading(false);
      // Lógica de reseteo de Recaptcha (comentada)
      // recaptchaRef.current?.reset();
      // setValue("recaptchaToken", "", { shouldValidate: false });
    }
  };
  const miImagenDeFondo = require("../../assets/background.jpg"); // Asegúrate de tener esta imagen en assets
  return (
    <ImageBackground
      source={miImagenDeFondo}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Usamos KeyboardAvoidingView + ScrollView. En Android evitamos behavior que cambie la altura
          (puede causar saltos). En iOS usamos 'padding'. */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"} // Cambié 'undefined' por 'height'
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 20} // Ajusta si es necesario
        style={{ flex: 1 }}
      >
        <ScrollView
          // Usamos flexGrow para que el ScrollView pueda crecer y desplazar
          // el contenido cuando aparece el teclado.
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentInsetAdjustmentBehavior="automatic"
        >
          {/* Card */}
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoWrapper}>
                <Image source={{ uri: LOGO_URI }} style={styles.logo} />
              </View>
              <Text style={styles.title}>Bienvenido de nuevo</Text>
              <Text style={styles.subtitle}>Inicia sesión para acceder</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Email Input */}
              <View>
                <View style={styles.inputContainer}>
                  <Mail color="#9CA3AF" size={20} style={styles.inputIcon} />
                  <Controller
                    control={control}
                    name="email"
                    rules={{ required: "El email es obligatorio" }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#9CA3AF"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    )}
                  />
                </View>
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email.message}</Text>
                )}
              </View>

              {/* Password Input */}
              <View>
                <View style={styles.inputContainer}>
                  <Lock color="#9CA3AF" size={20} style={styles.inputIcon} />
                  <Controller
                    control={control}
                    name="password"
                    rules={{
                      required: "La contraseña es obligatoria",
                      minLength: { value: 3, message: "Mínimo 3 caracteres" },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={styles.input}
                        placeholder="Contraseña"
                        placeholderTextColor="#9CA3AF"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        secureTextEntry={!showPassword} // Ocultar/mostrar
                      />
                    )}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff color="#9CA3AF" size={20} />
                    ) : (
                      <Eye color="#9CA3AF" size={20} />
                    )}
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text style={styles.errorText}>
                    {errors.password.message}
                  </Text>
                )}
              </View>

              {/* AVISO DE RECAPTCHA (EN LUGAR DEL COMPONENTE) */}
              {showRecaptcha && (
                <View style={styles.recaptchaPlaceholder}>
                  <Text style={styles.recaptchaText}>
                    (Aquí iría el componente ReCAPTCHA nativo)
                  </Text>
                </View>
              )}

              {/* 2FA Input */}
              {twoFactorRequired && (
                <TextInput
                  style={[styles.input, { paddingHorizontal: 16 }]} // Input sin icono
                  placeholder="Código 2FA"
                  placeholderTextColor="#9CA3AF"
                  value={twoFAToken}
                  onChangeText={setTwoFAToken}
                  keyboardType="numeric"
                  maxLength={6}
                />
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.button}
                onPress={handleSubmit(onSubmit)} // Así se llama a 'onSubmit'
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Iniciar sesión</Text>
                )}
              </TouchableOpacity>

              {/* Forgot Password Link */}
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => navigation.navigate("ForgotPassword")} // Asume que tienes esta ruta
              >
                <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

// --- ESTILOS "TRADUCIDOS" DE TAILWIND ---
const styles = StyleSheet.create({
  background: {
    flex: 1, // Ocupa toda la pantalla
  },
  container: {
    flex: 1,
    justifyContent: "center", // Centra el contenido
    alignItems: "center",
    padding: 16, // p-4
    // El "backdrop-blur" no es directo, usamos un fondo semitransparente
  },
  // Estilo para el ScrollView contentContainerStyle: permite que el contenido crezca
  // y se desplace cuando aparece el teclado.
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 400, // max-w-md
    backgroundColor: "rgba(0, 0, 0, 0.65)", // bg-black/50 + backdrop-blur
    borderRadius: 16, // rounded-2xl
    padding: 24, // p-6 (aprox)
    // Sombra (opcional, apenas se ve en fondo oscuro)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  header: {
    alignItems: "center", // text-center
    marginBottom: 24, // space-y-6 en el form
  },
  logoWrapper: {
    height: 64, // h-16
    width: 64, // w-16
    borderRadius: 32, // rounded-full
    backgroundColor: "rgba(31, 41, 55, 0.8)", // bg-gray-800/80
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16, // mb-4
  },
  logo: {
    height: 56, // h-14
    width: 56, // w-14
    borderRadius: 28, // rounded-full
  },
  title: {
    fontSize: 28, // text-3xl
    fontWeight: "bold",
    color: "#FFFFFF", // text-white
  },
  subtitle: {
    marginTop: 4, // mt-1
    color: "#D1D5DB", // text-gray-300
  },
  form: {
    width: "100%",
    gap: 20, // space-y-6 (gap es más moderno)
  },
  inputContainer: {
    position: "relative", // relative
    width: "100%",
    justifyContent: "center",
  },
  inputIcon: {
    position: "absolute", // absolute
    left: 12, // left-3
    zIndex: 1,
    // -translate-y-1/2 se logra con justifyContent: 'center' en el container
  },
  eyeIcon: {
    position: "absolute",
    right: 12, // right-3
    zIndex: 1,
    padding: 4, // Aumenta el área táctil
  },
  input: {
    width: "100%",
    height: 52, // py-6 (en RN es mejor height fijo)
    backgroundColor: "rgba(31, 41, 55, 0.8)", // bg-gray-800/80
    borderWidth: 1,
    borderColor: "#4B5563", // border-gray-700
    borderRadius: 8, // rounded-md (en el input)
    paddingLeft: 40, // pl-10
    paddingRight: 40, // pr-10 (para el ojito)
    color: "#FFFFFF", // text-white
    fontSize: 16,
    // focus:ring-2 se maneja en el state (no implementado aquí, es más complejo)
  },
  errorText: {
    color: "#F87171", // text-red-400
    fontSize: 12, // text-sm
    marginTop: 4, // -mt-4 no funciona, usamos mt
  },
  recaptchaPlaceholder: {
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: "rgba(31, 41, 55, 0.8)",
    borderRadius: 8,
  },
  recaptchaText: {
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  button: {
    width: "100%",
    paddingVertical: 14, // py-3
    backgroundColor: "#2563EB", // bg-blue-600
    borderRadius: 8, // rounded-lg
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF", // text-white
    fontSize: 16, // text-base
    fontWeight: "600", // font-semibold
  },
  linkButton: {
    alignItems: "center", // text-center
  },
  linkText: {
    color: "#60A5FA", // text-blue-400
    fontSize: 14, // text-sm
    // hover:underline no aplica en nativo
  },
});
