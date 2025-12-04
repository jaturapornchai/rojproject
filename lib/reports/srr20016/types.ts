// Types สำหรับ SRR20016 - รายงานราคาสินค้าเปลี่ยนแปลง

export interface Product {
    code: string;
    name_1: string;
    unit_cost: string;
}

export interface ProductGroup {
    code: string;
    name_1: string;
}

export interface ProductBrand {
    code: string;
    name_1: string;
}

// Filter Types
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
    selectedProductGroup: string;
    rangeStart: string;
    rangeEnd: string;
    selectedProductGroups: string[];
}

export interface ProductBrandFilterState {
    filterType: FilterType;
    selectedProductBrand: string;
    rangeStart: string;
    rangeEnd: string;
    selectedProductBrands: string[];
}

export interface ReportFilters {
    product: ProductFilterState;
    productGroup: ProductGroupFilterState;
    productBrand: ProductBrandFilterState;
}

// Date Range
export interface DateRange {
    startDate: Date | null;
    endDate: Date | null;
}

// Query Config สำหรับส่ง API
export interface QueryConfig {
    shopid: string;
    limit?: number;
    query_items: QueryItem[];
}

export interface QueryItem {
    alias: string;
    query: string;
    summary_config?: SummaryConfig;
}

export interface SummaryConfig {
    levels: SummaryLevel[];
    grand_total: boolean;
    grand_total_type: number;
}

export interface SummaryLevel {
    group_by_fields: string[];
    sum_fields: string[];
    typejson: number;
}

// PDF Config
export interface PdfConfig {
    shopid: string;
    guid?: string;
    pdf_config: {
        title: string;
        description: string;
        orientation: 'L' | 'P';
        page_size: string;
        title_align: 'L' | 'C' | 'R';
        description_align: 'L' | 'C' | 'R';
    };
    layout_config: LayoutConfig;
}

export interface LayoutConfig {
    schema_version: number;
    styles: LayoutStyles;
    sections: LayoutSection[];
    column_schema: Record<string, ColumnSchema>;
}

export interface LayoutStyles {
    use_fill: boolean;
    header: StyleConfig;
    detail: StyleConfig;
    summary: StyleConfig;
    level_1: StyleConfig;
    table?: TableStyle;
}

export interface StyleConfig {
    background: string;
    text: string;
    border: string;
    font_weight?: string;
}

export interface TableStyle {
    row_spacing: number;
    column_spacing: number;
    grid_color: string;
}

export interface LayoutSection {
    alias: string;
    row_type: string;
    columns: { field: string }[];
}

export interface ColumnSchema {
    label: string;
    flex: number;
    align: 'L' | 'C' | 'R';
    data_type?: string;
    format?: string;
    use_buddhist_year?: boolean;
    text_color_negative?: string;
}

// Email Schedule
export interface EmailSchedule {
    schedule_id: string;
    schedule_name: string;
    shopid: string;
    reportid: string;
    report_name: string;
    enabled: boolean;
    date_preset: string;
    days_of_week: number[];
    times: string[];
    timezone: string;
    recipients: string[];
    cc_recipients: string[];
    email_subject: string;
    include_pdf: boolean;
    query_config?: QueryConfig;
    pdf_config?: PdfConfig;
    filter_config?: ReportFilters;
    created_at?: string;
    updated_at?: string;
}

// Date Presets
export interface DatePreset {
    value: string;
    label: string;
}

export interface DayOfWeek {
    value: number;
    label: string;
}
