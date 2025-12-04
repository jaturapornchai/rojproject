// Config สำหรับ SRR40006 - รายงานจัดอันดับยอดขาย-ตามกลุ่มสินค้า

import { SHOP_ID_PUBLIC } from '@/lib/constants';
import type {
    QueryConfig,
    PdfConfig,
    DatePreset,
    DayOfWeek,
    ReportFilters,
    ProductGroupFilterState,
    WarehouseFilterState,
    BrandFilterState
} from './types';

// Report Info
export const REPORT_ID = 'SRR40006';
export const REPORT_NAME = 'รายงานจัดอันดับยอดขาย-ตามกลุ่มสินค้า';

// Master Data Queries
export const MASTER_DATA_QUERIES = {
    productGroups: 'select code,name_1 from ic_group order by code',
    warehouses: 'select code,name_1 from ic_warehouse order by code',
    brands: 'select code,name_1 from ic_brand order by code'
};

// Base Query Template
export const BASE_QUERY_TEMPLATE = `with balance as(
select ic_code, ic_name, ic_unit_code,wh_code, balance_qty/unit_standard_ratio as balance_qty
from (select coalesce((select stand_value/divide_value from ic_unit_use where ic_unit_use.ic_code=temp2.ic_code and ic_unit_use.code=temp2.ic_unit_code),1) as unit_standard_ratio
      ,ic_code, ic_name,wh_code, balance_qty, ic_unit_code
      from (select ic_code, ic_name,wh_code, balance_qty, ic_unit_code, (select unit_standard_stand_value/unit_standard_divide_value from ic_inventory where ic_inventory.code=temp1.ic_code) as unit_ratio
            from (select item_code as ic_code,wh_code, (select name_1 from ic_inventory where ic_inventory.code=item_code) as ic_name
                  , (select unit_standard from ic_inventory where ic_inventory.code=item_code) as ic_unit_code
                  , coalesce(sum(calc_flag*(case when ((trans_flag in (70,54,60,58,310,12) or (trans_flag=66 and qty>0) or (trans_flag=14 and inquiry_type=0) or (trans_flag=48 and inquiry_type < 2)) 
                                                         or (trans_flag in (56,68,72,44) or (trans_flag=66 and qty<0) or (trans_flag=46 and inquiry_type in (0,2))  or (trans_flag=16 and inquiry_type in (0,2)) or (trans_flag=311 and inquiry_type=0)) 
                                                         and not (ic_trans_detail.doc_ref <> '' and ic_trans_detail.is_pos = 1)) 
                                              then qty*(stand_value / divide_value) else 0 end)),0) as balance_qty
                  from ic_trans_detail 
                  where ic_trans_detail.last_status=0  and ic_trans_detail.item_type<>5 and ic_trans_detail.is_doc_copy =0
                  and (select item_type from ic_inventory where ic_inventory.code = ic_trans_detail.item_code) not in (1,3)  
                  and doc_date_calc<='{{end_date}}' 
                  group by item_code,wh_code
                 ) as temp1
           ) as temp2  
) as final 
order by ic_code
)

select row_number() over (ORDER BY wh_code,qty desc ,item_code)as rownum,item_code,item_name,unit_code,qty,sum_amount,sum_of_cost,
(sum_amount-sum_of_cost) as Profit_lost
,(case when (sum_amount-sum_of_cost) is null or (sum_amount-sum_of_cost)=0 then 0 
    else round((sum_amount-sum_of_cost)*100/case when sum_of_cost is null or sum_of_cost=0 then (sum_amount-sum_of_cost) else sum_of_cost end,2)end)as percent_1
,(case when (sum_amount-sum_of_cost) is null or (sum_amount-sum_of_cost)=0 or (sum_amount-sum_of_cost)=sum_amount then 0 
 else round((sum_amount-sum_of_cost)*100/case when sum_amount is null or sum_amount=0 then (sum_amount-sum_of_cost) else sum_amount end,2)end)as percent_2
,(select name_1 from ic_warehouse where A.wh_code = ic_warehouse.code )as wh_name
,(select name_1 from ic_shelf where A.shelf_code = ic_shelf.code and A.wh_code = ic_shelf.whcode ) as shelf_name
,group_main
,(select name_1 from ic_group where A.group_main = ic_group.code) as group_name
,(select balance_qty from balance where balance.ic_code = A.item_code and balance.wh_code = '01') as wh_01
,(select balance_qty from balance where balance.ic_code = A.item_code and balance.wh_code = '02') as wh_02
,(select balance_qty from balance where balance.ic_code = A.item_code and balance.wh_code = '97') as wh_97
,(select balance_qty from balance where balance.ic_code = A.item_code and balance.wh_code = '98') as wh_98
,(select balance_qty from balance where balance.ic_code = A.item_code and balance.wh_code = '99') as wh_99
,wh_code,shelf_code
from (select item_code,
(select group_main from ic_inventory where ic_inventory.code = ic_trans_detail.item_code) as group_main,
(select item_brand from ic_inventory where ic_inventory.code = ic_trans_detail.item_code) as brand,
coalesce((select name_1 from ic_inventory where code=item_code),'') as item_name,unit_code,
coalesce(sum(qty),0) as qty,
coalesce(sum(sum_amount),0) as sum_amount,
coalesce(sum(sum_of_cost),0) as sum_of_cost,
wh_code,shelf_code
 
from ic_trans_detail 
where doc_date between '{{start_date}}' and '{{end_date}}' and trans_flag=44 and last_status=0   
and exists(select code from ic_inventory where ic_inventory.code = ic_trans_detail.item_code )
{{product_group_filter}}{{warehouse_filter}}{{brand_filter}}
      group by item_code,unit_code,wh_code,shelf_code,group_main,brand
) as A
order by wh_code, shelf_code, rownum`;

