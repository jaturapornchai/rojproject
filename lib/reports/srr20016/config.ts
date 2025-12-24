// Config สำหรับ SRR20016 - รายงานราคาสินค้าเปลี่ยนแปลง

import { SHOP_ID_PUBLIC } from '@/lib/constants';
import type {
    QueryConfig,
    PdfConfig,
    DatePreset,
    DayOfWeek,
    ReportFilters,
    ProductFilterState,
    ProductGroupFilterState,
    ProductBrandFilterState
} from './types';

// Report Info
export const REPORT_ID = 'SRR20016';
export const REPORT_NAME = 'รายงานราคาสินค้าเปลี่ยนแปลง';

// Base Query Template - รายงานราคาสินค้าเปลี่ยนแปลง
export const BASE_QUERY_TEMPLATE = `with data_raw as (
	select rownum,
 create_date_time_now, doc_date_new, doc_time_new, 
 item_code, unit_code_old,unit_code_new, user_code
	, old_price_0,new_price_0
	,(select date(doc_date_new) from price_log b where b.item_code = price_log.item_code and price_log.rownum < b.rownum order by rownum limit 1 offset 0) as doc_date_old
	,(select doc_time_new from price_log b where b.item_code = price_log.item_code and price_log.rownum < b.rownum order by rownum limit 1 offset 0) as doc_time_old
 , (
  'ราคากลาง' || ':' || old_price_0 || ':' || new_price_0 || ',' || 
  'ราคาที่ 1' || ':' || old_price_1 || ':' || new_price_1 || ',' || 
  'ราคาที่ 2' || ':' || old_price_2 || ':' || new_price_2 || ',' || 
  'ราคาที่ 3' || ':' || old_price_3 || ':' || new_price_3 || ',' || 
  'ราคาที่ 4' || ':' || old_price_4 || ':' || new_price_4 || ',' || 
  'ราคาที่ 5' || ':' || old_price_5 || ':' || new_price_5 || ',' || 
  'ราคาที่ 6' || ':' || old_price_6 || ':' || new_price_6 || ',' || 
  'ราคาที่ 8' || ':' || old_price_7 || ':' || new_price_7 || ',' || 
  'ราคาที่ 7' || ':' || old_price_8 || ':' || new_price_8 || ',' || 
  'ราคาที่ 9' || ':' || old_price_9 || ':' || new_price_9) as price_text
,row_number() OVER (PARTITION BY item_code ORDER BY item_code, create_date_time_now DESC) as line_number
 from price_log
	where date(create_date_time_now) between '{{start_date}}' and '{{end_date}}'
	order by create_date_time_now
)
	
, data_mix_column as (
 select rownum,create_date_time_now, doc_date_new, doc_time_new ,doc_date_old ,doc_time_old
	, item_code ,  unit_code_old,unit_code_new, user_code
	, old_price_0,new_price_0
	, unnest(string_to_array(price_text, ',')) as price_text_str 
	from data_raw
)
	
, change_data as (
 select  rownum,create_date_time_now, doc_date_new, doc_time_new ,doc_date_old ,doc_time_old
	, item_code  , unit_code_old,unit_code_new, user_code
	, old_price_0,new_price_0
 , (string_to_array(price_text_str, ':'))[1] as price_tag
 , (string_to_array(price_text_str, ':'))[2] as old_data
 , (string_to_array(price_text_str, ':'))[3] as new_data
 from data_mix_column
)

, data_detail as (
select row_number() over (PARTITION BY item_code,unit_code_old ORDER BY item_code,unit_code_old,create_date_time_now,price_tag)as rownumber
	,row_number() over (PARTITION BY item_code,rownum ORDER BY item_code,unit_code_old,create_date_time_now,price_tag)as line_number
	,* 
, (SELECT real_price FROM calc_formula_price(1, (COALESCE(NULLIF(old_price_0, ''), '0')::numeric), old_data)) as old_amount	
, (SELECT real_price FROM calc_formula_price(1, (COALESCE(NULLIF(new_price_0, ''), '0')::numeric), new_data)) as new_amount	
	
	from change_data 
	where ( case when coalesce(old_data,'') = '' then '0' else old_data end ) != ( case when coalesce(new_data,'') = '' then '0' else new_data end )  
order by item_code,unit_code_old,create_date_time_now,price_tag
	)
	

, detail_final as  (
select 
	1 as sort,d.rownumber,d.line_number,d.rownum,d.item_code
	,ic.name_1,d.unit_code_old,d.unit_code_new
	,coalesce((select name_1 from ic_group where ic_group.code = ic.group_main),'') as group_main
	,coalesce((select name_1 from ic_brand where ic_brand.code = ic.item_brand),'') as item_brand
	,d.price_tag
	,d.old_data,d.old_amount
	,d.doc_date_old,d.doc_time_old
	,d.new_data,d.new_amount
	,date(d.doc_date_new) as doc_date_new,doc_time_new
	,(d.new_amount-d.old_amount) as diff_amount
	,case when d.old_amount = 0 then 100 else round(((d.new_amount-d.old_amount)*100)/d.old_amount,2) end as per_diff_amount
	,concat(user_code,'~',(select name_1 from erp_user where erp_user.code = d.user_code)) as user_name
	,d.create_date_time_now
from data_detail as d
left join ic_inventory as ic on ic.code = d.item_code
where (coalesce(d.unit_code_old,'') <> ''){{product_filter}}{{product_group_filter}}{{product_brand_filter}}
  
order by d.item_code,d.rownum,d.rownumber
)

select sort,rownum,item_code,rownumber
,DENSE_RANK() OVER ( ORDER BY doc_date_new,doc_time_new,item_code,rownum desc) AS line_num 
,case when rownum >= 1 and sort = 1 then doc_date_new else null end as doc_date_new
,case when rownum >= 1 and sort = 1 then doc_time_new else '' end as doc_time_new
,doc_date_old,doc_time_old
,case when rownum >= 1 and sort = 1 then item_code else '' end as ic_code
,case when rownum >= 1 and sort = 1 then name_1 when rownumber = 0 and sort = 2 then '' else '' end as name_1
,case when rownum >= 1 and sort = 1 then unit_code_new else '' end as unit_code_new
,case when rownum >= 1 and sort = 1 then group_main else '' end as group_main
,case when rownum >= 1 and sort = 1 then item_brand else '' end as item_brand
,price_tag
,old_amount
,new_amount
,diff_amount
,per_diff_amount
,user_name
from(
select df.sort ,df.rownumber,df.line_number,df.rownum,df.item_code,df.name_1,df.unit_code_old,df.unit_code_new,df.group_main,df.item_brand,df.price_tag,df.old_data,df.old_amount,df.doc_date_old,df.doc_time_old
	,df.new_data,df.new_amount,df.doc_date_new,df.doc_time_new,df.diff_amount,df.per_diff_amount,df.user_name
	,df.create_date_time_now
	from detail_final as df
) as final

order by final.doc_date_new,final.doc_time_new,item_code,rownum desc,rownumber`;

