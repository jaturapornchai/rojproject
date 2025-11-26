'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ThaiDatePicker from '@/components/ThaiDatePicker';
import { SHOP_ID_PUBLIC } from '@/lib/constants';

interface Employee {
    code: string;
    name_1: string;
    name_2: string;
}

interface Branch {
    code: string;
    name_1: string;
}

export default function ReportSRR50003() {
    const { data: session, status } = useSession();
    const router = useRouter();
    
    const getThisYearStart = () => new Date(new Date().getFullYear(), 0, 1);
    const getThisYearEnd = () => new Date(new Date().getFullYear(), 11, 31);
    
    const [startDate, setStartDate] = useState<Date | null>(getThisYearStart());
    const [endDate, setEndDate] = useState<Date | null>(getThisYearEnd());
    const [showAdvanced, setShowAdvanced] = useState(true);
    const [loading, setLoading] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [queryLog, setQueryLog] = useState<any>(null);
    
    // Employee filter states
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [employeeFilterType, setEmployeeFilterType] = useState<'all' | 'single' | 'range' | 'multiple'>('all');
    const [selectedEmployee, setSelectedEmployee] = useState<string>('');
    const [employeeRangeStart, setEmployeeRangeStart] = useState<string>('');
    const [employeeRangeEnd, setEmployeeRangeEnd] = useState<string>('');
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
    const [employeeSearch, setEmployeeSearch] = useState<string>('');
    const [showEmployeeFilter, setShowEmployeeFilter] = useState(false);
    
    // Branch filter states
    const [branches, setBranches] = useState<Branch[]>([]);
    const [branchFilterType, setBranchFilterType] = useState<'all' | 'single' | 'range' | 'multiple'>('all');
    const [selectedBranch, setSelectedBranch] = useState<string>('');
    const [branchRangeStart, setBranchRangeStart] = useState<string>('');
    const [branchRangeEnd, setBranchRangeEnd] = useState<string>('');
    const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
    const [branchSearch, setBranchSearch] = useState<string>('');
    const [showBranchFilter, setShowBranchFilter] = useState(false);

    useEffect(() => {
        if (status === 'loading') return;
        if (!session) {
            router.push('/login');
            return;
        }

        const isAdmin = session?.user?.isAdmin;
        const allowedReports = (session?.user as any)?.allowed_reports || [];
        const hasAccess = isAdmin || allowedReports.includes('SRR50003');

        if (!hasAccess) {
            router.push('/');
            return;
        }
    }, [session, status, router]);

    // Fetch employees
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await fetch('/api/generate-report', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        shopid: SHOP_ID_PUBLIC,
                        limit: 10000,
                        query_items: [{
                            alias: "employees",
                            query: "select code,name_1,name_2 from erp_user order by code"
                        }]
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.data?.employees?.detail) {
                        setEmployees(data.data.employees.detail);
                    }
                }
            } catch (error) {
                console.error('Error fetching employees:', error);
            }
        };

        fetchEmployees();
    }, []);

    // Fetch branches
    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const response = await fetch('/api/generate-report', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        shopid: SHOP_ID_PUBLIC,
                        limit: 10000,
                        query_items: [{
                            alias: "branches",
                            query: "select code,name_1 from erp_branch_list order by code"
                        }]
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.data?.branches?.detail) {
                        setBranches(data.data.branches.detail);
                    }
                }
            } catch (error) {
                console.error('Error fetching branches:', error);
            }
        };

        fetchBranches();
    }, []);

    const formatDate = (date: Date | null): string => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatThaiDateForPdf = (date: Date | null): string => {
        if (!date) return '';
        const thaiYear = date.getFullYear() + 543;
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${day}/${month}/${thaiYear}`;
    };

    const buildEmployeeFilter = (): string => {
        switch (employeeFilterType) {
            case 'single':
                return selectedEmployee ? ` and cashier_code = '${selectedEmployee}'` : '';
            case 'range':
                if (employeeRangeStart && employeeRangeEnd) {
                    return ` and cashier_code between '${employeeRangeStart}' and '${employeeRangeEnd}'`;
                }
                return '';
            case 'multiple':
                if (selectedEmployees.length > 0) {
                    const codes = selectedEmployees.map(code => `'${code}'`).join(',');
                    return ` and cashier_code in (${codes})`;
                }
                return '';
            case 'all':
            default:
                return '';
        }
    };

    const buildBranchFilter = (): string => {
        switch (branchFilterType) {
            case 'single':
                return selectedBranch ? ` and branch_code = '${selectedBranch}'` : '';
            case 'range':
                if (branchRangeStart && branchRangeEnd) {
                    return ` and branch_code between '${branchRangeStart}' and '${branchRangeEnd}'`;
                }
                return '';
            case 'multiple':
                if (selectedBranches.length > 0) {
                    const codes = selectedBranches.map(code => `'${code}'`).join(',');
                    return ` and branch_code in (${codes})`;
                }
                return '';
            case 'all':
            default:
                return '';
        }
    };

    const toggleEmployeeSelection = (code: string) => {
        setSelectedEmployees(prev =>
            prev.includes(code)
                ? prev.filter(c => c !== code)
                : [...prev, code]
        );
    };

    const toggleBranchSelection = (code: string) => {
        setSelectedBranches(prev =>
            prev.includes(code)
                ? prev.filter(c => c !== code)
                : [...prev, code]
        );
    };

    const filteredEmployees = employees.filter(emp => {
        const searchLower = employeeSearch.toLowerCase();
        return emp.code.toLowerCase().includes(searchLower) ||
               emp.name_1.toLowerCase().includes(searchLower) ||
               (emp.name_2 && emp.name_2.toLowerCase().includes(searchLower));
    });

    const filteredBranches = branches.filter(branch => {
        const searchLower = branchSearch.toLowerCase();
        return branch.code.toLowerCase().includes(searchLower) ||
               branch.name_1.toLowerCase().includes(searchLower);
    });

    const handleGenerateResult = async () => {
        setError(null);
        
        if (!startDate || !endDate) {
            setError('กรุณาเลือกช่วงวันที่');
            return;
        }

        if (startDate > endDate) {
            setError('วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด');
            return;
        }

        setLoading(true);
        setPdfUrl(null);
        setQueryLog(null);

        try {
            const employeeFilter = buildEmployeeFilter();
            const branchFilter = buildBranchFilter();
            
            const baseQuery = `SELECT 
       doc_date,(CASE when (pos_id <> '') THEN 1 ELSE 0 END) as pos_status,(CASE when (pos_id <> '') THEN pos_id ELSE 'ขายหลังร้าน' END) as pos_id,
       cashier_code,(select name_1 from erp_user where code=cashier_code) as cashier_name,
       SUM(Totale1) total_cash,
       sum(Totale9) total_wallet,
       SUM(Totale2) total_card,
       SUM(Totale3) total_amount,
       SUM(Totale4) total_1,
       SUM(Totale5) total_2,
       SUM(Totale6) total_3,
       SUM(Totale7) total_s,
       SUM(Totale8) total_d
FROM 
(
       select doc_date,pos_id,cashier_code,branch_code,(select name_1 from erp_user where code=cashier_code) as cashier_name
       
       ---เงินสด---
       ,(CASE when (is_pos = 1) THEN (((select cb_trans.total_net_amount from cb_trans where cb_trans.doc_no=ic_trans.doc_no)
         +(CASE WHEN discount_word <> '' THEN discount_word::numeric ELSE 0 END))
         -(select cb_trans.card_amount from cb_trans where cb_trans.doc_no=ic_trans.doc_no)
         -(select cb_trans.wallet_amount from cb_trans where cb_trans.doc_no=ic_trans.doc_no)
         ) ELSE 0 END) AS Totale1 --เงินสด
        ---เงินเชื่อ--- 
              ,(CASE when (is_pos = 1) THEN (select cb_trans.card_amount from cb_trans where cb_trans.doc_no=ic_trans.doc_no) ELSE 0 END) AS Totale2
        ---wallet---	  
              ,(CASE when (is_pos = 1) THEN ( (select cb_trans.wallet_amount from cb_trans where cb_trans.doc_no=ic_trans.doc_no)
         +(CASE WHEN discount_word <> '' THEN discount_word::numeric ELSE 0 END)
         ) ELSE 0 END) AS Totale9 --wallet
        
        ---	Total_amount---  
              ,(CASE when (is_pos = 1) THEN (select cb_trans.total_net_amount from cb_trans where cb_trans.doc_no=ic_trans.doc_no)
              +(CASE WHEN discount_word <> '' THEN discount_word::numeric ELSE 0 END) ELSE 0 END) AS Totale3 --Total_amount
              
              ,(CASE when (is_pos = 0) and (inquiry_type = 1) THEN total_amount ELSE 0 END) AS Totale4
              ,(CASE when (is_pos = 0) and (inquiry_type = 0) THEN total_amount ELSE 0 END) AS Totale5
              ,(CASE when (is_pos = 0) THEN total_amount ELSE 0 END) AS Totale6
              ,(CASE when (is_pos in (0,1)) THEN (total_amount+(CASE when discount_word <> '' THEN discount_word::numeric ELSE 0 END)) ELSE 0 END) AS Totale7,
          (CASE when discount_word <> '' THEN discount_word::numeric ELSE 0 END) as Totale8

       from  ic_trans where trans_flag = 44 and last_status = 0 and doc_date between '${formatDate(startDate)}' and '${formatDate(endDate)}'${employeeFilter}${branchFilter}   ) t
GROUP BY doc_date,pos_id,cashier_code order by doc_date,pos_id,cashier_code`;

            const requestPayload = {
                shopid: SHOP_ID_PUBLIC,
                limit: 5000,
                query_items: [{
                    alias: "daily_sales_summary",
                    query: baseQuery,
                    summary_config: {
                        levels: [{
                            group_by_fields: ["doc_date"],
                            sum_fields: ["total_cash", "total_wallet", "total_card", "total_amount", "total_1", "total_2", "total_3", "total_s", "total_d"],
                            typejson: 1
                        }],
                        grand_total: true,
                        grand_total_type: 99
                    }
                }]
            };

            // เรียก Generate Report API
            const reportRes = await fetch('/api/generate-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestPayload),
            });

            if (!reportRes.ok) {
                const errorData = await reportRes.json();
                throw new Error(errorData?.error || 'เกิดข้อผิดพลาดในการสร้างรายงาน');
            }

            const reportData = await reportRes.json();

            // Log ข้อมูลที่ได้จาก PostgreSQL
            console.log('=== PostgreSQL Query Result ===');
            console.log('Success:', reportData.success);
            console.log('GUID:', reportData.guid);
            console.log('Detail Row Count:', reportData.detailRowCount);
            console.log('Full Data:', JSON.stringify(reportData.data, null, 2));
            console.log('==============================');

            // เก็บ log ไว้แสดงบน UI
            setQueryLog({
                success: reportData.success,
                guid: reportData.guid,
                detailRowCount: reportData.detailRowCount,
                timestamp: new Date().toLocaleString('th-TH'),
                data: reportData.data
            });

            if (!reportData?.success) {
                throw new Error(reportData?.error || reportData?.message || 'ไม่สามารถสร้างรายงานได้');
            }

            if (reportData.guid) {
                await generatePDF(reportData.guid);
            } else {
                throw new Error('ไม่ได้รับ GUID จากระบบ');
            }

        } catch (error: any) {
            console.error('Error:', error);
            setError(error.message || 'เกิดข้อผิดพลาดในการสร้างรายงาน');
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = async (guid: string) => {
        try {
            const pdfPayload = {
                shopid: SHOP_ID_PUBLIC,
                guid,
                pdf_config: {
                    title: "รายงานสรุปยอดขายประจำวัน (SRR50003)",
                    description: `ตั้งแต่วันที่ ${formatThaiDateForPdf(startDate)} ถึงวันที่ ${formatThaiDateForPdf(endDate)}`,
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
                        }
                    },
                    sections: [{
                        alias: "daily_sales_summary",
                        row_type: "detail",
                        columns: [
                            { field: "doc_date" },
                            { field: "pos_id" },
                            { field: "cashier_name" },
                            { field: "total_cash" },
                            { field: "total_wallet" },
                            { field: "total_card" },
                            { field: "total_amount" },
                            { field: "total_1" },
                            { field: "total_2" },
                            { field: "total_3" },
                            { field: "total_s" }
                        ]
                    }],
                    column_schema: {
                        "doc_date": {
                            label: "เอกสารวันที่",
                            flex: 10,
                            align: "L",
                            data_type: "date",
                            format: "dd/MM/yyyy",
                            use_buddhist_year: true
                        },
                        "pos_id": {
                            label: "ประเภทการขาย",
                            flex: 12,
                            align: "L",
                            hide_when_summary: true
                        },
                        "cashier_name": {
                            label: "พนักงานขาย",
                            flex: 15,
                            align: "L",
                            hide_when_summary: true
                        },
                        "total_cash": {
                            label: "POS ขายเงินสด",
                            flex: 12,
                            align: "R",
                            data_type: "number",
                            format: "#,##0.00"
                        },
                        "total_wallet": {
                            label: "POS ขาย Wallet",
                            flex: 12,
                            align: "R",
                            data_type: "number",
                            format: "#,##0.00"
                        },
                        "total_card": {
                            label: "POS ขายเงินเชื่อ",
                            flex: 12,
                            align: "R",
                            data_type: "number",
                            format: "#,##0.00"
                        },
                        "total_amount": {
                            label: "POS ยอดเงินรวม",
                            flex: 12,
                            align: "R",
                            data_type: "number",
                            format: "#,##0.00"
                        },
                        "total_1": {
                            label: "ขายเงินสด",
                            flex: 12,
                            align: "R",
                            data_type: "number",
                            format: "#,##0.00"
                        },
                        "total_2": {
                            label: "ขายเงินเชื่อ",
                            flex: 12,
                            align: "R",
                            data_type: "number",
                            format: "#,##0.00"
                        },
                        "total_3": {
                            label: "รวมขาย",
                            flex: 12,
                            align: "R",
                            data_type: "number",
                            format: "#,##0.00"
                        },
                        "total_s": {
                            label: "ยอดขายสุทธิ",
                            flex: 12,
                            align: "R",
                            data_type: "number",
                            format: "#,##0.00"
                        }
                    }
                }
            };

            const pdfRes = await fetch('/api/get-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pdfPayload),
            });

            if (!pdfRes.ok) {
                throw new Error('ไม่สามารถสร้าง PDF ได้');
            }

            const pdfBlob = await pdfRes.blob();
            const url = URL.createObjectURL(pdfBlob);
            setPdfUrl(url);

        } catch (error: any) {
            console.error('PDF Error:', error);
            setError(error.message || 'เกิดข้อผิดพลาดในการสร้าง PDF');
        }
    };

    const setDateRange = (days: number) => {
        const today = new Date();
        const start = new Date(today);
        start.setDate(start.getDate() - days);
        setStartDate(start);
        setEndDate(today);
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
        setStartDate(start);
        setEndDate(end);
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
        setStartDate(start);
        setEndDate(end);
    };

    const handleYearSelect = (year: number) => {
        const start = new Date(year, 0, 1);
        const end = new Date(year, 11, 31);
        setStartDate(start);
        setEndDate(end);
    };

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">กำลังโหลด...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 -ml-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">รายงานสรุปยอดขายประจำวัน</h1>
                            <p className="text-xs text-slate-500">SRR50003</p>
                        </div>
                    </div>
                    <Link
                        href="/reports/srr50003/schedules"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        ตั้งเวลาส่งรายงาน
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Controls */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6 mb-6">
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
                                onChange={setStartDate}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700">ถึงวันที่</label>
                            <ThaiDatePicker
                                value={endDate}
                                onChange={setEndDate}
                            />
                        </div>
                        <div className="lg:col-span-2 flex items-end">
                            <button
                                onClick={handleGenerateResult}
                                disabled={loading || !startDate || !endDate}
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
                            <div className="mt-4 space-y-6 animate-in fade-in slide-in-from-top-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                                {/* Employee Filter */}
                                <div className="border-t border-slate-200 pt-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowEmployeeFilter(!showEmployeeFilter)}
                                            className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 transition-transform ${showEmployeeFilter ? 'rotate-180' : ''}`}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                            </svg>
                                            🧑‍💼 พนักงาน
                                            {employeeFilterType !== 'all' && (
                                                <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                                                    {employeeFilterType === 'single' && selectedEmployee ? '1 คน' : 
                                                     employeeFilterType === 'range' && employeeRangeStart && employeeRangeEnd ? 'ช่วง' :
                                                     employeeFilterType === 'multiple' && selectedEmployees.length > 0 ? `${selectedEmployees.length} คน` : ''}
                                                </span>
                                            )}
                                        </button>
                                        <div className="flex items-center gap-2">
                                            {employeeFilterType !== 'all' && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEmployeeFilterType('all');
                                                        setSelectedEmployee('');
                                                        setEmployeeRangeStart('');
                                                        setEmployeeRangeEnd('');
                                                        setSelectedEmployees([]);
                                                        setEmployeeSearch('');
                                                    }}
                                                    className="text-xs text-blue-600 hover:text-blue-700 underline"
                                                >
                                                    ล้างตัวกรอง
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {showEmployeeFilter && (
                                    <div className="space-y-3">
                                        <select
                                            value={employeeFilterType}
                                            onChange={(e) => {
                                                const newType = e.target.value as 'all' | 'single' | 'range' | 'multiple';
                                                setEmployeeFilterType(newType);
                                                setSelectedEmployee('');
                                                setEmployeeRangeStart('');
                                                setEmployeeRangeEnd('');
                                                setSelectedEmployees([]);
                                                setEmployeeSearch('');
                                            }}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm font-medium"
                                        >
                                            <option value="all">✓ ทุกพนักงาน</option>
                                            <option value="single">👤 เลือกพนักงานคนเดียว</option>
                                            <option value="range">↔️ เลือกช่วงพนักงาน</option>
                                            <option value="multiple">👥 เลือกหลายพนักงาน</option>
                                        </select>

                                        {employeeFilterType === 'single' && (
                                            <div className="space-y-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
                                                <input
                                                    type="text"
                                                    placeholder="🔍 พิมพ์ชื่อหรือรหัสพนักงาน..."
                                                    value={employeeSearch}
                                                    onChange={(e) => setEmployeeSearch(e.target.value)}
                                                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                />
                                                <select
                                                    value={selectedEmployee}
                                                    onChange={(e) => setSelectedEmployee(e.target.value)}
                                                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                                    size={8}
                                                >
                                                    <option value="">-- เลือกพนักงาน --</option>
                                                    {filteredEmployees.map((emp) => (
                                                        <option key={emp.code} value={emp.code}>
                                                            {emp.code} - {emp.name_1} {emp.name_2}
                                                        </option>
                                                    ))}
                                                </select>
                                                {selectedEmployee && (
                                                    <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded">
                                                        ✓ เลือกแล้ว: {employees.find(e => e.code === selectedEmployee)?.name_1}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {employeeFilterType === 'range' && (
                                            <div className="space-y-2 bg-purple-50 p-3 rounded-lg border border-purple-200">
                                                <input
                                                    type="text"
                                                    placeholder="🔍 พิมพ์ชื่อหรือรหัสพนักงาน..."
                                                    value={employeeSearch}
                                                    onChange={(e) => setEmployeeSearch(e.target.value)}
                                                    className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                                                />
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-xs text-purple-700 font-medium mb-1 block">จาก</label>
                                                        <select
                                                            value={employeeRangeStart}
                                                            onChange={(e) => setEmployeeRangeStart(e.target.value)}
                                                            className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-sm"
                                                            size={6}
                                                        >
                                                            <option value="">เลือก...</option>
                                                            {filteredEmployees.map((emp) => (
                                                                <option key={emp.code} value={emp.code}>
                                                                    {emp.code} - {emp.name_1}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-purple-700 font-medium mb-1 block">ถึง</label>
                                                        <select
                                                            value={employeeRangeEnd}
                                                            onChange={(e) => setEmployeeRangeEnd(e.target.value)}
                                                            className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-sm"
                                                            size={6}
                                                        >
                                                            <option value="">เลือก...</option>
                                                            {filteredEmployees.map((emp) => (
                                                                <option key={emp.code} value={emp.code}>
                                                                    {emp.code} - {emp.name_1}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                {employeeRangeStart && employeeRangeEnd && (
                                                    <div className="text-xs text-purple-700 bg-purple-100 p-2 rounded">
                                                        ✓ ช่วง: {employeeRangeStart} → {employeeRangeEnd}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {employeeFilterType === 'multiple' && (
                                            <div className="space-y-2 bg-green-50 p-3 rounded-lg border border-green-200">
                                                <div className="flex items-center justify-between">
                                                    <input
                                                        type="text"
                                                        placeholder="🔍 พิมพ์ชื่อหรือรหัสพนักงาน..."
                                                        value={employeeSearch}
                                                        onChange={(e) => setEmployeeSearch(e.target.value)}
                                                        className="flex-1 px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                                                    />
                                                    {selectedEmployees.length > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedEmployees([])}
                                                            className="ml-2 px-3 py-2 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                                                        >
                                                            ล้าง ({selectedEmployees.length})
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="border border-green-300 rounded-lg p-2 max-h-64 overflow-y-auto bg-white">
                                                    {employees.length === 0 ? (
                                                        <p className="text-sm text-slate-500 p-2">กำลังโหลดข้อมูลพนักงาน...</p>
                                                    ) : filteredEmployees.length === 0 ? (
                                                        <p className="text-sm text-slate-500 p-2">ไม่พบพนักงานที่ค้นหา</p>
                                                    ) : (
                                                        <div className="space-y-1">
                                                            {filteredEmployees.map((emp) => (
                                                                <label key={emp.code} className={`flex items-center gap-2 cursor-pointer hover:bg-green-50 p-2 rounded transition-colors ${selectedEmployees.includes(emp.code) ? 'bg-green-100' : ''}`}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedEmployees.includes(emp.code)}
                                                                        onChange={() => toggleEmployeeSelection(emp.code)}
                                                                        className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                                                                    />
                                                                    <span className="text-sm text-slate-700 flex-1">
                                                                        {emp.code} - {emp.name_1} {emp.name_2}
                                                                    </span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                {selectedEmployees.length > 0 && (
                                                    <div className="text-xs text-green-700 bg-green-100 p-2 rounded space-y-1">
                                                        <div className="font-semibold">✓ เลือกแล้ว {selectedEmployees.length} คน:</div>
                                                        <div className="text-green-600">
                                                            {selectedEmployees.map(code => {
                                                                const emp = employees.find(e => e.code === code);
                                                                return emp ? `${emp.code} - ${emp.name_1} ${emp.name_2}` : code;
                                                            }).join(', ')}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    )}
                                </div>

                                {/* Branch Filter */}
                                <div className="border-t border-slate-200 pt-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowBranchFilter(!showBranchFilter)}
                                            className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 transition-transform ${showBranchFilter ? 'rotate-180' : ''}`}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                            </svg>
                                            🏢 สาขา
                                            {branchFilterType !== 'all' && (
                                                <span className="ml-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">
                                                    {branchFilterType === 'single' && selectedBranch ? '1 สาขา' : 
                                                     branchFilterType === 'range' && branchRangeStart && branchRangeEnd ? 'ช่วง' :
                                                     branchFilterType === 'multiple' && selectedBranches.length > 0 ? `${selectedBranches.length} สาขา` : ''}
                                                </span>
                                            )}
                                        </button>
                                        <div className="flex items-center gap-2">
                                            {branchFilterType !== 'all' && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setBranchFilterType('all');
                                                        setSelectedBranch('');
                                                        setBranchRangeStart('');
                                                        setBranchRangeEnd('');
                                                        setSelectedBranches([]);
                                                        setBranchSearch('');
                                                    }}
                                                    className="text-xs text-blue-600 hover:text-blue-700 underline"
                                                >
                                                    ล้างตัวกรอง
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {showBranchFilter && (
                                    <div className="space-y-3">
                                        <select
                                            value={branchFilterType}
                                            onChange={(e) => {
                                                const newType = e.target.value as 'all' | 'single' | 'range' | 'multiple';
                                                setBranchFilterType(newType);
                                                setSelectedBranch('');
                                                setBranchRangeStart('');
                                                setBranchRangeEnd('');
                                                setSelectedBranches([]);
                                                setBranchSearch('');
                                            }}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm font-medium"
                                        >
                                            <option value="all">✓ ทุกสาขา</option>
                                            <option value="single">🏪 เลือกสาขาเดียว</option>
                                            <option value="range">↔️ เลือกช่วงสาขา</option>
                                            <option value="multiple">🏬 เลือกหลายสาขา</option>
                                        </select>

                                        {branchFilterType === 'single' && (
                                            <div className="space-y-2 bg-orange-50 p-3 rounded-lg border border-orange-200">
                                                <input
                                                    type="text"
                                                    placeholder="🔍 พิมพ์ชื่อหรือรหัสสาขา..."
                                                    value={branchSearch}
                                                    onChange={(e) => setBranchSearch(e.target.value)}
                                                    className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                                                />
                                                <select
                                                    value={selectedBranch}
                                                    onChange={(e) => setSelectedBranch(e.target.value)}
                                                    className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                                                    size={8}
                                                >
                                                    <option value="">-- เลือกสาขา --</option>
                                                    {filteredBranches.map((branch) => (
                                                        <option key={branch.code} value={branch.code}>
                                                            {branch.code} - {branch.name_1}
                                                        </option>
                                                    ))}
                                                </select>
                                                {selectedBranch && (
                                                    <div className="text-xs text-orange-700 bg-orange-100 p-2 rounded">
                                                        ✓ เลือกแล้ว: {branches.find(b => b.code === selectedBranch)?.name_1}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {branchFilterType === 'range' && (
                                            <div className="space-y-2 bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                                                <input
                                                    type="text"
                                                    placeholder="🔍 พิมพ์ชื่อหรือรหัสสาขา..."
                                                    value={branchSearch}
                                                    onChange={(e) => setBranchSearch(e.target.value)}
                                                    className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                                />
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-xs text-indigo-700 font-medium mb-1 block">จาก</label>
                                                        <select
                                                            value={branchRangeStart}
                                                            onChange={(e) => setBranchRangeStart(e.target.value)}
                                                            className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
                                                            size={6}
                                                        >
                                                            <option value="">เลือก...</option>
                                                            {filteredBranches.map((branch) => (
                                                                <option key={branch.code} value={branch.code}>
                                                                    {branch.code} - {branch.name_1}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-indigo-700 font-medium mb-1 block">ถึง</label>
                                                        <select
                                                            value={branchRangeEnd}
                                                            onChange={(e) => setBranchRangeEnd(e.target.value)}
                                                            className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
                                                            size={6}
                                                        >
                                                            <option value="">เลือก...</option>
                                                            {filteredBranches.map((branch) => (
                                                                <option key={branch.code} value={branch.code}>
                                                                    {branch.code} - {branch.name_1}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                {branchRangeStart && branchRangeEnd && (
                                                    <div className="text-xs text-indigo-700 bg-indigo-100 p-2 rounded">
                                                        ✓ ช่วง: {branchRangeStart} → {branchRangeEnd}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {branchFilterType === 'multiple' && (
                                            <div className="space-y-2 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                                                <div className="flex items-center justify-between">
                                                    <input
                                                        type="text"
                                                        placeholder="🔍 พิมพ์ชื่อหรือรหัสสาขา..."
                                                        value={branchSearch}
                                                        onChange={(e) => setBranchSearch(e.target.value)}
                                                        className="flex-1 px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                                    />
                                                    {selectedBranches.length > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedBranches([])}
                                                            className="ml-2 px-3 py-2 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                                                        >
                                                            ล้าง ({selectedBranches.length})
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="border border-emerald-300 rounded-lg p-2 max-h-64 overflow-y-auto bg-white">
                                                    {branches.length === 0 ? (
                                                        <p className="text-sm text-slate-500 p-2">กำลังโหลดข้อมูลสาขา...</p>
                                                    ) : filteredBranches.length === 0 ? (
                                                        <p className="text-sm text-slate-500 p-2">ไม่พบสาขาที่ค้นหา</p>
                                                    ) : (
                                                        <div className="space-y-1">
                                                            {filteredBranches.map((branch) => (
                                                                <label key={branch.code} className={`flex items-center gap-2 cursor-pointer hover:bg-emerald-50 p-2 rounded transition-colors ${selectedBranches.includes(branch.code) ? 'bg-emerald-100' : ''}`}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedBranches.includes(branch.code)}
                                                                        onChange={() => toggleBranchSelection(branch.code)}
                                                                        className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                                                                    />
                                                                    <span className="text-sm text-slate-700 flex-1">
                                                                        {branch.code} - {branch.name_1}
                                                                    </span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                {selectedBranches.length > 0 && (
                                                    <div className="text-xs text-emerald-700 bg-emerald-100 p-2 rounded space-y-1">
                                                        <div className="font-semibold">✓ เลือกแล้ว {selectedBranches.length} สาขา:</div>
                                                        <div className="text-emerald-600">
                                                            {selectedBranches.map(code => {
                                                                const branch = branches.find(b => b.code === code);
                                                                return branch ? `${branch.code} - ${branch.name_1}` : code;
                                                            }).join(', ')}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                        {error}
                    </div>
                )}

                {/* Query Log Viewer */}
                {queryLog && (
                    <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 overflow-hidden mb-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-emerald-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-100">PostgreSQL Query Result</h3>
                                    <p className="text-xs text-slate-400">{queryLog.timestamp}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    {queryLog.detailRowCount || 0} รายการ
                                </span>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(JSON.stringify(queryLog, null, 2));
                                        alert('คัดลอก JSON แล้ว!');
                                    }}
                                    className="px-3 py-1.5 text-xs bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition flex items-center gap-1.5"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                                    </svg>
                                    คัดลอก JSON
                                </button>
                            </div>
                        </div>
                        <div className="p-6 max-h-96 overflow-auto">
                            <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap">
                                {JSON.stringify(queryLog.data, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}

                {/* PDF Viewer */}
                {pdfUrl && (
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden h-[800px] animate-in fade-in slide-in-from-bottom-4">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                            <h3 className="font-medium text-slate-700">ตัวอย่างรายงาน</h3>
                            <a
                                href={pdfUrl}
                                download="รายงานสรุปยอดขายประจำวัน.pdf"
                                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                ดาวน์โหลด PDF
                            </a>
                        </div>
                        <iframe
                            src={pdfUrl}
                            className="w-full h-full"
                            title="PDF Viewer"
                        />
                    </div>
                )}
            </div>
        </main>
    );
}