// Default Summary Config - Level 1 by wh_code, shelf_code
export const DEFAULT_SUMMARY_CONFIG = {
    levels: [{
        group_by_fields: ["wh_code", "shelf_code"],
        sum_fields: ["qty", "sum_amount"],
        typejson: 1
    }],
    grand_total: true,
    grand_total_type: 1
};

// Default Query Config
export const getDefaultQueryConfig = (): QueryConfig => ({
    shopid: SHOP_ID_PUBLIC,
    limit: 5000,
    query_items: [{
        alias: "sales_ranking",
        query: BASE_QUERY_TEMPLATE,
        summary_config: DEFAULT_SUMMARY_CONFIG
    }]
});

// Column Schema
export const COLUMN_SCHEMA = {
    "wh_code": {
        label: "คลัง",
        flex: 5,
        align: "L" as const,
        data_type: "string"
    },
    "wh_name": {
        label: "ชื่อคลัง",
        flex: 10,
        align: "L" as const,
        data_type: "string"
    },
    "shelf_code": {
        label: "พื้นที่เก็บ",
        flex: 6,
        align: "L" as const,
        data_type: "string"
    },
    "shelf_name": {
        label: "ชื่อพื้นที่เก็บ",
        flex: 10,
        align: "L" as const,
        data_type: "string"
    },
    "rownum": {
        label: "ลำดับ",
        flex: 5,
        align: "C" as const,
        data_type: "number",
        format: "#,##0"
    },
    "item_code": {
        label: "รหัสสินค้า",
        flex: 10,
        align: "L" as const,
        data_type: "string"
    },
    "item_name": {
        label: "ชื่อสินค้า",
        flex: 20,
        align: "L" as const,
        data_type: "string"
    },
    "group_name": {
        label: "กลุ่มสินค้า",
        flex: 12,
        align: "L" as const,
        data_type: "string"
    },
    "qty": {
        label: "จำนวน",
        flex: 8,
        align: "R" as const,
        data_type: "number",
        format: "#,##0.00"
    },
    "unit_code": {
        label: "หน่วยนับ",
        flex: 6,
        align: "C" as const,
        data_type: "string"
    },
    "wh_01": {
        label: "คลัง 1",
        flex: 8,
        align: "R" as const,
        data_type: "number",
        format: "#,##0.00"
    },
    "wh_02": {
        label: "คลัง 2",
        flex: 8,
        align: "R" as const,
        data_type: "number",
        format: "#,##0.00"
    },
    "wh_97": {
        label: "คลัง 97",
        flex: 8,
        align: "R" as const,
        data_type: "number",
        format: "#,##0.00"
    },
    "wh_98": {
        label: "คลัง 98",
        flex: 8,
        align: "R" as const,
        data_type: "number",
        format: "#,##0.00"
    },
    "wh_99": {
        label: "คลัง 99",
        flex: 8,
        align: "R" as const,
        data_type: "number",
        format: "#,##0.00"
    },
    "sum_amount": {
        label: "รวมมูลค่า",
        flex: 10,
        align: "R" as const,
        data_type: "number",
        format: "#,##0.00"
    }
};

