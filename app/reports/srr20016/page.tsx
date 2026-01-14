'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ThaiDatePicker from '@/components/ThaiDatePicker';
import { SHOP_ID_PUBLIC } from '@/lib/constants';
import { SHARED_PDF_STYLES, buildStandardPdfConfig } from '@/lib/reports/shared-styles';

interface ReportLog {
    username: string;
    target: string;
    details: string;
    created_at: string;
}

interface GenerateReportResponse {
    success: boolean;
    message?: string;
    error?: string;
    guid?: string;
    detailRowCount?: number;
    data?: Record<string, {
        detail?: Record<string, unknown>[];
        summary?: Array<{
            linenumber?: number;
            level?: number;
            typejson?: number;
            data?: Record<string, unknown>;
        }>;
        raw?: unknown[];
    }>;
}

const REPORT_ID = 'SRR20016';
const REPORT_NAME = 'รายงานราคาสินค้าเปลี่ยนแปลง';

export default function ReportSRR20016() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [logs, setLogs] = useState<ReportLog[]>([]);

    const getThisMonthStart = () => new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const getThisMonthEnd = () => new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const [startDate, setStartDate] = useState<Date | null>(getThisMonthStart());
    const [endDate, setEndDate] = useState<Date | null>(getThisMonthEnd());
    const [showAdvanced, setShowAdvanced] = useState(true);
    const [loading, setLoading] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [reportGuid, setReportGuid] = useState<string | null>(null);
    const [detailRowCount, setDetailRowCount] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [pdfUrl]);

    // Access Control Check
    useEffect(() => {
        if (status === 'loading') return;

        const isAdmin = session?.user?.isAdmin;
        const allowedReports = session?.user?.allowed_reports || [];
        const hasAccess = isAdmin || allowedReports.includes(REPORT_ID);

        if (!hasAccess) {
            router.push('/');
        } else {
            fetchLogs();
        }
    }, [session, status, router]);

    const fetchLogs = async () => {
        try {
            const response = await fetch('/rojproject/api/system/activity/get', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shopid: SHOP_ID_PUBLIC,
                    target: REPORT_ID,
                    limit: 20
                }),
            });
            const data = await response.json();
            if (data.data) {
                setLogs(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch logs', error);
        }
    };

    const saveLog = async (conditions: string) => {
        try {
            const userName = session?.user?.username || session?.user?.name || 'unknown';
            await fetch('/rojproject/api/system/activity/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shopid: SHOP_ID_PUBLIC,
                    username: userName,
                    activity_type: 'view_report',
                    target: REPORT_ID,
                    details: conditions,
                }),
            });
            fetchLogs(); // Refresh logs
        } catch (error) {
            console.error('Failed to save log', error);
        }
    };

    const formatDate = (date: Date | null) => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatThaiDateForPdf = (date: Date | null) => {
        if (!date) return '';
        const year = date.getFullYear() + 543;
        const month = date.toLocaleDateString('th-TH', { month: 'long' });
        const day = date.getDate();
        return `${day} ${month} ${year}`;
    };

    const setDateRange = (start: Date, end: Date) => {
        setStartDate(start);
        setEndDate(end);
    };

    const handlePreset = (type: string) => {
        const today = new Date();
        let start = new Date();
        let end = new Date();

        switch (type) {
            case 'today':
                break;
            case 'yesterday':
                start.setDate(today.getDate() - 1);
                end.setDate(today.getDate() - 1);
                break;
            case 'thisWeek':
                const day = today.getDay();
                const diff = today.getDate() - day + (day === 0 ? -6 : 1);
                start.setDate(diff);
                end.setDate(start.getDate() + 6);
                break;
            case 'lastWeek':
                const lastWeekToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
                const lastDay = lastWeekToday.getDay();
                const lastDiff = lastWeekToday.getDate() - lastDay + (lastDay === 0 ? -6 : 1);
                start = new Date(lastWeekToday.setDate(lastDiff));
                end = new Date(start);
                end.setDate(start.getDate() + 6);
                break;
            case 'thisMonth':
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
            case 'lastMonth':
                start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                end = new Date(today.getFullYear(), today.getMonth(), 0);
                break;
            case 'thisYear':
                start = new Date(today.getFullYear(), 0, 1);
                end = new Date(today.getFullYear(), 11, 31);
                break;
            case 'lastYear':
                start = new Date(today.getFullYear() - 1, 0, 1);
                end = new Date(today.getFullYear() - 1, 11, 31);
                break;
        }
        setDateRange(start, end);
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 6 }, (_, i) => currentYear - i);
    const months = [
        "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
        "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];

    const handleMonthSelect = (monthIndex: number) => {
        const year = startDate ? startDate.getFullYear() : currentYear;
        const start = new Date(year, monthIndex, 1);
        const end = new Date(year, monthIndex + 1, 0);
        setDateRange(start, end);
    };

    const handleYearSelect = (year: number) => {
        const start = new Date(year, 0, 1);
        const end = new Date(year, 11, 31);
        setDateRange(start, end);
    };

    const handleGenerateResult = async () => {
        if (!startDate || !endDate) {
            setError('กรุณาเลือกช่วงเวลา');
            return;
        }

        setLoading(true);
        setError(null);
        setPdfUrl(null);
        setReportGuid(null);
        setDetailRowCount(null);

        try {
            const conditions = `Date: ${startDate.toLocaleDateString('th-TH')} - ${endDate.toLocaleDateString('th-TH')}`;
            await saveLog(conditions);

            // Direct SQL Query (same pattern as SRR40001)
            const baseQuery = `with data_raw as (
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
	where date(create_date_time_now) between '${formatDate(startDate)}' and '${formatDate(endDate)}'
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
where (coalesce(d.unit_code_old,'') <> '')
  
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

            const requestPayload = {
                shopid: SHOP_ID_PUBLIC,
                limit: 5000,
                query_items: [
                    {
                        alias: "price_changes",
                        query: baseQuery,
                        summary_config: {
                            levels: [{
                                group_by_fields: ["doc_date_new", "doc_time_new", "item_code", "rownumber"],
                                sum_fields: [],
                                typejson: 1
                            }],
                            grand_total: true,
                            grand_total_type: 1
                        }
                    }
                ]
            };

            const reportRes = await fetch('/rojproject/api/generate-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestPayload),
            });

            const reportData: GenerateReportResponse = await reportRes.json();

            if (!reportRes.ok) {
                const message = reportData?.error || `ไม่สามารถดึงข้อมูล (${reportRes.status})`;
                console.error('Report API request failed', {
                    status: reportRes.status,
                    statusText: reportRes.statusText,
                    body: reportData,
                });
                setError(message);
                return;
            }

            if (!reportData?.success) {
                const message = reportData?.error || reportData?.message || 'ไม่สามารถดึงข้อมูลรายงาน';
                console.warn('Report API returned success=false', reportData);
                setError(message);
                return;
            }

            const guid = reportData.guid;
            if (!guid) {
                setError('ระบบไม่สามารถสร้าง GUID สำหรับรายงานได้');
                return;
            }

            const priceChangesData = reportData.data?.price_changes;
            const detailRows = Array.isArray(priceChangesData?.detail)
                ? (priceChangesData!.detail as Record<string, unknown>[])
                : [];

            if (detailRows.length === 0) {
                setError('ไม่พบข้อมูลรายงานในช่วงวันที่ที่เลือก');
                return;
            }

            setReportGuid(guid);
            setDetailRowCount(reportData.detailRowCount ?? detailRows.length);

            const pdfPayload = {
                shopid: SHOP_ID_PUBLIC,
                guid,
                pdf_config: buildStandardPdfConfig(
                    `${REPORT_NAME} (${REPORT_ID})`,
                    `ตั้งแต่วันที่ ${formatThaiDateForPdf(startDate)} ถึงวันที่ ${formatThaiDateForPdf(endDate)}`,
                    "L"
                ),
                layout_config: {
                    schema_version: 1,
                    styles: SHARED_PDF_STYLES,
                    sections: [
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
                        {
                            alias: "price_changes",
                            row_type: "detail",
                            columns: [
                                { field: "price_tag" },
                                { field: "old_amount" },
                                { field: "new_amount" },
                                { field: "diff_amount" },
                                { field: "per_diff_amount" }
                            ]
                        }
                    ],
                    column_schema: {
                        "line_num": { label: "ลำดับ", flex: 5, align: "C", data_type: "number", format: "#,##" },
                        "doc_date_new": { label: "วันที่ (ล่าสุด)", flex: 8, align: "C", data_type: "date", format: "dd/MM/yyyy", use_buddhist_year: true },
                        "doc_time_new": { label: "เวลา (ล่าสุด)", flex: 6, align: "C", data_type: "string" },
                        "doc_date_old": { label: "วันที่ (ก่อนหน้า)", flex: 8, align: "C", data_type: "date", format: "dd/MM/yyyy", use_buddhist_year: true },
                        "doc_time_old": { label: "เวลา (ก่อนหน้า)", flex: 6, align: "C", data_type: "string" },
                        "ic_code": { label: "รหัส", flex: 8, align: "L", data_type: "string" },
                        "name_1": { label: "ชื่อ", flex: 15, align: "L", data_type: "string" },
                        "unit_code_new": { label: "หน่วยนับ", flex: 6, align: "C", data_type: "string" },
                        "group_main": { label: "กลุ่มสินค้า", flex: 10, align: "L", data_type: "string" },
                        "item_brand": { label: "ยี่ห้อ", flex: 10, align: "L", data_type: "string" },
                        "price_tag": { label: "ช่องราคา", flex: 5, align: "R", data_type: "string" },
                        "old_amount": { label: "ราคาก่อนหน้า", flex: 10, align: "R", data_type: "number", format: "#,##0.00" },
                        "new_amount": { label: "ราคาล่าสุด", flex: 10, align: "R", data_type: "number", format: "#,##0.00" },
                        "diff_amount": { label: "เปลี่ยนแปลง (บาท)", flex: 10, align: "R", data_type: "number", format: "#,##0.00", text_color_negative: "#FF0000" },
                        "per_diff_amount": { label: "เปลี่ยนแปลง (%)", flex: 10, align: "R", data_type: "number", format: "#,##0.00", text_color_negative: "#FF0000" },
                        "user_name": { label: "พนักงานทำรายการ", flex: 12, align: "L", data_type: "string" }
                    }
                }
            };

            const pdfRes = await fetch('/rojproject/api/get-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pdfPayload),
            });

            if (!pdfRes.ok) {
                const errorPayload = await pdfRes.json().catch(() => null);
                const message = errorPayload?.error || `ไม่สามารถสร้างไฟล์ PDF (${pdfRes.status})`;
                console.error('PDF API request failed', {
                    status: pdfRes.status,
                    statusText: pdfRes.statusText,
                    body: errorPayload,
                });
                setError(message);
                return;
            }

            const pdfBlob = await pdfRes.blob();
            const url = URL.createObjectURL(pdfBlob);
            setPdfUrl(url);

        } catch (err: any) {
            console.error('Error generating report:', err);
            setError(err.message || 'เกิดข้อผิดพลาดในการสร้างรายงาน');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading') {
        return <div className="min-h-screen flex items-center justify-center">กำลังโหลด...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 -ml-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">{REPORT_NAME}</h1>
                            <p className="text-xs text-slate-500">{REPORT_ID}</p>
                        </div>
                    </div>
                    <Link
                        href="/reports/srr20016/schedules"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        ตั้งเวลาส่งรายงาน
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Controls */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
                    <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-100">
                        <button type="button" onClick={() => handlePreset('today')} className="px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-50 text-slate-900 hover:bg-rose-50 hover:text-slate-900 transition-colors">วันนี้</button>
                        <button type="button" onClick={() => handlePreset('yesterday')} className="px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-50 text-slate-900 hover:bg-rose-50 hover:text-slate-900 transition-colors">เมื่อวาน</button>
                        <button type="button" onClick={() => handlePreset('thisWeek')} className="px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-50 text-slate-900 hover:bg-rose-50 hover:text-slate-900 transition-colors">สัปดาห์นี้</button>
                        <button type="button" onClick={() => handlePreset('lastWeek')} className="px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-50 text-slate-900 hover:bg-rose-50 hover:text-slate-900 transition-colors">สัปดาห์ที่แล้ว</button>
                        <button type="button" onClick={() => handlePreset('thisMonth')} className="px-3 py-1.5 text-sm font-medium rounded-lg bg-rose-50 text-slate-900 ring-1 ring-rose-200">เดือนนี้</button>
                        <button type="button" onClick={() => handlePreset('lastMonth')} className="px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-50 text-slate-900 hover:bg-rose-50 hover:text-slate-900 transition-colors">เดือนที่แล้ว</button>
                        <button type="button" onClick={() => handlePreset('thisYear')} className="px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-50 text-slate-900 hover:bg-rose-50 hover:text-slate-900 transition-colors">ปีนี้</button>
                        <button type="button" onClick={() => handlePreset('lastYear')} className="px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-50 text-slate-900 hover:bg-rose-50 hover:text-slate-900 transition-colors">ปีที่แล้ว</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700">ตั้งแต่วันที่</label>
                            <ThaiDatePicker
                                value={startDate}
                                onChange={(date) => setStartDate(date)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700">ถึงวันที่</label>
                            <ThaiDatePicker
                                value={endDate}
                                onChange={(date) => setEndDate(date)}
                            />
                        </div>
                        <div className="lg:col-span-2 flex items-end">
                            <button
                                onClick={handleGenerateResult}
                                disabled={loading}
                                className="w-full bg-rose-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-rose-700 focus:ring-4 focus:ring-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        กำลังสร้างรายงาน...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                        </svg>
                                        ดูรายงาน
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="flex items-center gap-2 text-sm text-slate-900 hover:text-rose-600 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                            ตัวเลือกเพิ่มเติม
                        </button>

                        {showAdvanced && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">เลือกเดือน</label>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                        {months.map((month, index) => (
                                            <button
                                                key={month}
                                                type="button"
                                                onClick={() => handleMonthSelect(index)}
                                                className="px-2 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-900 hover:bg-rose-50 hover:text-slate-900 hover:border-rose-200 transition-all"
                                            >
                                                {month}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">เลือกปี</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {years.map((year) => (
                                            <button
                                                key={year}
                                                type="button"
                                                onClick={() => handleYearSelect(year)}
                                                className="px-2 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-900 hover:bg-rose-50 hover:text-slate-900 hover:border-rose-200 transition-all"
                                            >
                                                {year + 543}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                        {error}
                    </div>
                )}

                {/* PDF Viewer */}
                {pdfUrl && (
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden h-[800px] animate-in fade-in slide-in-from-bottom-4">
                        {(detailRowCount !== null || reportGuid) && (
                            <div className="px-6 py-4 border-b border-slate-200 text-sm text-slate-600 flex flex-wrap gap-4">
                                {detailRowCount !== null && (
                                    <span>พบข้อมูล {detailRowCount.toLocaleString('th-TH')} รายการ</span>
                                )}
                                {reportGuid && (
                                    <span className="text-slate-400">GUID: {reportGuid}</span>
                                )}
                            </div>
                        )}
                        <iframe
                            src={pdfUrl}
                            className="w-full h-full"
                            title="Report PDF"
                        />
                    </div>
                )}

                {/* Logs Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                        <h3 className="text-lg font-semibold text-slate-900">ประวัติการเรียกดูรายงาน</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">เวลา</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ผู้ใช้งาน</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">เงื่อนไข</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {logs.map((log, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {new Date(log.created_at).toLocaleString('th-TH')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {log.username}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {log.details}
                                        </td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-4 text-center text-sm text-slate-500">
                                            ยังไม่มีประวัติการเรียกดู
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
