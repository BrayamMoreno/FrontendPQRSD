export interface PaginatedResponse<T> {
    data: T[];
    total_count: number;
    has_more: boolean;
    page: number;
    items_per_page: number;
}
