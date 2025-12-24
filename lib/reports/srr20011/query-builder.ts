// lib/reports/srr20011/query-builder.ts

import { SHOP_ID_PUBLIC } from '@/lib/constants';
import { BASE_QUERY_TEMPLATE, COLUMN_SCHEMA, REPORT_NAME, THAI_MONTHS, getDefaultReportFilters } from './config';
import { SHARED_PDF_STYLES } from '../shared-styles';
import type { ReportFilters, QueryConfig, PdfConfig } from './types';

// Format date for SQL
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
                ? `AND code = '${product.selectedProduct}'`
                : '';
        case 'range':
            return product.rangeStart && product.rangeEnd
                ? `AND code BETWEEN '${product.rangeStart}' AND '${product.rangeEnd}'`
                : '';
        case 'multiple':
            return product.selectedProducts.length > 0
                ? `AND code IN ('${product.selectedProducts.join("','")}')`
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
            return productGroup.selectedGroup
                ? `AND (SELECT ic_inventory.group_main FROM ic_inventory WHERE ic_inventory.code = master_logs.code) = '${productGroup.selectedGroup}'`
                : '';
        case 'range':
            return productGroup.rangeStart && productGroup.rangeEnd
                ? `AND (SELECT ic_inventory.group_main FROM ic_inventory WHERE ic_inventory.code = master_logs.code) BETWEEN '${productGroup.rangeStart}' AND '${productGroup.rangeEnd}'`
                : '';
        case 'multiple':
            return productGroup.selectedGroups.length > 0
                ? `AND (SELECT ic_inventory.group_main FROM ic_inventory WHERE ic_inventory.code = master_logs.code) IN ('${productGroup.selectedGroups.join("','")}')`
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
            return productBrand.selectedBrand
                ? `AND (SELECT ic_inventory.brand FROM ic_inventory WHERE ic_inventory.code = master_logs.code) = '${productBrand.selectedBrand}'`
                : '';
        case 'range':
            return productBrand.rangeStart && productBrand.rangeEnd
                ? `AND (SELECT ic_inventory.brand FROM ic_inventory WHERE ic_inventory.code = master_logs.code) BETWEEN '${productBrand.rangeStart}' AND '${productBrand.rangeEnd}'`
                : '';
        case 'multiple':
            return productBrand.selectedBrands.length > 0
                ? `AND (SELECT ic_inventory.brand FROM ic_inventory WHERE ic_inventory.code = master_logs.code) IN ('${productBrand.selectedBrands.join("','")}')`
                : '';
        default:
            return '';
    }
};

// Build complete query
export const buildQuery = (config: QueryConfig): string => {
    const { startDate, endDate, filters } = config;

    let query = BASE_QUERY_TEMPLATE
        .replace('{{startDate}}', formatDateForQuery(startDate))
        .replace('{{endDate}}', formatDateForQuery(endDate))
        .replace('{{productFilter}}', buildProductFilter(filters))
        .replace('{{productGroupFilter}}', buildProductGroupFilter(filters))
        .replace('{{productBrandFilter}}', buildProductBrandFilter(filters));

    return query;
};

// Build PDF config
export const buildPdfConfig = (guid: string, startDate: Date | null, endDate: Date | null): PdfConfig => {
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
            styles: SHARED_PDF_STYLES,
            sections: [{
                alias: "report_data",
                row_type: "detail",
                columns: Object.keys(COLUMN_SCHEMA).map(field => ({ field }))
            }],
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
        return getDefaultReportFilters();
    }
};
