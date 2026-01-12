/**
 * ✅ INTERCEPTEUR AXIOS POUR REFRESH TOKEN AUTOMATIQUE
 * 
 * Intercepte les erreurs 401 (token expiré) et tente automatiquement
 * de renouveler l'access token avec le refresh token avant de relancer la requête
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '../config/api';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

/**
 * Traite les requêtes en attente après le refresh
 */
const processQueue = (error: Error | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

/**
 * Configure l'interceptor axios global
 */
export const setupAxiosInterceptor = () => {
  // Intercepteur de réponse pour gérer les erreurs 401
  axios.interceptors.response.use(
    (response) => response, // Laisse passer les réponses OK
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // Si erreur 401 et pas déjà tenté de refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        // Si déjà en train de refresh, mettre en queue
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => axios(originalRequest))
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // ✅ Appel au backend pour renouveler le token
          await axios.post(
            `${API_URL}/api/auth/refresh`,
            {},
            { withCredentials: true }
          );

          // Token renouvelé avec succès, traiter la queue
          processQueue();
          isRefreshing = false;

          // Relancer la requête originale
          return axios(originalRequest);
        } catch (refreshError) {
          // Refresh token expiré ou invalide → déconnexion
          processQueue(new Error('Session expirée'));
          isRefreshing = false;

          // Redirection vers la page de connexion
          window.location.href = '/connexion';
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};
