  import axios from "axios";
  import config from "../config";

  const API_URL = config.apiBaseUrl;

  const apiService = axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

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

  const handleRequest = async (request: Promise<any>) => {
  try {
    const response = await request;
    return response; // ✅ esto te dará acceso a response.status
  } catch (error: any) {
    console.error("Error en la petición:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Error en la API");
  }
};


  const apiServiceWrapper = {
    get: (endpoint: string, params = {}) =>
      handleRequest(apiService.get(endpoint, { params })),

    getById: (endpoint: string, id: number | string) =>
      handleRequest(apiService.get(`${endpoint}/${id}`)),

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
