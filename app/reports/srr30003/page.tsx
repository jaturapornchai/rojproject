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
} from '@/lib/reports/srr30003';

import {
    useReportFilters,
    useDateRange,
    useMasterData
} from '@/hooks/reports/srr30003';

import {
    FilterPanel,
    DatePresetButtons,
    MonthYearSelector,
    FilterSummary
} from '@/components/reports/srr30003';

interface ReportLog {
    username: string;
    details: string;
    created_at: string;
}

export default function ReportSRR30003() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [logs, setLogs] = useState<ReportLog[]>([]);

    // Use Custom Hooks
    const {
        startDate,
        endDate,
        setStartDate,
        setEndDate,
        handlePreset,
        handleMonthSelect,
        handleYearSelect
    } = useDateRange({ defaultPreset: 'this_month' });

    const {
        documents,
        products,
        productGroups,
        productBrands,
        warehouses,
        shelves,
        loading: masterDataLoading,
        documentsLoading,
        productsLoading,
        productGroupsLoading,
        productBrandsLoading,
        warehousesLoading,
        shelvesLoading,
        documentsHasMore,
        productsHasMore,
        productGroupsHasMore,
        productBrandsHasMore,
        warehousesHasMore,
        shelvesHasMore,
        searchDocuments,
        searchProducts,
        searchProductGroups,
        searchProductBrands,
        searchWarehouses,
        searchShelves,
        loadMoreDocuments,
        loadMoreProducts,
        loadMoreProductGroups,
        loadMoreProductBrands,
        loadMoreWarehouses,
        loadMoreShelves,
    } = useMasterData();

    const {
        filters,
        setDocumentFilterType,
        setSelectedDocument,
        setDocumentRangeStart,
        setDocumentRangeEnd,
        toggleDocumentSelection,
        setProductFilterType,
        setSelectedProduct,
        setProductRangeStart,
        setProductRangeEnd,
        toggleProductSelection,
        setProductGroupFilterType,
        setSelectedProductGroup,
        setProductGroupRangeStart,
        setProductGroupRangeEnd,
        toggleProductGroupSelection,
        setProductBrandFilterType,
        setSelectedProductBrand,
        setProductBrandRangeStart,
        setProductBrandRangeEnd,
        toggleProductBrandSelection,
        setWarehouseFilterType,
        setSelectedWarehouse,
        setWarehouseRangeStart,
        setWarehouseRangeEnd,
        toggleWarehouseSelection,
        setShelfFilterType,
        setSelectedShelf,
        setShelfRangeStart,
        setShelfRangeEnd,
        toggleShelfSelection,
        resetAllFilters
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

    // Auth check
    useEffect(() => {
        if (status === 'loading') return;
        if (!session) {
            router.push('/rojproject/login');
            return;
        }

        const isAdmin = session?.user?.isAdmin;
        const allowedReports = session?.user?.allowed_reports || [];
        const hasAccess = isAdmin || allowedReports.includes(REPORT_ID);

        if (!hasAccess) {
            router.push('/');
            return;
        }

        fetchLogs();
    }, [session, status, router]);

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

            // Build query using shared query builder
            const query = buildQuery({ startDate, endDate, filters });

            const requestPayload = {
                shopid: SHOP_ID_PUBLIC,
                limit: 5000,
                query_items: [{
                    alias: 'report_data',
                    query: query
                }]
            };

            // Generate Report
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

            // Log query result
            console.log('=== PostgreSQL Query Result ===');
            console.log('Success:', reportData.success);
            console.log('GUID:', reportData.guid);
            console.log('Detail Row Count:', reportData.detailRowCount);
            console.log('Full Data:', JSON.stringify(reportData.data, null, 2));
            console.log('==============================');

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
            // Ensure dates are valid
            if (!startDate || !endDate) {
                throw new Error('วันที่ไม่ถูกต้อง');
            }

            // Build PDF config using shared builder
            const pdfConfig = buildPdfConfig(guid, startDate, endDate);

            // Log PDF config before sending to API
            console.log('[generatePDF] Sending PDF config:', JSON.stringify(pdfConfig, null, 2));

            const pdfRes = await fetch('/rojproject/api/get-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pdfConfig),
            });

            if (!pdfRes.ok) {
                // Try to get error details from API
                const contentType = pdfRes.headers.get('content-type');
                if (contentType?.includes('application/json')) {
                    const errorData = await pdfRes.json();
                    console.error('[generatePDF] API Error:', errorData);
                    throw new Error(errorData.error || errorData.details || 'ไม่สามารถสร้าง PDF ได้');
                }
                throw new Error(`ไม่สามารถสร้าง PDF ได้ (${pdfRes.status})`);
            }

            const pdfBlob = await pdfRes.blob();
            const url = URL.createObjectURL(pdfBlob);
            setPdfUrl(url);

        } catch (error: any) {
            console.error('PDF Error:', error);
            setError(error.message || 'เกิดข้อผิดพลาดในการสร้าง PDF');
        }
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
                            <h1 className="text-xl font-bold text-slate-900">{REPORT_NAME}</h1>
                            <p className="text-xs text-slate-500">{REPORT_ID}</p>
                        </div>
                    </div>
                    <Link
                        href="/reports/srr30003/schedules"
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
                    {/* Date Presets */}
                    <DatePresetButtons onPresetSelect={handlePreset} />

                    {/* Date Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700">ตั้งแต่วันที่</label>
                            <ThaiDatePicker value={startDate} onChange={setStartDate} />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700">ถึงวันที่</label>
                            <ThaiDatePicker value={endDate} onChange={setEndDate} />
                        </div>
                        <div className="lg:col-span-2 flex items-end">
                            <button
                                onClick={handleGenerateResult}
                                disabled={loading || !startDate || !endDate}
                                className="w-full bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2"
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

                    {/* Advanced Options Toggle */}
                    <div className="pt-4 border-t border-slate-100">
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="flex items-center gap-2 text-sm text-slate-900 hover:text-emerald-600 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                            ตัวเลือกเพิ่มเติม (กรองข้อมูล)
                        </button>

                        {showAdvanced && (
                            <div className="mt-4 space-y-6 animate-in fade-in slide-in-from-top-2">
                                {/* Month/Year Selector */}
                                <MonthYearSelector
                                    onMonthSelect={handleMonthSelect}
                                    onYearSelect={handleYearSelect}
                                />

                                {/* Filter Summary */}
                                <FilterSummary
                                    filters={filters}
                                    documents={documents}
                                    products={products}
                                    productGroups={productGroups}
                                    productBrands={productBrands}
                                    warehouses={warehouses}
                                    shelves={shelves}
                                    className="pt-4 border-t border-slate-100"
                                />

                                {/* Filter Panel */}
                                <div className="pt-4 border-t border-slate-100">
                                    <FilterPanel
                                        filters={filters}
                                        documents={documents}
                                        products={products}
                                        productGroups={productGroups}
                                        productBrands={productBrands}
                                        warehouses={warehouses}
                                        shelves={shelves}
                                        documentsLoading={documentsLoading}
                                        productsLoading={productsLoading}
                                        productGroupsLoading={productGroupsLoading}
                                        productBrandsLoading={productBrandsLoading}
                                        warehousesLoading={warehousesLoading}
                                        shelvesLoading={shelvesLoading}
                                        documentsHasMore={documentsHasMore}
                                        productsHasMore={productsHasMore}
                                        productGroupsHasMore={productGroupsHasMore}
                                        productBrandsHasMore={productBrandsHasMore}
                                        warehousesHasMore={warehousesHasMore}
                                        shelvesHasMore={shelvesHasMore}
                                        onDocumentSearch={searchDocuments}
                                        onProductSearch={searchProducts}
                                        onProductGroupSearch={searchProductGroups}
                                        onProductBrandSearch={searchProductBrands}
                                        onWarehouseSearch={searchWarehouses}
                                        onShelfSearch={searchShelves}
                                        onLoadMoreDocuments={loadMoreDocuments}
                                        onLoadMoreProducts={loadMoreProducts}
                                        onLoadMoreProductGroups={loadMoreProductGroups}
                                        onLoadMoreProductBrands={loadMoreProductBrands}
                                        onLoadMoreWarehouses={loadMoreWarehouses}
                                        onLoadMoreShelves={loadMoreShelves}
                                        onDocumentFilterTypeChange={setDocumentFilterType}
                                        onSelectedDocumentChange={setSelectedDocument}
                                        onDocumentRangeStartChange={setDocumentRangeStart}
                                        onDocumentRangeEndChange={setDocumentRangeEnd}
                                        onToggleDocumentSelection={toggleDocumentSelection}
                                        onProductFilterTypeChange={setProductFilterType}
                                        onSelectedProductChange={setSelectedProduct}
                                        onProductRangeStartChange={setProductRangeStart}
                                        onProductRangeEndChange={setProductRangeEnd}
                                        onToggleProductSelection={toggleProductSelection}
                                        onProductGroupFilterTypeChange={setProductGroupFilterType}
                                        onSelectedProductGroupChange={setSelectedProductGroup}
                                        onProductGroupRangeStartChange={setProductGroupRangeStart}
                                        onProductGroupRangeEndChange={setProductGroupRangeEnd}
                                        onToggleProductGroupSelection={toggleProductGroupSelection}
                                        onProductBrandFilterTypeChange={setProductBrandFilterType}
                                        onSelectedProductBrandChange={setSelectedProductBrand}
                                        onProductBrandRangeStartChange={setProductBrandRangeStart}
                                        onProductBrandRangeEndChange={setProductBrandRangeEnd}
                                        onToggleProductBrandSelection={toggleProductBrandSelection}
                                        onWarehouseFilterTypeChange={setWarehouseFilterType}
                                        onSelectedWarehouseChange={setSelectedWarehouse}
                                        onWarehouseRangeStartChange={setWarehouseRangeStart}
                                        onWarehouseRangeEndChange={setWarehouseRangeEnd}
                                        onToggleWarehouseSelection={toggleWarehouseSelection}
                                        onShelfFilterTypeChange={setShelfFilterType}
                                        onSelectedShelfChange={setSelectedShelf}
                                        onShelfRangeStartChange={setShelfRangeStart}
                                        onShelfRangeEndChange={setShelfRangeEnd}
                                        onToggleShelfSelection={toggleShelfSelection}
                                    />
                                </div>

                                {/* Reset Filters Button */}
                                <div className="pt-4 border-t border-slate-100">
                                    <button
                                        onClick={resetAllFilters}
                                        className="px-4 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        🔄 รีเซ็ตตัวกรองทั้งหมด
                                    </button>
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

                {/* PDF Viewer */}
                {pdfUrl && (
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden h-[800px] animate-in fade-in slide-in-from-bottom-4">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                            <h3 className="font-medium text-slate-700">ตัวอย่างรายงาน</h3>
                            <a
                                href={pdfUrl}
                                download="รายงานเปรียบเทียบต้นทุนการซื้อล่าสุด.pdf"
                                className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
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
