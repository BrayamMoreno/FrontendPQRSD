import config from "../config";
import { useAlert } from "../context/AlertContext";

export const useDownloadFile = () => {
    const { showAlert } = useAlert();
    const API_URL = config.apiBaseUrl;
    const token = sessionStorage.getItem("jwt");

    const downloadFile = async (id: number, nombreArchivo: string) => {
        try {
            const response = await fetch(`${API_URL}/adjuntos_pq/${id}/download`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);

                const link = document.createElement("a");
                link.href = url;
                link.download = nombreArchivo;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            if (response.status === 404) {
                showAlert("Archivo no encontrado en el servidor", "error");
                return;
            }

            if (response.status !== 200 && response.status !== 404) {
                showAlert("Error desconocido. Por favor, intente nuevamente.", "error");
                console.log("Error al descargar el archivo:", response.body);
                return;
            }
        } catch (error) {
            console.error(error);
            alert("No se pudo descargar el archivo");
        }
    };

    return { downloadFile };
};
