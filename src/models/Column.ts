export interface Column<T> {
    key: keyof T;
    label: string;
}
