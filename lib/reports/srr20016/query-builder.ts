// Query Builder สำหรับ SRR20016 - รายงานราคาสินค้าเปลี่ยนแปลง

import { SHOP_ID_PUBLIC } from '@/lib/constants';
import { BASE_QUERY_TEMPLATE, COLUMN_SCHEMA, REPORT_NAME, THAI_MONTHS } from './config';
import type { ReportFilters, PdfConfig } from './types';

// Format date for SQL (YYYY-MM-DD)
export const formatDateForQuery = (date: Date | null): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Format date for Thai display
export const formatThaiDate = (date: Date | null): string => {
    if (!date) return '';
    const day = date.getDate();
    const month = THAI_MONTHS[date.getMonth()];
    const year = date.getFullYear() + 543;
    return `${day} ${month} ${year}`;
};

// Build product filter SQL
export const buildProductFilter = (filters: ReportFilters): string => {
    const { product } = filters;
    switch (product.filterType) {
        case 'single':
            return product.selectedProduct
                ? ` and d.item_code = '${product.selectedProduct}'`
                : '';
        case 'range':
            return product.rangeStart && product.rangeEnd
                ? ` and d.item_code between '${product.rangeStart}' and '${product.rangeEnd}'`
                : '';
        case 'multiple':
            return product.selectedProducts.length > 0
                ? ` and d.item_code in ('${product.selectedProducts.join("','")}')`
                : '';
        default:
            return '';
    }
};

// Build product group filter SQL
export const buildProductGroupFilter = (filters: ReportFilters): string => {
    const { productGroup } = filters;
    switch (productGroup.filterType) {
        case 'single':
            return productGroup.selectedProductGroup
                ? ` and ic.group_main = '${productGroup.selectedProductGroup}'`
                : '';
        case 'range':
            return productGroup.rangeStart && productGroup.rangeEnd
                ? ` and ic.group_main between '${productGroup.rangeStart}' and '${productGroup.rangeEnd}'`
                : '';
        case 'multiple':
            return productGroup.selectedProductGroups.length > 0
                ? ` and ic.group_main in ('${productGroup.selectedProductGroups.join("','")}')`
                : '';
        default:
            return '';
    }
};

// Build product brand filter SQL
export const buildProductBrandFilter = (filters: ReportFilters): string => {
    const { productBrand } = filters;
    switch (productBrand.filterType) {
        case 'single':
            return productBrand.selectedProductBrand
                ? ` and ic.item_brand = '${productBrand.selectedProductBrand}'`
                : '';
        case 'range':
            return productBrand.rangeStart && productBrand.rangeEnd
                ? ` and ic.item_brand between '${productBrand.rangeStart}' and '${productBrand.rangeEnd}'`
                : '';
        case 'multiple':
            return productBrand.selectedProductBrands.length > 0
                ? ` and ic.item_brand in ('${productBrand.selectedProductBrands.join("','")}')`
                : '';
        default:
            return '';
    }
};

// Build complete query
export const buildQuery = (
    startDate: Date | null,
    endDate: Date | null,
    filters: ReportFilters
): string => {
    let query = BASE_QUERY_TEMPLATE
        .replace('{{start_date}}', formatDateForQuery(startDate))
        .replace('{{end_date}}', formatDateForQuery(endDate))
        .replace('{{product_filter}}', buildProductFilter(filters))
        .replace('{{product_group_filter}}', buildProductGroupFilter(filters))
        .replace('{{product_brand_filter}}', buildProductBrandFilter(filters));

    return query;
};

