'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ThaiDatePicker from '@/components/ThaiDatePicker';
import { SHOP_ID_PUBLIC } from '@/lib/constants';

interface ReportLog {
    email: string;
    report_name: string;
    conditions: string;
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

export default function ReportSRR40001() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [logs, setLogs] = useState<ReportLog[]>([]);

    const getThisYearStart = () => new Date(new Date().getFullYear(), 0, 1);
    const getThisYearEnd = () => new Date(new Date().getFullYear(), 11, 31);

    const [startDate, setStartDate] = useState<Date | null>(getThisYearStart());
    const [endDate, setEndDate] = useState<Date | null>(getThisYearEnd());
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
        const allowedReports = (session?.user as any)?.allowed_reports || [];
        const hasAccess = isAdmin || allowedReports.includes('SRR40001');

        if (!hasAccess) {
            router.push('/');
        } else {
            fetchLogs();
        }
    }, [session, status, router]);

    const fetchLogs = async () => {
        try {
            const response = await fetch('/api/mongodb/get', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    collection: 'report_access_logs',
                    filter: {
                        shopid: SHOP_ID_PUBLIC,
                        report_name: 'SRR40001'
                    },
                    sort: { created_at: -1 },
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
            const now = new Date().toISOString();
            const normalizedEmail = session?.user?.email?.toLowerCase() || 'unknown';
            await fetch('/api/mongodb/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    collection: 'report_access_logs',
                    filter: {
                        shopid: SHOP_ID_PUBLIC,
                        email: normalizedEmail,
                        created_at: now,
                    },
                    data: {
                        shopid: SHOP_ID_PUBLIC,
                        email: normalizedEmail,
                        report_name: 'SRR40001',
                        conditions: conditions,
                        created_at: now,
                        updated_at: now,
                    },
                    upsert: true,
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

            const baseQuery = `select 
            doc_date as docdate,
            doc_no as docno,
            (select name_1 from ar_customer where ar_customer.code = ic_trans_detail.cust_code) as "ชื่อลูกค้า",
            item_code as "รหัสสินค้า",
            item_name as "ชื่อสินค้า",
            wh_code as "คลัง",
            qty as "จำนวน",
            unit_code as "หน่วย",
            price as "ราคาขาย",
            (sum_of_cost/qty) as "ราคาทุน",
            sum_of_cost as "รวมต้นทุน",
            sum_amount as "รวมราคาขาย",
            (sum_amount-sum_of_cost) as "ผลต่าง" 
            from ic_trans_detail 
            where trans_flag = 44 and sum_amount<sum_of_cost
            AND doc_date BETWEEN '${formatDate(startDate)}' AND '${formatDate(endDate)}'
            order by doc_date, doc_no`;

            const requestPayload = {
                shopid: SHOP_ID_PUBLIC,
                limit: 5000,
                query_items: [
                    {
                        alias: "inventory_list",
                        query: baseQuery,
                        summary_config: {
                            levels: [
                                {
                                    group_by_fields: ["docdate"],
                                    sum_fields: ["จำนวน", "รวมต้นทุน", "รวมราคาขาย", "ผลต่าง"],
                                    typejson: 1
                                }
                            ],
                            grand_total: true,
                            grand_total_type: 99
                        }
                    }
                ]
            };

            const reportRes = await fetch('/api/generate-report', {
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

            const inventoryData = reportData.data?.inventory_list;
            const detailRows = Array.isArray(inventoryData?.detail)
                ? (inventoryData!.detail as Record<string, unknown>[])
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
                pdf_config: {
                    title: "รายงานวิเคราะห์ขายขาดทุนแสดงรายละเอียดสินค้า (SRR40001)",
                    description: `ตั้งแต่วันที่ ${formatThaiDateForPdf(startDate)} ถึงวันที่ ${formatThaiDateForPdf(endDate)}`,
                    title_align: "C",
                    description_align: "L",
                    orientation: "L",
                    page_size: "A4"
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
                        {
                            alias: "inventory_list",
                            row_type: "detail",
                            columns: [
                                { field: "docdate" },
                                { field: "docno" },
                                { field: "ชื่อลูกค้า" },
                                { field: "รหัสสินค้า" },
                                { field: "ชื่อสินค้า" },
                                { field: "คลัง" },
                                { field: "จำนวน" },
                                { field: "หน่วย" },
                                { field: "ราคาขาย" },
                                { field: "ราคาทุน" },
                                { field: "รวมต้นทุน" },
                                { field: "รวมราคาขาย" },
                                { field: "ผลต่าง" }
                            ]
                        }
                    ],
                    column_schema: {
                        "docdate": { label: "วันที่", flex: 10, align: "L", data_type: "date", format: "dd/MM/yyyy", use_buddhist_year: true },
                        "docno": { label: "เอกสารเลขที่", flex: 12, align: "L" },
                        "ชื่อลูกค้า": { label: "ชื่อลูกค้า", flex: 15, align: "L" },
                        "รหัสสินค้า": { label: "รหัสสินค้า", flex: 10, align: "L" },
                        "ชื่อสินค้า": { label: "ชื่อสินค้า", flex: 20, align: "L" },
                        "คลัง": { label: "คลัง", flex: 5, align: "C" },
                        "จำนวน": { label: "จำนวน", flex: 8, align: "R", data_type: "number", format: "#,##0.00" },
                        "หน่วย": { label: "หน่วย", flex: 6, align: "C" },
                        "ราคาขาย": { label: "ราคาขาย", flex: 8, align: "R", data_type: "number", format: "#,##0.00" },
                        "ราคาทุน": { label: "ราคาทุน", flex: 8, align: "R", data_type: "number", format: "#,##0.00" },
                        "รวมต้นทุน": { label: "รวมต้นทุน", flex: 10, align: "R", data_type: "number", format: "#,##0.00" },
                        "รวมราคาขาย": { label: "รวมราคาขาย", flex: 10, align: "R", data_type: "number", format: "#,##0.00" },
                        "ผลต่าง": { label: "ผลต่าง", flex: 10, align: "R", data_type: "number", format: "#,##0.00", text_color_negative: "#FF0000" }
                    }
                }
            };

            const pdfRes = await fetch('/api/get-pdf', {
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
                        <Link href="/" className="p-2 -ml-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">รายงานวิเคราะห์ขายขาดทุน</h1>
                            <p className="text-xs text-slate-500">SRR40001</p>
                        </div>
                    </div>
                    <Link
                        href="/reports/srr40001/schedules"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
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
                        <button type="button" onClick={() => handlePreset('today')} className="px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-50 text-slate-900 hover:bg-blue-50 hover:text-slate-900 transition-colors">วันนี้</button>
                        <button type="button" onClick={() => handlePreset('yesterday')} className="px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-50 text-slate-900 hover:bg-blue-50 hover:text-slate-900 transition-colors">เมื่อวาน</button>
                        <button type="button" onClick={() => handlePreset('thisWeek')} className="px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-50 text-slate-900 hover:bg-blue-50 hover:text-slate-900 transition-colors">สัปดาห์นี้</button>
                        <button type="button" onClick={() => handlePreset('lastWeek')} className="px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-50 text-slate-900 hover:bg-blue-50 hover:text-slate-900 transition-colors">สัปดาห์ที่แล้ว</button>
                        <button type="button" onClick={() => handlePreset('thisYear')} className="px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-50 text-slate-900 ring-1 ring-blue-200">ปีนี้</button>
                        <button type="button" onClick={() => handlePreset('lastYear')} className="px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-50 text-slate-900 hover:bg-blue-50 hover:text-slate-900 transition-colors">ปีที่แล้ว</button>
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
                                className="w-full bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2"
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
                            className="flex items-center gap-2 text-sm text-slate-900 hover:text-blue-600 transition-colors"
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
                                                className="px-2 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-900 hover:bg-blue-50 hover:text-slate-900 hover:border-blue-200 transition-all"
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
                                                className="px-2 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-900 hover:bg-blue-50 hover:text-slate-900 hover:border-blue-200 transition-all"
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
                                            {log.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {log.conditions}
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
