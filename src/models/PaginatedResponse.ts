export interface PaginatedResponse<T> {
    data: T[];
    total_count: number;
    has_more: boolean;
    page: number;
    items_per_page: number;

    _meta?: {
        status: number;
        statusText: string;
        headers: Record<string, any>;
        method?: string;
        url?: string;
        params?: Record<string, any>;
        requestData?: any;
    };
}
