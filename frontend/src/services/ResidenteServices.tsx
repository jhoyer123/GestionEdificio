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

//crear residente
export const createResidente = async (residenteData: any) => {
  try {
    const response = await axios.post(API_URL, residenteData);
    return response.data;
  } catch (error) {
    console.error("Error creating residente:", error);
    throw error;
  }
};

//Eliminar un residente quitandole el rol
export const deleteResidente = async (id: number, data: any) => {
  try {
    console.log("Data being sent for deletion:", data); // Log the data being sent
    const response = await axios.delete(`${API_URL}/${id}`, { data });
    return response.data;
  } catch (error) {
    console.error("Error deleting residente:", error);
    throw error;
  }
};

//actualizar un residente
export const updateResidente = async (id: number, residenteData: any) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, residenteData);
    return response.data;
  } catch (error) {
    console.error("Error updating residente:", error);
    throw error;
  }
};