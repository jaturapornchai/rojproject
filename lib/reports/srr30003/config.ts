// lib/reports/srr30003/config.ts

import type { DatePreset, DayOfWeek, ReportFilters } from './types';

// Report identification
export const REPORT_ID = 'SRR30003';
export const REPORT_NAME = 'รายงานเปรียบเทียบต้นทุนการซื้อล่าสุด (SRR30003)';

// Base SQL Query Template
export const BASE_QUERY_TEMPLATE = `
SELECT 
    doc_date,
    doc_no,
    item_code, 
    item_name, 
    qty, 
    unit_code, 
    average_cost,
    (SELECT average_cost 
     FROM ic_trans_detail AS x 
     WHERE x.last_status = 0 
       AND x.trans_flag = 12 
       AND x.item_code = ic_trans_detail.item_code 
       AND x.doc_date <= ic_trans_detail.doc_date 
       AND x.doc_no < ic_trans_detail.doc_no  
     ORDER BY doc_no DESC, doc_date, doc_time 
     LIMIT 1) AS last_cost,
    (average_cost - (SELECT average_cost 
                     FROM ic_trans_detail AS x 
                     WHERE x.last_status = 0 
                       AND x.trans_flag = 12 
                       AND x.item_code = ic_trans_detail.item_code 
                       AND x.doc_date <= ic_trans_detail.doc_date 
                       AND x.doc_no < ic_trans_detail.doc_no  
                     ORDER BY doc_no DESC, doc_date, doc_time 
                     LIMIT 1)) AS diff_cost  
FROM ic_trans_detail 
WHERE doc_date BETWEEN '{{startDate}}' AND '{{endDate}}' 
    AND trans_flag = 12      
    AND average_cost <> (SELECT average_cost 
                         FROM ic_trans_detail AS x 
                         WHERE x.last_status = 0 
                           AND x.trans_flag = 12 
                           AND x.item_code = ic_trans_detail.item_code 
                           AND x.doc_date <= ic_trans_detail.doc_date 
                           AND x.doc_no < ic_trans_detail.doc_no  
                         ORDER BY doc_no DESC, doc_date, doc_time 
                         LIMIT 1)
    {{documentFilter}}
    {{productFilter}}
    {{productGroupFilter}}
    {{productBrandFilter}}
    {{warehouseFilter}}
    {{shelfFilter}}
ORDER BY doc_date, doc_no, item_code
`;

// Column schema for PDF
export const COLUMN_SCHEMA = {
    "doc_date": {
        label: "เอกสารวันที่",
        flex: 10,
        align: "C",
        data_type: "date",
        use_buddhist_year: true
    },
    "doc_no": {
        label: "เอกสารเลขที่",
        flex: 12,
        align: "L",
        data_type: "string"
    },
    "item_code": {
        label: "รหัสสินค้า",
        flex: 12,
        align: "L",
        data_type: "string"
    },
    "item_name": {
        label: "ชื่อสินค้า",
        flex: 20,
        align: "L",
        data_type: "string"
    },
    "qty": {
        label: "จำนวน",
        flex: 8,
        align: "R",
        data_type: "number",
        format: "#,##0.00"
    },
    "unit_code": {
        label: "หน่วยนับ",
        flex: 8,
        align: "C",
        data_type: "string"
    },
    "average_cost": {
        label: "ราคาทุน",
        flex: 10,
        align: "R",
        data_type: "number",
        format: "#,##0.00"
    },
    "last_cost": {
        label: "ต้นทุนก่อนหน้า",
        flex: 10,
        align: "R",
        data_type: "number",
        format: "#,##0.00"
    },
    "diff_cost": {
        label: "ผลต่าง",
        flex: 10,
        align: "R",
        data_type: "number",
        format: "#,##0.00"
    }
};

// Date presets for schedule
export const DATE_PRESETS: DatePreset[] = [
    { value: 'today', label: 'วันนี้' },
    { value: 'yesterday', label: 'เมื่อวาน' },
    { value: 'this_week', label: 'สัปดาห์นี้' },
    { value: 'last_week', label: 'สัปดาห์ที่แล้ว' },
    { value: 'this_month', label: 'เดือนนี้' },
    { value: 'last_month', label: 'เดือนที่แล้ว' },
    { value: 'this_year', label: 'ปีนี้' },
    { value: 'last_year', label: 'ปีที่แล้ว' },
];

// Days of week
export const DAYS_OF_WEEK: DayOfWeek[] = [
    { value: 0, label: 'อาทิตย์' },
    { value: 1, label: 'จันทร์' },
    { value: 2, label: 'อังคาร' },
    { value: 3, label: 'พุธ' },
    { value: 4, label: 'พฤหัสบดี' },
    { value: 5, label: 'ศุกร์' },
    { value: 6, label: 'เสาร์' },
];

// Thai months
export const THAI_MONTHS = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
    'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
    'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

// Default values
export const getDefaultReportFilters = (): ReportFilters => ({
    document: {
        filterType: 'all',
        selectedDocument: '',
        rangeStart: '',
        rangeEnd: '',
        selectedDocuments: [],
    },
    product: {
        filterType: 'all',
        selectedProduct: '',
        rangeStart: '',
        rangeEnd: '',
        selectedProducts: [],
    },
    productGroup: {
        filterType: 'all',
        selectedGroup: '',
        rangeStart: '',
        rangeEnd: '',
        selectedGroups: [],
    },
    productBrand: {
        filterType: 'all',
        selectedBrand: '',
        rangeStart: '',
        rangeEnd: '',
        selectedBrands: [],
    },
    warehouse: {
        filterType: 'all',
        selectedWarehouse: '',
        rangeStart: '',
        rangeEnd: '',
        selectedWarehouses: [],
    },
    shelf: {
        filterType: 'all',
        selectedShelf: '',
        rangeStart: '',
        rangeEnd: '',
        selectedShelves: [],
    },
});

// Master data queries
export const MASTER_DATA_QUERIES = {
    documents: `SELECT doc_date, doc_no, (ic_trans.cust_code || '~' || (SELECT name_1 FROM ap_supplier WHERE ap_supplier.code = ic_trans.cust_code)) AS cust_name, total_amount, remark FROM ic_trans WHERE trans_flag = 12 ORDER BY doc_date, doc_no`,
    products: 'SELECT code, name_1, unit_cost FROM ic_inventory ORDER BY code',
    productGroups: 'SELECT code, name_1 FROM ic_group ORDER BY code',
    productBrands: 'SELECT code, name_1 FROM ic_brand ORDER BY code',
    warehouses: 'SELECT code, name_1 FROM ic_warehouse ORDER BY code',
    shelves: 'SELECT code, name_1 FROM ic_shelf ORDER BY code',
};
