// Query Builder สำหรับ SRR40006 - รายงานจัดอันดับยอดขาย-ตามกลุ่มสินค้า

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

// Build product group filter SQL
export const buildProductGroupFilter = (filters: ReportFilters): string => {
    const { productGroup } = filters;
    switch (productGroup.filterType) {
        case 'single':
            return productGroup.selectedProductGroup
                ? ` and (select group_main from ic_inventory where ic_inventory.code = ic_trans_detail.item_code) = '${productGroup.selectedProductGroup}'`
                : '';
        case 'range':
            return productGroup.rangeStart && productGroup.rangeEnd
                ? ` and (select group_main from ic_inventory where ic_inventory.code = ic_trans_detail.item_code) between '${productGroup.rangeStart}' and '${productGroup.rangeEnd}'`
                : '';
        case 'multiple':
            return productGroup.selectedProductGroups.length > 0
                ? ` and (select group_main from ic_inventory where ic_inventory.code = ic_trans_detail.item_code) in ('${productGroup.selectedProductGroups.join("','")}')`
                : '';
        default:
            return '';
    }
};

// Build warehouse filter SQL
export const buildWarehouseFilter = (filters: ReportFilters): string => {
    const { warehouse } = filters;
    switch (warehouse.filterType) {
        case 'single':
            return warehouse.selectedWarehouse
                ? ` and wh_code = '${warehouse.selectedWarehouse}'`
                : '';
        case 'range':
            return warehouse.rangeStart && warehouse.rangeEnd
                ? ` and wh_code between '${warehouse.rangeStart}' and '${warehouse.rangeEnd}'`
                : '';
        case 'multiple':
            return warehouse.selectedWarehouses.length > 0
                ? ` and wh_code in ('${warehouse.selectedWarehouses.join("','")}')`
                : '';
        default:
            return '';
    }
};

// Build brand filter SQL
export const buildBrandFilter = (filters: ReportFilters): string => {
    const { brand } = filters;
    switch (brand.filterType) {
        case 'single':
            return brand.selectedBrand
                ? ` and (select brand from ic_inventory where ic_inventory.code = ic_trans_detail.item_code) = '${brand.selectedBrand}'`
                : '';
        case 'range':
            return brand.rangeStart && brand.rangeEnd
                ? ` and (select brand from ic_inventory where ic_inventory.code = ic_trans_detail.item_code) between '${brand.rangeStart}' and '${brand.rangeEnd}'`
                : '';
        case 'multiple':
            return brand.selectedBrands.length > 0
                ? ` and (select brand from ic_inventory where ic_inventory.code = ic_trans_detail.item_code) in ('${brand.selectedBrands.join("','")}')`
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
        .replace(/\{\{start_date\}\}/g, formatDateForQuery(startDate))
        .replace(/\{\{end_date\}\}/g, formatDateForQuery(endDate))
        .replace('{{product_group_filter}}', buildProductGroupFilter(filters))
        .replace('{{warehouse_filter}}', buildWarehouseFilter(filters))
        .replace('{{brand_filter}}', buildBrandFilter(filters));

    return query;
};

// Build PDF config with level 1 grouping by wh_code, shelf_code
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
                    background: "#E8F4FD",
                    text: "#000000",
                    border: "#000000",
                    font_weight: "bold"
                },
                table: {
                    row_spacing: 1.0,
                    column_spacing: 2,
                    grid_color: "#CCCCCC"
                }
            },
            sections: [
                // Level 1: กลุ่มตาม wh_code, shelf_code
                {
                    alias: "sales_ranking",
                    row_type: "level_1",
                    columns: [
                        { field: "wh_code" },
                        { field: "wh_name" },
                        { field: "shelf_code" },
                        { field: "shelf_name" }
                    ]
                },
                // Detail rows
                {
                    alias: "sales_ranking",
                    row_type: "detail",
                    columns: [
                        { field: "rownum" },
                        { field: "item_code" },
                        { field: "item_name" },
                        { field: "group_name" },
                        { field: "qty" },
                        { field: "unit_code" },
                        { field: "wh_01" },
                        { field: "wh_02" },
                        { field: "wh_97" },
                        { field: "wh_98" },
                        { field: "wh_99" },
                        { field: "sum_amount" }
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
