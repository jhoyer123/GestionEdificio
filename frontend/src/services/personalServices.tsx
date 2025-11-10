import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "https://gestionedificio-production.up.railway.app";
const API_URL = `${BASE}/api/personales`;

//Obterner todos los registros de personal
export const getPersonales = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching personal:", error);
    throw error;
  }
};

//obtener los datos de un personal por id
export const getPersonalById = async (id: number | null) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching personal by ID:", error);
    throw error;
  }
};

//Crear un nuevo personal
export const createPersonal = async (personalData: any) => {
  try {
    const response = await axios.post(API_URL, personalData);
    return response.data;
  } catch (error) {
    console.error("Error creating personal:", error);
    throw error;
  }
};

//Eliminar un personal quitandole el rol
export const deletePersonalRol = async (id: number, data: any) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, { data });
    return response.data;
  } catch (error) {
    console.error("Error deleting personal:", error);
    throw error;
  }
};

//Actualizar un personal
export const updatePersonal = async (id: number, personalData: any) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, personalData);
    return response.data;
  } catch (error) {
    console.error("Error updating personal:", error);
    throw error;
  }
};

//subir qr
export const uploadQR = async (id: number, qrFile: File) => {
  try {
    const formData = new FormData();
    formData.append("qr", qrFile);

    const response = await axios.post(`${API_URL}/${id}/upload-qr`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  } catch (error) {
    console.error("Error uploading QR code:", error);
    throw error;
  }
};
