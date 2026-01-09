import axios from "axios";
import { API_URL } from "../config/api";

export interface Album {
  _id: string;
  titre: string;
  description?: string;
  imageCouverture?: string;
  createdAt?: string;
}

export const albumService = {
  getAlbums: async (): Promise<Album[]> => {
    const res = await axios.get(`${API_URL}/api/albums`, {
      withCredentials: true,
    });
    return res.data;
  },

  createAlbum: async (album: Partial<Album>): Promise<Album> => {
    const res = await axios.post(`${API_URL}/api/albums`, album, {
      withCredentials: true,
    });
    return res.data;
  },

  updateAlbum: async (id: string, album: Partial<Album>): Promise<Album> => {
    const res = await axios.put(`${API_URL}/api/albums/${id}`, album, {
      withCredentials: true,
    });
    return res.data;
  },

  deleteAlbum: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/api/albums/${id}`, {
      withCredentials: true,
    });
  },
};
