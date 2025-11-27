// Config สำหรับ SRR40010 - รายงานเปรียบเทียบราคาขาย

import { SHOP_ID_PUBLIC } from '@/lib/constants';
import type { 
    QueryConfig, 
    PdfConfig, 
    DatePreset, 
    DayOfWeek,
    ReportFilters,
    CustomerFilterState,
    BranchFilterState
} from './types';

// Report Info
export const REPORT_ID = 'SRR40010';
export const REPORT_NAME = 'รายงานเปรียบเทียบราคาขาย';

// Base Query Template - ใช้ {{placeholder}} สำหรับค่าที่ต้องแทนที่
export const BASE_QUERY_TEMPLATE = `with balance_cost as(
select ic_code, ic_name, ic_unit_code, balance_qty/unit_standard_ratio as balance_qty, average_cost*unit_standard_ratio as average_cost, average_cost_end
, balance_amount
from (select coalesce((select stand_value/divide_value 
from ic_unit_use 
where ic_unit_use.ic_code=temp2.ic_code and ic_unit_use.code=temp2.ic_unit_code),1) as unit_standard_ratio,ic_code, ic_name, balance_qty, ic_unit_code
, case when balance_qty=0 then 0 else balance_amount/balance_qty end as average_cost
, coalesce(((select  average_cost from ic_trans_detail where ic_trans_detail.last_status=0  and ic_trans_detail.item_code=temp2.ic_code and doc_date_calc<='{{end_date}}'
and ((trans_flag in (70,54,60,58,310,12) or (trans_flag=66 and (qty>0 or sum_of_cost>0 )) or (trans_flag=14) or (trans_flag=48 and inquiry_type < 2)) 
	or (trans_flag in (56,68,72,44) or (trans_flag=66 and (qty<0 or sum_of_cost<0 )) or (trans_flag=46)  or (trans_flag=16 ) or (trans_flag=311 )) 
	and not (ic_trans_detail.doc_ref <> '' and ic_trans_detail.is_pos = 1)) order by doc_date_calc desc,doc_time desc ,line_number desc  offset 0 limit 1 )*unit_ratio),0) as average_cost_end
,  balance_amount as balance_amount
from (select ic_code, ic_name, balance_qty, ic_unit_code, (select unit_standard_stand_value/unit_standard_divide_value from ic_inventory where ic_inventory.code=temp1.ic_code) as unit_ratio, balance_amount

from (select item_code as ic_code, (select name_1 from ic_inventory where ic_inventory.code=item_code) as ic_name
, (select unit_standard from ic_inventory where ic_inventory.code=item_code) as ic_unit_code
, coalesce(sum(calc_flag*(case when ((trans_flag in (70,54,60,58,310,12) or (trans_flag=66 and qty>0) or (trans_flag=14 and inquiry_type=0) or (trans_flag=48 and inquiry_type < 2)) or (trans_flag in (56,68,72,44) 
	or (trans_flag=66 and qty<0) or (trans_flag=46 and inquiry_type in (0,2))  or (trans_flag=16 and inquiry_type in (0,2)) or (trans_flag=311 and inquiry_type=0)) 
	and not (ic_trans_detail.doc_ref <> '' and ic_trans_detail.is_pos = 1)) then qty*(stand_value / divide_value) else 0 end)),0) as balance_qty
, coalesce(sum( (calc_flag*(case when ((trans_flag in (70,54,60,58,310,12) or (trans_flag=66 and (qty>0 or sum_of_cost>0 )) or (trans_flag=14) or (trans_flag=48 and inquiry_type < 2)) or (trans_flag in (56,68,72,44) 
	or (trans_flag=66 and (qty<0 or sum_of_cost<0 )) or (trans_flag=46)  or (trans_flag=16 ) or (trans_flag=311 )) and not (ic_trans_detail.doc_ref <> '' and ic_trans_detail.is_pos = 1)) then case when trans_flag=66 and qty < 0 
	then -1* sum_of_cost_1 else sum_of_cost_1 end else 0 end))+coalesce(profit_lost_cost_amount, 0)),0) as balance_amount

from ic_trans_detail where ic_trans_detail.last_status=0  and ic_trans_detail.item_type<>5  and (select item_type from ic_inventory where ic_inventory.code = ic_trans_detail.item_code) not in (1,3)  
and doc_date_calc<='{{end_date}}' 
group by item_code) as temp1) as temp2  
where  ( balance_qty<>0 or balance_amount<>0)) as final 
order by ic_code

)

select doc_date,doc_no,cust_name,sale_name,item_code,item_name,qty,unit_code,price,discount
,case when price_cust <> 0 then price_cust else price_cust_unit end as price_cust
,price-coalesce(case when price_cust <> 0 then price_cust else price_cust_unit end,0) as diff
,average_cost
,(price-coalesce(case when price_cust <> 0 then price_cust else price_cust_unit end,0))*qty as sum_amount
,remark
from
(
select doc_date,doc_no,cust_name,sale_name,item_code,item_name,qty,unit_code,price,discount,sum_amount,price_cust,price_cust_unit
,(select average_cost from balance_cost where temp1.item_code = balance_cost.ic_code) as average_cost
,remark 
from(
select doc_date,doc_no,concat(cust_code,'~',(select name_1 from ar_customer where ar_customer.code = ic_trans_detail.cust_code)) as cust_name

,concat(
	case when (select sale_code from ic_trans where ic_trans.doc_no = ic_trans_detail.doc_no and ic_trans.trans_flag = ic_trans_detail.trans_flag) is null then 
	(select creator_code from ic_trans where ic_trans.doc_no = ic_trans_detail.doc_no and ic_trans.trans_flag = ic_trans_detail.trans_flag)
	else 
	(select sale_code from ic_trans where ic_trans.doc_no = ic_trans_detail.doc_no and ic_trans.trans_flag = ic_trans_detail.trans_flag) end
	,'~',
	(select name_1 from erp_user where erp_user.code = case when (select sale_code from ic_trans where ic_trans.doc_no = ic_trans_detail.doc_no and ic_trans.trans_flag = ic_trans_detail.trans_flag) is null then 
	(select creator_code from ic_trans where ic_trans.doc_no = ic_trans_detail.doc_no and ic_trans.trans_flag = ic_trans_detail.trans_flag)
	else 
	(select sale_code from ic_trans where ic_trans.doc_no = ic_trans_detail.doc_no and ic_trans.trans_flag = ic_trans_detail.trans_flag) end)
	
) as sale_name 


,item_code,item_name,qty,unit_code,price,discount,sum_amount
,coalesce(case when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 0
	then to_number((select price_0 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code and ic_inventory_price_formula.unit_code = ic_trans_detail.unit_code limit 1), '99999999999.00' )
      when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 1
	then to_number((select price_1 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code and ic_inventory_price_formula.unit_code = ic_trans_detail.unit_code limit 1), '99999999999.00' )
      when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 2
	then to_number((select price_2 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code and ic_inventory_price_formula.unit_code = ic_trans_detail.unit_code limit 1), '99999999999.00' )
      when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 3
	then to_number((select price_3 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code and ic_inventory_price_formula.unit_code = ic_trans_detail.unit_code limit 1), '99999999999.00' )
      when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 4
	then to_number((select price_4 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code and ic_inventory_price_formula.unit_code = ic_trans_detail.unit_code limit 1), '99999999999.00' )
      when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 5
	then to_number((select price_5 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code and ic_inventory_price_formula.unit_code = ic_trans_detail.unit_code limit 1), '99999999999.00' )
      when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 6
	then to_number((select price_6 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code and ic_inventory_price_formula.unit_code = ic_trans_detail.unit_code limit 1), '99999999999.00' )
      when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 7
	then to_number((select price_7 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code and ic_inventory_price_formula.unit_code = ic_trans_detail.unit_code limit 1), '99999999999.00' )
      when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 8
	then to_number((select price_8 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code and ic_inventory_price_formula.unit_code = ic_trans_detail.unit_code limit 1), '99999999999.00' )
      when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 9
	then to_number((select price_9 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code and ic_inventory_price_formula.unit_code = ic_trans_detail.unit_code limit 1), '99999999999.00' )
else '0' end , 0) as price_cust
,coalesce(case when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 0
	then to_number((select price_0 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code 
	and ic_inventory_price_formula.unit_code = (select unit_cost from ic_inventory where ic_inventory.code = ic_trans_detail.item_code) limit 1), '99999999999.00' )
      when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 1
	then to_number((select price_1 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code 
	and ic_inventory_price_formula.unit_code = (select unit_cost from ic_inventory where ic_inventory.code = ic_trans_detail.item_code) limit 1), '99999999999.00' )
      when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 2
	then to_number((select price_2 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code 
	and ic_inventory_price_formula.unit_code = (select unit_cost from ic_inventory where ic_inventory.code = ic_trans_detail.item_code) limit 1), '99999999999.00' )
      when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 3
	then to_number((select price_3 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code 
	and ic_inventory_price_formula.unit_code = (select unit_cost from ic_inventory where ic_inventory.code = ic_trans_detail.item_code) limit 1), '99999999999.00' )
      when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 4
	then to_number((select price_4 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code 
	and ic_inventory_price_formula.unit_code = (select unit_cost from ic_inventory where ic_inventory.code = ic_trans_detail.item_code) limit 1), '99999999999.00' )
      when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 5
	then to_number((select price_5 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code 
	and ic_inventory_price_formula.unit_code = (select unit_cost from ic_inventory where ic_inventory.code = ic_trans_detail.item_code) limit 1), '99999999999.00' )
      when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 6
	then to_number((select price_6 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code 
	and ic_inventory_price_formula.unit_code = (select unit_cost from ic_inventory where ic_inventory.code = ic_trans_detail.item_code) limit 1), '99999999999.00' )
      when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 7
	then to_number((select price_7 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code 
	and ic_inventory_price_formula.unit_code = (select unit_cost from ic_inventory where ic_inventory.code = ic_trans_detail.item_code) limit 1), '99999999999.00' )
      when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 8
	then to_number((select price_8 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code 
	and ic_inventory_price_formula.unit_code = (select unit_cost from ic_inventory where ic_inventory.code = ic_trans_detail.item_code) limit 1), '99999999999.00' )
      when (select price_level from ar_customer where ic_trans_detail.cust_code = ar_customer.code) = 9
	then to_number((select price_9 from ic_inventory_price_formula where ic_inventory_price_formula.ic_code = ic_trans_detail.item_code 
	and ic_inventory_price_formula.unit_code = (select unit_cost from ic_inventory where ic_inventory.code = ic_trans_detail.item_code) limit 1), '99999999999.00' )
else '0' end , 0)*(select stand_value from ic_unit_use where ic_unit_use.ic_code = ic_trans_detail.item_code and ic_unit_use.code = ic_trans_detail.unit_code limit 1) as price_cust_unit
,(select remark from ic_trans where ic_trans.doc_no = ic_trans_detail.doc_no and ic_trans.trans_flag = ic_trans_detail.trans_flag) as remark
from ic_trans_detail 
where trans_flag = 44 and last_status = 0 and doc_date between '{{start_date}}' and '{{end_date}}'{{customer_filter}}{{branch_filter}}{{sale_type_filter}}
    
order by doc_date,doc_no
) as temp1 
) as temp2 
where {{diff_filter_condition}}`;

