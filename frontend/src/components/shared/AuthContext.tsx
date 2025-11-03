import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

// ======== Tipos ========
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

// ======== Tipo del contexto ========
interface AuthContextType {
  user: Usuario | null;
  loginUser: (userData: Usuario) => void;
  logoutUser: () => void;
}

// ======== Contexto ========
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ======== Provider ========
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<Usuario | null>(null);

  // 🔹 Cargar usuario del localStorage al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // 🔹 Guardar usuario al hacer login
  const loginUser = (userData: Usuario) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // 🔹 Eliminar usuario al hacer logout
  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// ======== Hook personalizado ========
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