// Master Data Queries
export const MASTER_DATA_QUERIES = {
    products: "select code,name_1,unit_cost from ic_inventory order by code",
    productGroups: "select code,name_1 from ic_group order by code",
    productBrands: "select code,name_1 from ic_brand order by code"
};

// Default Summary Config - เรียงตาม order by: doc_date_new, doc_time_new, item_code, rownum, rownumber
export const DEFAULT_SUMMARY_CONFIG = {
    levels: [{
        group_by_fields: ["doc_date_new", "doc_time_new", "item_code", "rownumber"],
        sum_fields: [],
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
        alias: "price_changes",
        query: BASE_QUERY_TEMPLATE,
        summary_config: DEFAULT_SUMMARY_CONFIG
    }]
});

// Column Schema
export const COLUMN_SCHEMA = {
    "line_num": {
        label: "ลำดับ",
        flex: 5,
        align: "C" as const,
        data_type: "number",
        format: "#,##",
    },
    "doc_date_new": {
        label: "วันที่ (ล่าสุด)",
        flex: 8,
        align: "C" as const,
        data_type: "date",
        format: "dd/MM/yyyy",
        use_buddhist_year: true
    },
    "doc_time_new": {
        label: "เวลา (ล่าสุด)",
        flex: 6,
        align: "C" as const,
        data_type: "string"
    },
    "doc_date_old": {
        label: "วันที่ (ก่อนหน้า)",
        flex: 8,
        align: "C" as const,
        data_type: "date",
        format: "dd/MM/yyyy",
        use_buddhist_year: true
    },
    "doc_time_old": {
        label: "เวลา (ก่อนหน้า)",
        flex: 6,
        align: "C" as const,
        data_type: "string"
    },
    "ic_code": {
        label: "รหัส",
        flex: 8,
        align: "L" as const,
        data_type: "string"
    },
    "name_1": {
        label: "ชื่อ",
        flex: 15,
        align: "L" as const,
        data_type: "string"
    },
    "unit_code_new": {
        label: "หน่วยนับ",
        flex: 6,
        align: "C" as const,
        data_type: "string"
    },
    "group_main": {
        label: "กลุ่มสินค้า",
        flex: 10,
        align: "L" as const,
        data_type: "string"
    },
    "item_brand": {
        label: "ยี่ห้อ",
        flex: 10,
        align: "L" as const,
        data_type: "string"
    },
    "price_tag": {
        label: "ช่องราคา",
        flex: 5,
        align: "R" as const,
        data_type: "string"
    },
    "old_amount": {
        label: "ราคาก่อนหน้า",
        flex: 10,
        align: "R" as const,
        data_type: "number",
        format: "#,##0.00"
    },
    "new_amount": {
        label: "ราคาล่าสุด",
        flex: 10,
        align: "R" as const,
        data_type: "number",
        format: "#,##0.00"
    },
    "diff_amount": {
        label: "เปลี่ยนแปลง (บาท)",
        flex: 10,
        align: "R" as const,
        data_type: "number",
        format: "#,##0.00",
        text_color_negative: "#FF0000"
    },
    "per_diff_amount": {
        label: "เปลี่ยนแปลง (%)",
        flex: 10,
        align: "R" as const,
        data_type: "number",
        format: "#,##0.00",
        text_color_negative: "#FF0000"
    },
    "user_name": {
        label: "พนักงานทำรายการ",
        flex: 12,
        align: "L" as const,
        data_type: "string"
    },
    "spacer_1": {
        label: " ",
        flex: 6,
        align: "L" as const,
        data_type: "string"
    },
    "spacer_2": {
        label: " ",
        flex: 10,
        align: "L" as const,
        data_type: "string"
    },
    "spacer_3": {
        label: " ",
        flex: 10,
        align: "L" as const,
        data_type: "string"
    },
    "spacer_4": {
        label: " ",
        flex: 12,
        align: "L" as const,
        data_type: "string"
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
                row_spacing: 1.0,
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
export const getDefaultProductFilterState = (): ProductFilterState => ({
    filterType: 'all',
    selectedProduct: '',
    rangeStart: '',
    rangeEnd: '',
    selectedProducts: []
});

export const getDefaultProductGroupFilterState = (): ProductGroupFilterState => ({
    filterType: 'all',
    selectedProductGroup: '',
    rangeStart: '',
    rangeEnd: '',
    selectedProductGroups: []
});

export const getDefaultProductBrandFilterState = (): ProductBrandFilterState => ({
    filterType: 'all',
    selectedProductBrand: '',
    rangeStart: '',
    rangeEnd: '',
    selectedProductBrands: []
});

export const getDefaultReportFilters = (): ReportFilters => ({
    product: getDefaultProductFilterState(),
    productGroup: getDefaultProductGroupFilterState(),
    productBrand: getDefaultProductBrandFilterState()
});
