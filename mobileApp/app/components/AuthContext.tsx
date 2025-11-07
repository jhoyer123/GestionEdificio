import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
// 1. Importar AsyncStorage
import AsyncStorage from "@react-native-async-storage/async-storage";

// ======== Tipos (SIN CAMBIOS) ========
export interface Rol {
  id: number;
  rol: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: Rol[];
  two_factor_enabled: boolean;
}

// ======== Tipo del contexto (ACTUALIZADO) ========
interface AuthContextType {
  user: Usuario | null;
  isLoading: boolean; // ⬅️ NUEVO: Para saber si está cargando el usuario
  loginUser: (userData: Usuario) => Promise<void>; // ⬅️ ACTUALIZADO: Ahora es async
  logoutUser: () => Promise<void>; // ⬅️ ACTUALIZADO: Ahora es async
}

// ======== Contexto (SIN CAMBIOS) ========
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ======== Provider (ACTUALIZADO) ========
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true); // ⬅️ NUEVO: Empezamos cargando

  // 🔹 Cargar usuario del AsyncStorage al iniciar
  useEffect(() => {
    // Creamos una función async dentro del useEffect
    const loadUserFromStorage = async () => {
      try {
        // 2. Usamos AsyncStorage.getItem (es async)
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Failed to load user from storage", e);
      } finally {
        // ⬅️ NUEVO: Terminamos de cargar, tenga o no usuario
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // 🔹 Guardar usuario al hacer login
  const loginUser = async (userData: Usuario) => {
    try {
      setUser(userData);
      // 3. Usamos AsyncStorage.setItem (es async)
      await AsyncStorage.setItem("user", JSON.stringify(userData));
    } catch (e) {
      console.error("Failed to save user to storage", e);
    }
  };

  // 🔹 Eliminar usuario al hacer logout
  const logoutUser = async () => {
    try {
      setUser(null);
      // 4. Usamos AsyncStorage.removeItem (es async)
      await AsyncStorage.removeItem("user");
    } catch (e) {
      console.error("Failed to remove user from storage", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, loginUser, logoutUser }} // ⬅️ ACTUALIZADO: Pasamos isLoading
    >
      {children}
    </AuthContext.Provider>
  );
};

// ======== Hook personalizado (ACTUALIZADO) ========
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