// Default PDF Config
export const getDefaultPdfConfig = (thaiStartDate: string, thaiEndDate: string): PdfConfig => ({
    shopid: SHOP_ID_PUBLIC,
    pdf_config: {
        title: `${REPORT_NAME} (${REPORT_ID})`,
        description: `ตั้งแต่วันที่ ${thaiStartDate} ถึงวันที่ ${thaiEndDate}`,
        orientation: "L",
        page_size: "A4",
        title_align: "C",
        description_align: "L"
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
        sections: [{
            alias: "sales_ranking",
            row_type: "detail",
            columns: [
                { field: "wh_code" },
                { field: "shelf_code" },
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
        }],
        column_schema: COLUMN_SCHEMA
    }
});

// Date Presets
export const DATE_PRESETS: DatePreset[] = [
    { value: 'today', label: 'วันนี้' },
    { value: 'yesterday', label: 'เมื่อวานนี้' },
    { value: 'this_week', label: 'สัปดาห์นี้' },
    { value: 'last_week', label: 'สัปดาห์ก่อน' },
    { value: 'this_month', label: 'เดือนนี้' },
    { value: 'last_month', label: 'เดือนก่อน' },
    { value: 'this_year', label: 'ปีนี้' },
    { value: 'last_year', label: 'ปีก่อน' },
];

// Days of Week
export const DAYS_OF_WEEK: DayOfWeek[] = [
    { value: 0, label: 'อาทิตย์' },
    { value: 1, label: 'จันทร์' },
    { value: 2, label: 'อังคาร' },
    { value: 3, label: 'พุธ' },
    { value: 4, label: 'พฤหัสบดี' },
    { value: 5, label: 'ศุกร์' },
    { value: 6, label: 'เสาร์' },
];

// Thai Months
export const THAI_MONTHS = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

// Default Filter State
export const getDefaultProductGroupFilterState = (): ProductGroupFilterState => ({
    filterType: 'all',
    selectedProductGroup: '',
    rangeStart: '',
    rangeEnd: '',
    selectedProductGroups: []
});

export const getDefaultWarehouseFilterState = (): WarehouseFilterState => ({
    filterType: 'all',
    selectedWarehouse: '',
    rangeStart: '',
    rangeEnd: '',
    selectedWarehouses: []
});

export const getDefaultBrandFilterState = (): BrandFilterState => ({
    filterType: 'all',
    selectedBrand: '',
    rangeStart: '',
    rangeEnd: '',
    selectedBrands: []
});

export const getDefaultReportFilters = (): ReportFilters => ({
    productGroup: getDefaultProductGroupFilterState(),
    warehouse: getDefaultWarehouseFilterState(),
    brand: getDefaultBrandFilterState()
});
