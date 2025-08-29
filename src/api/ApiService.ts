import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse
} from "axios";
import config from "../config";
import type { PaginatedResponse } from "../models/PaginatedResponse";

const API_URL = config.apiBaseUrl;

const apiService = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para añadir el token
apiService.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Manejador centralizado de errores
const handleRequest = async <T>(
  request: Promise<AxiosResponse<T>>
): Promise<T> => {
  try {
    const { data } = await request;
    return data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(
      "Error en la petición:",
      axiosError.response?.data || axiosError.message
    );
    throw axiosError; // Se relanza para que el componente pueda manejarlo
  }
};

// Wrapper con métodos HTTP
const apiServiceWrapper = {
  get: <T>(endpoint: string, params?: AxiosRequestConfig["params"]): Promise<T> =>
    handleRequest<T>(apiService.get<T>(endpoint, { params })),

  getPaginated: <T>(
    endpoint: string,
    params?: AxiosRequestConfig["params"]
  ): Promise<PaginatedResponse<T>> =>
    handleRequest<PaginatedResponse<T>>(apiService.get(endpoint, { params })),

  getById: <T>(endpoint: string, id: number | string): Promise<T> =>
    handleRequest<T>(apiService.get<T>(`${endpoint}/${id}`)),

  post: (endpoint: string, data: any) =>
    handleRequest(apiService.post(endpoint, data)),

  put: (endpoint: string, data: any) =>
    handleRequest(apiService.put(endpoint, data)),

  patch: (endpoint: string, data: any) =>
    handleRequest(apiService.patch(endpoint, data)),

  delete: (endpoint: string, data: any) =>
    handleRequest(apiService.delete(endpoint, data)),

};

export default apiServiceWrapper;
