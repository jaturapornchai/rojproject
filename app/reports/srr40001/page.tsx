'use client';

import ThaiDatePicker from '@/components/ThaiDatePicker';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ReportSRR40001() {
    // --- Date Logic ---
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

    const getThisYearStart = () => new Date(new Date().getFullYear(), 0, 1);
    const getThisYearEnd = () => new Date(new Date().getFullYear(), 11, 31);

    // State now holds Date objects for the picker
    const [startDate, setStartDate] = useState<Date | null>(getThisYearStart());
    const [endDate, setEndDate] = useState<Date | null>(getThisYearEnd());
    const [showAdvanced, setShowAdvanced] = useState(false);

    // --- Presets ---
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
                break; // default is today
            case 'yesterday':
                start.setDate(today.getDate() - 1);
                end.setDate(today.getDate() - 1);
                break;
            case 'thisWeek':
                // Assuming Monday start
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

    // --- Year/Month Lists ---
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 6 }, (_, i) => currentYear - i); // Current + 5 past

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


    // --- Query Construction ---
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

    const defaultPayload = {
        shopid: "rungroj",
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

    const defaultPdfConfig = {
        shopid: "rungroj",
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
                "ชื่อลูกค้า": { label: "ชื่อลูกค้า", flex: 15, align: "L", hide_when_summary: true },
                "รหัสสินค้า": { label: "รหัสสินค้า", flex: 10, align: "L", hide_when_summary: true },
                "ชื่อสินค้า": { label: "ชื่อสินค้า", flex: 15, align: "L", hide_when_summary: true },
                "คลัง": { label: "คลัง", flex: 5, align: "C", hide_when_summary: true },
                "จำนวน": { label: "จำนวน", flex: 8, align: "R", data_type: "number", format: "#,##0.00" },
                "หน่วย": { label: "หน่วย", flex: 5, align: "C", hide_when_summary: true },
                "ราคาขาย": { label: "ราคาขาย", flex: 8, align: "R", data_type: "number", format: "#,##0.00", hide_when_summary: true },
                "ราคาทุน": { label: "ราคาทุน", flex: 8, align: "R", data_type: "number", format: "#,##0.00", hide_when_summary: true },
                "รวมต้นทุน": { label: "รวมต้นทุน", flex: 10, align: "R", data_type: "number", format: "#,##0.00" },
                "รวมราคาขาย": { label: "รวมราคาขาย", flex: 10, align: "R", data_type: "number", format: "#,##0.00" },
                "ผลต่าง": { label: "ผลต่าง", flex: 8, align: "R", data_type: "number", format: "#,##0.00" }
            }
        }
    };

    const [jsonInput, setJsonInput] = useState(JSON.stringify(defaultPayload, null, 2));
    const [pdfConfigInput, setPdfConfigInput] = useState(JSON.stringify(defaultPdfConfig, null, 2));
    const [guid, setGuid] = useState<string | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Update JSON when dates change
    useEffect(() => {
        setJsonInput(JSON.stringify(defaultPayload, null, 2));
        setPdfConfigInput(JSON.stringify(defaultPdfConfig, null, 2));
    }, [startDate, endDate]);

    const handleGenerateResult = async () => {
        setLoading(true);
        setError(null);
        setGuid(null);
        setPdfUrl(null);

        try {
            let parsedBody;
            try {
                parsedBody = JSON.parse(jsonInput);
            } catch (e) {
                throw new Error('Invalid JSON input');
            }

            const res = await fetch('/api/generate-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parsedBody),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || `Error: ${res.statusText}`);
            }

            if (data.guid) {
                setGuid(data.guid);
                // Auto fetch PDF after getting GUID
                handleViewPdf(data.guid);
            } else if (typeof data === 'string') {
                setGuid(data);
                handleViewPdf(data);
            } else {
                const g = JSON.stringify(data);
                setGuid(g);
                handleViewPdf(g);
            }

        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleViewPdf = async (currentGuid: string) => {
        if (!currentGuid) return;
        // setLoading(true); // Already loading from generate
        setError(null);

        try {
            let parsedConfig;
            try {
                parsedConfig = JSON.parse(pdfConfigInput);
            } catch (e) {
                throw new Error('Invalid PDF Config JSON');
            }

            const pdfPayload = {
                ...parsedConfig,
                guid: currentGuid.replace(/"/g, '')
            };

            const res = await fetch('/api/get-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pdfPayload),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `Error fetching PDF: ${res.statusText}`);
            }

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 relative">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-slate-400 hover:text-blue-600 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                        </Link>
                        <h1 className="text-lg font-semibold text-slate-800">SRR40001 : รายงานวิเคราะห์ขายขาดทุน</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href="/reports/srr40001/schedules"
                            className="text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                        >
                            📧 Schedule Email
                        </Link>
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${showAdvanced ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            {showAdvanced ? 'Hide Config' : 'Show Config'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                {/* Controls Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* Date Selection */}
                        <div className="lg:col-span-8 space-y-6">

                            {/* Date Inputs */}
                            <div className="flex flex-col sm:flex-row gap-4 items-end">
                                <div className="w-full sm:w-auto">
                                    <ThaiDatePicker
                                        label="จากวันที่"
                                        value={startDate}
                                        onChange={setStartDate}
                                    />
                                </div>
                                <div className="hidden sm:block pb-3 text-slate-400">-</div>
                                <div className="w-full sm:w-auto">
                                    <ThaiDatePicker
                                        label="ถึงวันที่"
                                        value={endDate}
                                        onChange={setEndDate}
                                    />
                                </div>
                                <div className="pb-0">
                                    <button
                                        onClick={handleGenerateResult}
                                        disabled={loading}
                                        className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium shadow-sm shadow-blue-200"
                                    >
                                        {loading ? 'Generating...' : 'View Report'}
                                    </button>
                                </div>
                            </div>

                            {/* Quick Selects */}
                            <div className="flex flex-wrap gap-2">
                                {['today', 'yesterday', 'thisWeek', 'lastWeek', 'thisYear', 'lastYear'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => handlePreset(type)}
                                        className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-800 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
                                    >
                                        {type === 'today' && 'วันนี้'}
                                        {type === 'yesterday' && 'เมื่อวานนี้'}
                                        {type === 'thisWeek' && 'สัปดาห์นี้'}
                                        {type === 'lastWeek' && 'สัปดาห์ก่อน'}
                                        {type === 'thisYear' && 'ปีนี้'}
                                        {type === 'lastYear' && 'ปีก่อน'}
                                    </button>
                                ))}
                            </div>

                            {/* Year/Month Selects */}
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <div>
                                    <span className="text-xs font-medium text-slate-500 mb-2 block">เลือกปี (พ.ศ.):</span>
                                    <div className="flex flex-wrap gap-2">
                                        {years.map(year => (
                                            <button
                                                key={year}
                                                onClick={() => handleYearSelect(year)}
                                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${startDate && startDate.getFullYear() === year
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white border border-slate-200 text-slate-800 hover:border-blue-300 hover:text-blue-600'
                                                    }`}
                                            >
                                                {year + 543}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs font-medium text-slate-500 mb-2 block">เลือกเดือน:</span>
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                        {months.map((month, index) => {
                                            const year = startDate ? startDate.getFullYear() : currentYear;
                                            return (
                                                <button
                                                    key={month}
                                                    onClick={() => handleMonthSelect(index)}
                                                    className="px-2 py-1.5 text-xs text-center border border-slate-200 rounded hover:border-blue-300 hover:text-blue-600 transition-colors text-slate-800"
                                                >
                                                    {month} {year + 543}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Panel */}
                        <div className="lg:col-span-4 space-y-4">
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 h-full">
                                <h3 className="text-sm font-medium text-slate-900 mb-3">Status</h3>
                                <div className="space-y-2">
                                    {loading && (
                                        <div className="flex items-center text-blue-600 text-sm">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Generating Report...
                                        </div>
                                    )}
                                    {error && (
                                        <div className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-100">
                                            Error: {error}
                                        </div>
                                    )}
                                    {guid && !loading && !error && (
                                        <div className="text-green-600 text-sm flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                                            </svg>
                                            Report Generated Successfully
                                        </div>
                                    )}
                                    {!loading && !guid && !error && (
                                        <div className="text-slate-400 text-sm italic">
                                            Ready to generate report
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Advanced Config (Collapsible) */}
                {showAdvanced && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Query Payload (JSON)</label>
                            <textarea
                                value={jsonInput}
                                onChange={(e) => setJsonInput(e.target.value)}
                                className="w-full h-64 p-3 font-mono text-xs bg-slate-900 text-slate-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">PDF Config (JSON)</label>
                            <textarea
                                value={pdfConfigInput}
                                onChange={(e) => setPdfConfigInput(e.target.value)}
                                className="w-full h-64 p-3 font-mono text-xs bg-slate-900 text-slate-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                )}

                {/* PDF Viewer */}
                {pdfUrl && (
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden min-h-[800px]">
                        <iframe
                            src={pdfUrl}
                            className="w-full h-[800px] border-0"
                            title="PDF Report"
                        />
                    </div>
                )}
            </div>
        </main>
    );
}