// Default Summary Config
export const DEFAULT_SUMMARY_CONFIG = {
    levels: [{
        group_by_fields: ["doc_date"],
        sum_fields: ["qty", "sum_amount", "diff"],
        typejson: 1
    }],
    grand_total: true,
    grand_total_type: 99
};

// Default Query Config
export const getDefaultQueryConfig = (): QueryConfig => ({
    shopid: SHOP_ID_PUBLIC,
    limit: 5000,
    query_items: [{
        alias: "price_comparison",
        query: BASE_QUERY_TEMPLATE,
        summary_config: DEFAULT_SUMMARY_CONFIG
    }]
});

// Column Schema
export const COLUMN_SCHEMA = {
    "doc_date": {
        label: "วันที่",
        flex: 7,
        align: "L" as const,
        data_type: "date",
        format: "dd/MM/yyyy",
        use_buddhist_year: true
    },
    "doc_no": {
        label: "เลขที่เอกสาร",
        flex: 9,
        align: "L" as const
    },
    "cust_name": {
        label: "ลูกหนี้",
        flex: 12,
        align: "L" as const
    },
    "sale_name": {
        label: "พนักงานขาย",
        flex: 10,
        align: "L" as const
    },
    "item_code": {
        label: "รหัสสินค้า",
        flex: 8,
        align: "L" as const
    },
    "item_name": {
        label: "รายการ",
        flex: 12,
        align: "L" as const
    },
    "qty": {
        label: "จำนวน",
        flex: 6,
        align: "R" as const,
        data_type: "number",
        format: "#,##0.00"
    },
    "unit_code": {
        label: "หน่วยนับ",
        flex: 5,
        align: "C" as const
    },
    "price": {
        label: "ราคา",
        flex: 7,
        align: "R" as const,
        data_type: "number",
        format: "#,##0.00"
    },
    "price_cust": {
        label: "ราคาตามลูกค้า",
        flex: 8,
        align: "R" as const,
        data_type: "number",
        format: "#,##0.00"
    },
    "diff": {
        label: "ผลต่าง",
        flex: 7,
        align: "R" as const,
        data_type: "number",
        format: "#,##0.00",
        text_color_negative: "#FF0000"
    },
    "average_cost": {
        label: "ต้นทุนเฉลี่ย",
        flex: 8,
        align: "R" as const,
        data_type: "number",
        format: "#,##0.00"
    },
    "sum_amount": {
        label: "รวมเงิน",
        flex: 8,
        align: "R" as const,
        data_type: "number",
        format: "#,##0.00"
    },
    "remark": {
        label: "หมายเหตุ",
        flex: 8,
        align: "L" as const
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
            alias: "price_comparison",
            row_type: "detail",
            columns: [
                { field: "doc_date" },
                { field: "doc_no" },
                { field: "cust_name" },
                { field: "sale_name" },
                { field: "item_code" },
                { field: "item_name" },
                { field: "qty" },
                { field: "unit_code" },
                { field: "price" },
                { field: "price_cust" },
                { field: "diff" },
                { field: "average_cost" },
                { field: "sum_amount" },
                { field: "remark" }
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
export const getDefaultCustomerFilterState = (): CustomerFilterState => ({
    filterType: 'all',
    selectedCustomer: '',
    rangeStart: '',
    rangeEnd: '',
    selectedCustomers: []
});

export const getDefaultBranchFilterState = (): BranchFilterState => ({
    filterType: 'all',
    selectedBranch: '',
    rangeStart: '',
    rangeEnd: '',
    selectedBranches: []
});

export const getDefaultReportFilters = (): ReportFilters => ({
    customer: getDefaultCustomerFilterState(),
    branch: getDefaultBranchFilterState(),
    diffFilter: '0',
    saleType: 'all'
});
