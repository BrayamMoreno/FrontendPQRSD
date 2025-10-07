export interface Column<T> {
    key: keyof T & string;
    label: string;
    type?: string;
}
