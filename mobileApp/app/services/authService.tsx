import axios from "axios";
import { API_URL } from "../config/api";

    // INICIAR SESION — acepta payload flexible (email/password, token, recaptchaToken...)
    export const login = async (payload: Record<string, any>) => {
    try {
        console.log("Payload de login:", API_URL);
        const { data } = await axios.post(`${API_URL}/login`, payload, {
        withCredentials: true,
        });
        return data;
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        throw error;
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

    //generar 2FA
    export const generate2FA = async (username: string) => {
    try {
        const response = await axios.post(
        `${API_URL}/generate-2fa`,
        { username },
        { withCredentials: true }
        );
        return response.data; // Devuelve el código QR y el secreto
    } catch (error) {
        console.error("Error al generar 2FA:", error);
        return false;
    }
    };

    //verificar 2FA
    export const verify2FA = async (
    id: number,
    token: string,
    secretBase32: string
    ) => {
    try {
        const response = await axios.post(`${API_URL}/2fa/verify`, {
        id,
        token,
        secretBase32,
        });
        return response.data;
    } catch (error) {
        console.error("Error al verificar 2FA:", error);
        return false;
    }
    };