// Build PDF config - แบบ Level ตามตัวอย่าง B4029
export const buildPdfConfig = (
    guid: string,
    startDate: Date | null,
    endDate: Date | null
): PdfConfig => {
    return {
        shopid: SHOP_ID_PUBLIC,
        guid,
        pdf_config: {
            title: REPORT_NAME,
            description: `ตั้งแต่วันที่ ${formatThaiDate(startDate)} ถึงวันที่ ${formatThaiDate(endDate)}`,
            orientation: 'L',
            page_size: 'A4',
            title_align: 'C',
            description_align: 'L'
        },
        layout_config: {
            schema_version: 1,
            styles: {
                use_fill: false,
                header: {
                    background: "#FFFFFF",
                    text: "#000000",
                    border: "#000000",
                    font_weight: "bold"
                },
                detail: {
                    background: "#FFFFFF",
                    text: "#000000",
                    border: "#E0E0E0"
                },
                summary: {
                    background: "#F5F5F5",
                    text: "#000000",
                    border: "#000000",
                    font_weight: "bold"
                },
                level_1: {
                    background: "#F5F5F5",
                    text: "#000000",
                    border: "#000000",
                    font_weight: "bold"
                },
                table: {
                    row_spacing: 0,
                    column_spacing: 2,
                    grid_color: "#CCCCCC"
                }
            },
            sections: [
                // Level 1: กลุ่มตาม line_num, doc_date_new, doc_time_new, doc_date_old, doc_time_old, ic_code, name_1, unit_code_new, group_main, item_brand, user_name
                {
                    alias: "price_changes",
                    row_type: "level_1",
                    columns: [
                        { field: "line_num" },
                        { field: "doc_date_new" },
                        { field: "doc_time_new" },
                        { field: "doc_date_old" },
                        { field: "doc_time_old" },
                        { field: "ic_code" },
                        { field: "name_1" },
                        { field: "unit_code_new" },
                        { field: "group_main" },
                        { field: "item_brand" },
                        { field: "user_name" }
                    ]
                },
                // Detail rows - เพิ่ม spacer columns เพื่อให้อยู่ชิดซ้าย
                {
                    alias: "price_changes",
                    row_type: "detail",
                    columns: [
                        { field: "price_tag" },
                        { field: "old_amount" },
                        { field: "new_amount" },
                        { field: "diff_amount" },
                        { field: "per_diff_amount" },
                        { field: "spacer_1" },
                        { field: "spacer_2" },
                        { field: "spacer_3" },
                        { field: "spacer_4" }
                    ]
                }
            ],
            column_schema: COLUMN_SCHEMA,
        }
    };
};

// Calculate date from preset
export const calculateDateFromPreset = (preset: string): { startDate: Date; endDate: Date } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (preset) {
        case 'today':
            return { startDate: new Date(today), endDate: new Date(today) };
        case 'yesterday': {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return { startDate: yesterday, endDate: yesterday };
        }
        case 'this_week': {
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            return { startDate: startOfWeek, endDate: new Date(today) };
        }
        case 'last_week': {
            const startOfLastWeek = new Date(today);
            startOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
            const endOfLastWeek = new Date(startOfLastWeek);
            endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
            return { startDate: startOfLastWeek, endDate: endOfLastWeek };
        }
        case 'this_month': {
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            return { startDate: startOfMonth, endDate: new Date(today) };
        }
        case 'last_month': {
            const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            return { startDate: startOfLastMonth, endDate: endOfLastMonth };
        }
        case 'this_year': {
            const startOfYear = new Date(today.getFullYear(), 0, 1);
            return { startDate: startOfYear, endDate: new Date(today) };
        }
        case 'last_year': {
            const startOfLastYear = new Date(today.getFullYear() - 1, 0, 1);
            const endOfLastYear = new Date(today.getFullYear() - 1, 11, 31);
            return { startDate: startOfLastYear, endDate: endOfLastYear };
        }
        default:
            return { startDate: new Date(today), endDate: new Date(today) };
    }
};

// Serialize filters to JSON string (for storing in DB)
export const serializeFilters = (filters: ReportFilters): string => {
    return JSON.stringify(filters);
};

// Deserialize filters from JSON string
export const deserializeFilters = (json: string): ReportFilters => {
    try {
        return JSON.parse(json);
    } catch {
        const { getDefaultReportFilters } = require('./config');
        return getDefaultReportFilters();
    }
};
