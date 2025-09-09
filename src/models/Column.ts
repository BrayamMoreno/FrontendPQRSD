export interface Column<T> {
  key: keyof T & string; // 👈 fuerza que sea string
  // el campo que corresponde en el objeto
  label: string;              // el texto que muestras en la UI
  type?: string; // 👈 opcional
}
