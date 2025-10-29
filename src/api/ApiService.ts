import axios, {
    AxiosError,
    type AxiosRequestConfig,
    type AxiosResponse,
} from "axios";
import config from "../config";

const API_URL = config.apiBaseUrl;


const apiService = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// 🔹 Inyecta el token JWT en cada petición si existe
apiService.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem("jwt");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiService.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        if (status === 401) {
            console.warn("Token expirado o inválido. Cerrando sesión...");

            // Limpia la sesión
            sessionStorage.clear();

            // Evita múltiples redirecciones si ya estás en /login
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

// 🔹 Manejador de peticiones centralizado
const handleRequest = async <T>(
    request: Promise<AxiosResponse<T>>,
    injectMeta = true
): Promise<T | AxiosResponse<T> | { status: number; data?: any; error?: string }> => {
    try {
        const response = await request;
        const data = response.data;

        if (!injectMeta) {
            return response;
        }

        const meta = {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            method: response.config.method,
            url: response.config.url,
            params: response.config.params,
            requestData: response.config.data,
        };

        if (
            data &&
            typeof data === "object" &&
            "data" in data &&
            "total_count" in data
        ) {
            return { ...(data as any), _meta: meta } as T;
        }

        return { ...(data as any), _meta: meta };
    } catch (error) {
        const axiosError = error as AxiosError<any>;
        const status = axiosError.response?.status ?? 500;
        const data = axiosError.response?.data;
        const apiMessage =
            axiosError.response?.data?.mensaje ||
            axiosError.response?.data?.messaje;

        const friendlyMessage =
            apiMessage ||
            (axiosError.response
                ? `Error ${status}: ${axiosError.response.statusText}`
                : axiosError.message);

        console.error("Error en la petición:", friendlyMessage);

        return {
            status,
            data,
            error: friendlyMessage,
        };
    }
};

const apiServiceWrapper = {
    get: <T>(
        endpoint: string,
        params?: AxiosRequestConfig["params"]
    ): Promise<T> =>
        handleRequest<T>(apiService.get<T>(endpoint, { params }), true) as Promise<T>,

    getById: <T>(
        endpoint: string,
        id: number | string
    ): Promise<T> =>
        handleRequest<T>(apiService.get<T>(`${endpoint}/${id}`), true) as Promise<T>,

    getAll: <T>(
        endpoint: string,
        params?: AxiosRequestConfig["params"]
    ): Promise<AxiosResponse<T>> =>
        handleRequest<T>(apiService.get<T>(endpoint, { params }), false) as Promise<
            AxiosResponse<T>
        >,

    post: <T = any>(
        endpoint: string,
        data: any
    ): Promise<AxiosResponse<T>> =>
        handleRequest<T>(apiService.post<T>(endpoint, data), false) as Promise<
            AxiosResponse<T>
        >,

    put: <T = any>(
        endpoint: string,
        data: any
    ): Promise<AxiosResponse<T>> =>
        handleRequest<T>(apiService.put<T>(endpoint, data), false) as Promise<
            AxiosResponse<T>
        >,

    patch: <T = any>(
        endpoint: string,
        data: any
    ): Promise<AxiosResponse<T>> =>
        handleRequest<T>(apiService.patch<T>(endpoint, data), false) as Promise<
            AxiosResponse<T>
        >,

    delete: <T = any>(
        endpoint: string,
        params?: AxiosRequestConfig["params"]
    ): Promise<AxiosResponse<T>> =>
        handleRequest<T>(apiService.delete<T>(endpoint, { params }), false) as Promise<
            AxiosResponse<T>
        >,
};

export { apiService };
export default apiServiceWrapper;
