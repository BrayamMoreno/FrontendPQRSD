import { createContext, useContext, useState, type ReactNode } from "react";

type AlertType = "success" | "error" | "info" | "warning";

interface Alert {
    id: number;
    message: string;
    type: AlertType;
}

interface AlertContextType {
    showAlert: (message: string, type?: AlertType) => void;
}

const AlertContext = createContext<AlertContextType>({
    showAlert: () => { },
});

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
    const [alerts, setAlerts] = useState<Alert[]>([]);

    const showAlert = (message: string, type: AlertType = "info") => {
        const id = Date.now();
        setAlerts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setAlerts((prev) => prev.filter((a) => a.id !== id));
        }, 4000);
    };

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}
            <div className="fixed top-32 left-1/2 -translate-x-1/2 z-[9999] space-y-3 w-full max-w-md flex flex-col items-center">
                {alerts.map((alert) => (
                    <div
                        key={alert.id}
                        className={`px-4 py-3 rounded-lg shadow-lg text-white text-center animate-fade-in-down w-11/12 ${alert.type === "success"
                                ? "bg-green-600"
                                : alert.type === "error"
                                    ? "bg-red-600"
                                    : alert.type === "warning"
                                        ? "bg-yellow-500 text-black"
                                        : "bg-blue-600"
                            }`}
                    >
                        {alert.message}
                    </div>
                ))}
            </div>
        </AlertContext.Provider>
    );
};
