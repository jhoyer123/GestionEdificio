import axios from "axios";

const API_URL = "http://localhost:3000/api/usuarios";

export const getUsuarios = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching usuarios:", error);
    throw error;
  }
};
