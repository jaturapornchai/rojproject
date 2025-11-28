// lib/reports/srr20011/config.ts

import type { DatePreset, DayOfWeek, ReportFilters } from './types';

// Report identification
export const REPORT_ID = 'SRR20011';
export const REPORT_NAME = 'รายงานสินค้าใหม่ แสดงระดับราคา (SRR20011)';

// Base SQL Query Template
export const BASE_QUERY_TEMPLATE = `
select code,name_1,(select ic_inventory.unit_standard from ic_inventory where ic_inventory.code=master_logs.code) as unit_standard,
(select ic_group.name_1 from ic_group where ic_group.code=(select ic_inventory.group_main from ic_inventory where ic_inventory.code=master_logs.code)) as item_group,
(select price_0 from ic_inventory_price_formula where ic_code=code and ic_inventory_price_formula.unit_code=(select ic_inventory.unit_standard from ic_inventory where ic_inventory.code=master_logs.code)) as p1,
(select price_1 from ic_inventory_price_formula where ic_code=code and ic_inventory_price_formula.unit_code=(select ic_inventory.unit_standard from ic_inventory where ic_inventory.code=master_logs.code)) as p2,
(select price_2 from ic_inventory_price_formula where ic_code=code and ic_inventory_price_formula.unit_code=(select ic_inventory.unit_standard from ic_inventory where ic_inventory.code=master_logs.code)) as p3,
(select price_3 from ic_inventory_price_formula where ic_code=code and ic_inventory_price_formula.unit_code=(select ic_inventory.unit_standard from ic_inventory where ic_inventory.code=master_logs.code)) as p4,
(select price_4 from ic_inventory_price_formula where ic_code=code and ic_inventory_price_formula.unit_code=(select ic_inventory.unit_standard from ic_inventory where ic_inventory.code=master_logs.code)) as p5,
(select price_5 from ic_inventory_price_formula where ic_code=code and ic_inventory_price_formula.unit_code=(select ic_inventory.unit_standard from ic_inventory where ic_inventory.code=master_logs.code)) as p6,
(select price_6 from ic_inventory_price_formula where ic_code=code and ic_inventory_price_formula.unit_code=(select ic_inventory.unit_standard from ic_inventory where ic_inventory.code=master_logs.code)) as p7,
concat(user_code,' ~ ',(select name_1 from erp_user where code=user_code)) as user_text,
date_time,computer_name ,DATE(create_date_time_now) as create_date
from master_logs
where function_code in (1) and (select ic_inventory.unit_standard from ic_inventory where ic_inventory.code=master_logs.code) <> '' 
    AND DATE(date_time) BETWEEN DATE('{{startDate}}') AND DATE('{{endDate}}')
    {{productFilter}}
    {{productGroupFilter}}
    {{productBrandFilter}}
order by code
`;

// Column schema for PDF
export const COLUMN_SCHEMA = {
    "code": {
        label: "รหัส",
        flex: 8,
        align: "L",
        data_type: "string"
    },
    "name_1": {
        label: "ชื่อสินค้า",
        flex: 15,
        align: "L",
        data_type: "string"
    },
    "unit_standard": {
        label: "หน่วยนับ",
        flex: 6,
        align: "C",
        data_type: "string"
    },
    "item_group": {
        label: "กลุ่มสินค้า",
        flex: 10,
        align: "L",
        data_type: "string"
    },
    "p1": {
        label: "ราคากลาง",
        flex: 7,
        align: "R",
        data_type: "number",
        format: "#,##0.00"
    },
    "p2": {
        label: "ราคา 1",
        flex: 7,
        align: "R",
        data_type: "number",
        format: "#,##0.00"
    },
    "p3": {
        label: "ราคา 2",
        flex: 7,
        align: "R",
        data_type: "number",
        format: "#,##0.00"
    },
    "p4": {
        label: "ราคา 3",
        flex: 7,
        align: "R",
        data_type: "number",
        format: "#,##0.00"
    },
    "p5": {
        label: "ราคา 4",
        flex: 7,
        align: "R",
        data_type: "number",
        format: "#,##0.00"
    },
    "p6": {
        label: "ราคา 5",
        flex: 7,
        align: "R",
        data_type: "number",
        format: "#,##0.00"
    },
    "p7": {
        label: "ราคา 6",
        flex: 7,
        align: "R",
        data_type: "number",
        format: "#,##0.00"
    },
    "user_text": {
        label: "พนักงาน",
        flex: 12,
        align: "L",
        data_type: "string"
    },
    "create_date": {
        label: "วันที่สร้างสินค้า",
        flex: 10,
        align: "C",
        data_type: "date",
        use_buddhist_year: true
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
});

// Master data queries
export const MASTER_DATA_QUERIES = {
    products: 'SELECT code, name_1, unit_cost FROM ic_inventory ORDER BY code',
    productGroups: 'SELECT code, name_1 FROM ic_group ORDER BY code',
    productBrands: 'SELECT code, name_1 FROM ic_brand ORDER BY code',
};
