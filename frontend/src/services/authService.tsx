import axios from "axios";

const API_URL = "http://localhost:3000/api";

interface AuthCredentials {
  email: string;
  password: string;
}

// INICIAR SESION
export const login = async (AuthCredentials: AuthCredentials) => {
  try {
    const { data } = await axios.post(`${API_URL}/login`, AuthCredentials, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    let backendMessage = "Error al iniciar sesión";
    if (axios.isAxiosError(error)) {
      backendMessage = error.response?.data?.error || backendMessage;
    }
    throw new Error(backendMessage);
  }
};

// CERRAR SESION
export const logout = async () => {
  try {
    // Petición al backend
    await axios.post(
      `${API_URL}/logout`,
      {},
      {
        withCredentials: true, // si usas cookies
      }
    );
    localStorage.clear();
    return console.log("Sesión cerrada correctamente");
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return false;
  }
};
