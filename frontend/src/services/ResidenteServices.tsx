import axios from "axios";

// API endpoint
const API_URL = "http://localhost:3000/api/residentes";

// Get all residentes
export const getResidentes = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching residentes:", error);
    throw error;
  }
};
