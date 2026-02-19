import axios from "axios";
import { API_URL } from "../config/api";

// Récupérer les données de la page À Propos
export const getAboutData = async () => {
  const response = await axios.get(`${API_URL}/api/about`);
  return response.data;
};

// Mettre à jour les données (nécessite cookie admin)
export const updateAboutData = async (data: any) => {
  const config = {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  };
  const response = await axios.put(`${API_URL}/api/about`, data, config);
  return response.data;
};
