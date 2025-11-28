// lib/reports/srr20011/types.ts

// Master data types
export interface Product {
    code: string;
    name_1: string;
    unit_cost?: number;
}

export interface ProductGroup {
    code: string;
    name_1: string;
}

export interface ProductBrand {
    code: string;
    name_1: string;
}

// Filter types
export type FilterType = 'all' | 'single' | 'range' | 'multiple';

export interface ProductFilterState {
    filterType: FilterType;
    selectedProduct: string;
    rangeStart: string;
    rangeEnd: string;
    selectedProducts: string[];
}

export interface ProductGroupFilterState {
    filterType: FilterType;
    selectedGroup: string;
    rangeStart: string;
    rangeEnd: string;
    selectedGroups: string[];
}

export interface ProductBrandFilterState {
    filterType: FilterType;
    selectedBrand: string;
    rangeStart: string;
    rangeEnd: string;
    selectedBrands: string[];
}

export interface ReportFilters {
    product: ProductFilterState;
    productGroup: ProductGroupFilterState;
    productBrand: ProductBrandFilterState;
}

// Query config types
export interface QueryConfig {
    startDate: Date | null;
    endDate: Date | null;
    filters: ReportFilters;
}

// PDF config types
export interface PdfConfig {
    shopid: string;
    guid: string;
    pdf_config: {
        title: string;
        description: string;
        orientation: 'L' | 'P';
        page_size: string;
    };
    layout_config: {
        schema_version: number;
        styles: Record<string, unknown>;
        sections: Array<{ alias: string; row_type: string; columns: Array<{ field: string }> }>;
        column_schema: Record<string, unknown>;
    };
}

// Email schedule types
export interface EmailSchedule {
    shopid: string;
    reportid: string;
    schedule_id: string;
    schedule_name: string;
    report_name: string;
    enabled: boolean;
    date_preset: string;
    filter_config?: string;
    days_of_week: number[];
    times: string[];
    timezone: string;
    recipients: string[];
    cc_recipients?: string[];
    email_subject: string;
    include_pdf: boolean;
    query_config: Record<string, unknown>;
    pdf_config: Record<string, unknown>;
    created_at?: string;
    updated_at?: string;
}

// Preset types
export interface DatePreset {
    value: string;
    label: string;
}

export interface DayOfWeek {
    value: number;
    label: string;
}

// Report log type
export interface ReportLog {
    email: string;
    report_name: string;
    conditions: string;
    created_at: string;
}
