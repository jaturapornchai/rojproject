'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ThaiDatePicker from '@/components/ThaiDatePicker';
import { SHOP_ID_PUBLIC } from '@/lib/constants';

// Shared modules
import {
    REPORT_ID,
    REPORT_NAME,
    buildQuery,
    buildPdfConfig,
    formatThaiDate,
    type ReportFilters
} from '@/lib/reports/srr40010';
import { useReportFilters, useDateRange, useMasterData } from '@/hooks/reports/srr40010';
import {
    FilterPanel,
    DatePresetButtons,
    MonthYearSelector,
    FilterSummary
} from '@/components/reports/srr40010';

interface ReportLog {
    username: string;
    details: string;
    created_at: string;
}

export default function ReportSRR40010() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [logs, setLogs] = useState<ReportLog[]>([]);

    // ใช้ Custom Hooks
    const { startDate, endDate, setStartDate, setEndDate, handlePreset, handleMonthSelect, handleYearSelect } = useDateRange({ defaultPreset: 'thisMonth' });
    const { customers, branches } = useMasterData();
    const {
        filters,
        setCustomerFilterType,
        setSelectedCustomer,
        setCustomerRangeStart,
        setCustomerRangeEnd,
        toggleCustomerSelection,
        setBranchFilterType,
        setSelectedBranch,
        setBranchRangeStart,
        setBranchRangeEnd,
        toggleBranchSelection,
        setDiffFilter,
        setSaleType
    } = useReportFilters();

    // Local state
    const [showAdvanced, setShowAdvanced] = useState(true);
    const [loading, setLoading] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [queryLog, setQueryLog] = useState<any>(null);

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

    // Fetch logs on mount and when session changes
    useEffect(() => {
        if (status === 'authenticated' && session) {
            const isAdmin = session?.user?.isAdmin;
            const allowedReports = session?.user?.allowed_reports || [];
            const hasAccess = isAdmin || allowedReports.includes(REPORT_ID);
            if (hasAccess) {
                fetchLogs();
            }
        }
    }, [session, status]);

    // Auth check
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

    if (!session) {
        router.push('/rojproject/login');
        return null;
    }

    const isAdmin = session?.user?.isAdmin;
    const allowedReports = session?.user?.allowed_reports || [];
    const hasAccess = isAdmin || allowedReports.includes(REPORT_ID);

    if (!hasAccess) {
        router.push('/');
        return null;
    }

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
            // Save log before generating report
            const conditions = `Date: ${startDate.toLocaleDateString('th-TH')} - ${endDate.toLocaleDateString('th-TH')}`;
            await saveLog(conditions);

            // สร้าง Query โดยใช้ shared query builder
            const query = buildQuery({
                startDate,
                endDate,
                filters
            });

            const requestPayload = {
                shopid: SHOP_ID_PUBLIC,
                limit: 5000,
                query_items: [{
                    alias: "price_comparison",
                    query: query,
                    summary_config: {
                        levels: [{
                            group_by_fields: ["doc_date"],
                            sum_fields: ["qty", "sum_amount", "diff"],
                            typejson: 1
                        }],
                        grand_total: true,
                        grand_total_type: 99
                    }
                }]
            };

            const reportRes = await fetch('/rojproject/api/generate-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestPayload),
            });

            if (!reportRes.ok) {
                const errorData = await reportRes.json();
                throw new Error(errorData?.error || 'เกิดข้อผิดพลาดในการสร้างรายงาน');
            }

            const reportData = await reportRes.json();

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
            // สร้าง PDF Config โดยใช้ shared function
            const pdfConfig = buildPdfConfig(guid, startDate!, endDate!);

            // Log PDF config before sending to API
            console.log('[generatePDF] Sending PDF config:', JSON.stringify(pdfConfig, null, 2));

            const pdfRes = await fetch('/rojproject/api/get-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pdfConfig),
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
                            <h1 className="text-xl font-bold text-slate-900">{REPORT_NAME}</h1>
                            <p className="text-xs text-slate-500">{REPORT_ID}</p>
                        </div>
                    </div>
                    <Link
                        href="/reports/srr40010/schedules"
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
                    {/* Date Preset Buttons */}
                    <DatePresetButtons onPresetSelect={handlePreset} />

                    {/* Date Pickers & Generate Button */}
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

                    {/* Filter Summary */}
                    <FilterSummary
                        filters={filters}
                        customers={customers}
                        branches={branches}
                        className="pt-2"
                    />

                    {/* Advanced Options Toggle */}
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
                                {/* Month/Year Selector */}
                                <MonthYearSelector
                                    onMonthSelect={handleMonthSelect}
                                    onYearSelect={handleYearSelect}
                                />

                                {/* Filter Panel */}
                                <FilterPanel
                                    filters={filters}
                                    customers={customers}
                                    branches={branches}
                                    onCustomerFilterTypeChange={setCustomerFilterType}
                                    onSelectedCustomerChange={setSelectedCustomer}
                                    onCustomerRangeStartChange={setCustomerRangeStart}
                                    onCustomerRangeEndChange={setCustomerRangeEnd}
                                    onToggleCustomerSelection={toggleCustomerSelection}
                                    onBranchFilterTypeChange={setBranchFilterType}
                                    onSelectedBranchChange={setSelectedBranch}
                                    onBranchRangeStartChange={setBranchRangeStart}
                                    onBranchRangeEndChange={setBranchRangeEnd}
                                    onToggleBranchSelection={toggleBranchSelection}
                                    onDiffFilterChange={setDiffFilter}
                                    onSaleTypeChange={setSaleType}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 mb-6">
                        {error}
                    </div>
                )}

                {/* PDF Viewer */}
                {pdfUrl && (
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden h-[800px] animate-in fade-in slide-in-from-bottom-4">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                            <h3 className="font-medium text-slate-700">ตัวอย่างรายงาน</h3>
                            <a
                                href={pdfUrl}
                                download={`${REPORT_NAME}.pdf`}
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
        </main>
    );
}
