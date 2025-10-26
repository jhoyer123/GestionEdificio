import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

//Crear un anuncio
export const createAnuncio = async (data: any) => {
  try {
    const response = await axios.post(`${API_URL}/api/anuncios`, data, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener todos los anuncios
export const getAnuncios = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/anuncios`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener un anuncio por ID
/* export const getAnuncioById = async (id: number) => {
  const response = await axios.get(`${API_URL}/anuncios/${id}`, {
    withCredentials: true,
  });
  return response.data;
}; */

// Actualizar un anuncio
export const updateAnuncio = async (id: number, data: any) => {
  try {
    const response = await axios.put(`${API_URL}/api/anuncios/${id}`, data, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Eliminar un anuncio
export const deleteAnuncio = async (id: number) => {
  try {
    const response = await axios.delete(`${API_URL}/api/anuncios/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

//marcar anuncio como visto por el usuario
export const marcarAnuncioVisto = async (
  usuarioId: number,
  anuncioId: number
) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/anuncios/visto`,
      { usuarioId, anuncioId },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
