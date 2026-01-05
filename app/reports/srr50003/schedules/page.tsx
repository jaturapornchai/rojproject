'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SHOP_ID_PUBLIC } from '@/lib/constants';

// Shared modules
import {
    REPORT_ID,
    REPORT_NAME,
    DATE_PRESETS,
    DAYS_OF_WEEK,
    DEFAULT_SUMMARY_CONFIG,
    buildQuery,
    buildPdfConfig,
    calculateDateFromPreset,
    serializeFilters,
    deserializeFilters,
    type ReportFilters,
    type EmailSchedule
} from '@/lib/reports/srr50003';
import { useReportFilters, useMasterData } from '@/hooks/reports/srr50003';
import { FilterPanel, FilterSummary } from '@/components/reports/srr50003';

export default function ScheduleManagement() {
    const [schedules, setSchedules] = useState<EmailSchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showJson, setShowJson] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, schedule: EmailSchedule | null }>({ isOpen: false, schedule: null });
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [runningId, setRunningId] = useState<string | null>(null);
    const [showFilterPanel, setShowFilterPanel] = useState(false);

    const shopid = SHOP_ID_PUBLIC;

    // ใช้ shared hooks
    const { employees, branches } = useMasterData();
    const {
        filters,
        setEmployeeFilterType,
        setSelectedEmployee,
        setEmployeeRangeStart,
        setEmployeeRangeEnd,
        toggleEmployeeSelection,
        setBranchFilterType,
        setSelectedBranch,
        setBranchRangeStart,
        setBranchRangeEnd,
        toggleBranchSelection,
        setFilters,
        resetAllFilters
    } = useReportFilters();

    const [formData, setFormData] = useState({
        schedule_name: '',
        enabled: true,
        date_preset: 'today',
        days_of_week: [1, 2, 3, 4, 5],
        times: ['09:00'],
        timezone: 'Asia/Bangkok',
        recipients: [] as string[],
        cc_recipients: [] as string[],
        email_subject: 'รายงานสรุปยอดขายประจำวัน',
        include_pdf: true,
    });

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/rojproject/api/system/schedules/get-by-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shopid, report_id: REPORT_ID }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch schedules');
            }

            const rawSchedules = data.data || [];
            const mappedSchedules = rawSchedules.map((s: any) => ({
                id: s.id,
                shopid: s.shop_id,
                reportid: s.report_id,
                schedule_id: s.schedule_id,
                report_name: s.report_name,
                enabled: s.enabled,
                ...JSON.parse(s.schedule_pattern)
            }));
            setSchedules(mappedSchedules);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const schedule_id = editingId || ('schedule-' + Date.now());

            const { startDate, endDate } = calculateDateFromPreset(formData.date_preset);
            const query = buildQuery({ startDate, endDate, filters });
            const pdfConfig = buildPdfConfig('{{guid}}', startDate, endDate);

            const schedulePattern = {
                ...formData,
                filter_config: serializeFilters(filters),
                query_config: {
                    shopid,
                    limit: 5000,
                    query_items: [{
                        alias: "daily_sales_summary",
                        query: query,
                        summary_config: DEFAULT_SUMMARY_CONFIG
                    }]
                },
                pdf_config: pdfConfig,
            };

            const payload = {
                shop_id: shopid,
                report_id: REPORT_ID,
                schedule_id,
                report_name: REPORT_NAME,
                enabled: formData.enabled,
                schedule_pattern: JSON.stringify(schedulePattern),
                next_run_at: new Date().toISOString(),
                interval_minutes: 0
            };

            const response = await fetch('/rojproject/api/system/schedules/upsert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to save schedule');
            }

            resetForm();
            fetchSchedules();
            setSuccessMessage('บันทึกตารางส่งเรียบร้อยแล้ว');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleRunSchedule = (schedule: EmailSchedule) => {
        setConfirmModal({ isOpen: true, schedule });
    };

    const executeRunSchedule = async () => {
        const schedule = confirmModal.schedule;
        if (!schedule) return;

        setConfirmModal({ isOpen: false, schedule: null });
        setRunningId(schedule.schedule_id);
        setSuccessMessage(null);
        setError(null);

        try {
            const response = await fetch('/rojproject/api/process-schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shopid,
                    schedule_id: schedule.schedule_id
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to run schedule');
            }

            setSuccessMessage(`สำเร็จ: ${data.message} (GUID: ${data.guid})`);
            setTimeout(() => setSuccessMessage(null), 5000);

        } catch (err: any) {
            setError(`เกิดข้อผิดพลาด: ${err.message}`);
        } finally {
            setRunningId(null);
        }
    };

    const handleEdit = (schedule: EmailSchedule) => {
        setFormData({
            schedule_name: schedule.schedule_name,
            enabled: schedule.enabled,
            date_preset: schedule.date_preset,
            days_of_week: schedule.days_of_week,
            times: schedule.times,
            timezone: schedule.timezone,
            recipients: schedule.recipients,
            cc_recipients: schedule.cc_recipients || [],
            email_subject: schedule.email_subject,
            include_pdf: schedule.include_pdf,
        });

        // Load filter config ถ้ามี
        if (schedule.filter_config) {
            setFilters(deserializeFilters(schedule.filter_config));
        } else {
            resetAllFilters();
        }

        setEditingId(schedule.schedule_id);
        setShowForm(true);
    };

    const handleDelete = async (schedule_id: string) => {
        if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบตารางส่งนี้?')) {
            return;
        }

        try {
            const response = await fetch('/rojproject/api/system/schedules/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    schedule_id
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete schedule');
            }

            fetchSchedules();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const toggleEnabled = async (schedule: EmailSchedule) => {
        try {
            const schedulePattern = JSON.parse(JSON.stringify(schedule));
            delete schedulePattern.id;
            delete schedulePattern.shopid;
            delete schedulePattern.reportid;
            delete schedulePattern.schedule_id;
            delete schedulePattern.report_name;
            delete schedulePattern.enabled;

            const payload = {
                shop_id: shopid,
                report_id: REPORT_ID,
                schedule_id: schedule.schedule_id,
                report_name: REPORT_NAME,
                enabled: !schedule.enabled,
                schedule_pattern: JSON.stringify({
                    ...schedulePattern,
                    enabled: !schedule.enabled
                }),
                next_run_at: new Date().toISOString(),
                interval_minutes: 0
            };

            const response = await fetch('/rojproject/api/system/schedules/upsert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to toggle schedule');
            }

            fetchSchedules();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const generateGuid = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    const resetForm = () => {
        setFormData({
            schedule_name: '',
            enabled: true,
            date_preset: 'today',
            days_of_week: [1, 2, 3, 4, 5],
            times: ['09:00'],
            timezone: 'Asia/Bangkok',
            recipients: [],
            cc_recipients: [],
            email_subject: 'รายงานสรุปยอดขายประจำวัน',
            include_pdf: true,
        });
        resetAllFilters();
        setShowForm(false);
        setEditingId(null);
        setShowFilterPanel(false);
    };

    const toggleDayOfWeek = (day: number) => {
        const days = formData.days_of_week;
        if (days.includes(day)) {
            setFormData({ ...formData, days_of_week: days.filter(d => d !== day) });
        } else {
            setFormData({ ...formData, days_of_week: [...days, day].sort() });
        }
    };

    const addTime = () => {
        setFormData({ ...formData, times: [...formData.times, '09:00'] });
    };

    const updateTime = (index: number, value: string) => {
        const times = [...formData.times];
        times[index] = value;
        setFormData({ ...formData, times });
    };

    const removeTime = (index: number) => {
        setFormData({ ...formData, times: formData.times.filter((_, i) => i !== index) });
    };

    return (
        <main className="min-h-screen bg-slate-50 relative">
            {/* Success Message Toast */}
            {successMessage && (
                <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right-full duration-300">
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-emerald-600">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">{successMessage}</span>
                        <button onClick={() => setSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-700">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 text-amber-600">
                            <div className="p-2 bg-amber-100 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">ยืนยันการส่งอีเมล</h3>
                        </div>
                        <p className="text-slate-600">
                            คุณต้องการทดสอบส่งอีเมล &quot;{confirmModal.schedule?.schedule_name}&quot; ทันทีหรือไม่?
                        </p>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setConfirmModal({ isOpen: false, schedule: null })}
                                className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={executeRunSchedule}
                                className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors shadow-sm shadow-blue-200"
                            >
                                ยืนยันส่งทันที
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/reports/srr50003" className="text-slate-400 hover:text-emerald-600 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
                            </svg>
                        </Link>
                        <h1 className="text-lg font-semibold text-slate-800">ตารางการส่งอีเมล - {REPORT_ID}</h1>
                    </div>
                    <div className="flex gap-2 items-center">
                        <button
                            onClick={() => setShowJson(!showJson)}
                            className={"px-4 py-2 rounded-lg transition font-medium text-sm shadow-sm " + (showJson ? "bg-slate-200 text-slate-800" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50")}
                        >
                            {showJson ? 'ซ่อน JSON' : 'ดู JSON'}
                        </button>
                        <button
                            onClick={() => {
                                setFormData({
                                    schedule_name: generateGuid(),
                                    enabled: true,
                                    date_preset: 'today',
                                    days_of_week: [1, 2, 3, 4, 5],
                                    times: ['09:00'],
                                    timezone: 'Asia/Bangkok',
                                    recipients: [],
                                    cc_recipients: [],
                                    email_subject: 'รายงานสรุปยอดขายประจำวัน',
                                    include_pdf: true,
                                });
                                resetAllFilters();
                                setShowForm(true);
                            }}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium text-sm shadow-sm"
                        >
                            + เพิ่มตารางส่ง
                        </button>
                    </div>
                </div>
            </div>

            {/* JSON View */}
            {showJson && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="bg-slate-900 rounded-xl shadow-lg p-6 overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-slate-100 font-mono text-sm">Current Schedules Data (JSON)</h3>
                            <button
                                onClick={() => navigator.clipboard.writeText(JSON.stringify(schedules, null, 2))}
                                className="text-xs bg-slate-700 text-slate-300 px-3 py-1.5 rounded hover:bg-slate-600 transition"
                            >
                                Copy JSON
                            </button>
                        </div>
                        <pre className="text-xs font-mono text-emerald-400 overflow-auto max-h-96 bg-slate-950 p-4 rounded-lg">
                            {JSON.stringify(schedules, null, 2)}
                        </pre>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Form */}
                {showForm && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-6">
                            {editingId ? 'แก้ไขตารางส่งอีเมล' : 'เพิ่มตารางส่งอีเมลใหม่'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Schedule Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    ชื่อตารางส่ง
                                </label>
                                <input
                                    type="text"
                                    value={formData.schedule_name}
                                    onChange={(e) => setFormData({ ...formData, schedule_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    required
                                />
                            </div>

                            {/* Date Preset */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    ช่วงวันที่รายงาน
                                </label>
                                <select
                                    value={formData.date_preset}
                                    onChange={(e) => setFormData({ ...formData, date_preset: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                >
                                    {DATE_PRESETS.map(preset => (
                                        <option key={preset.value} value={preset.value}>
                                            {preset.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Report Filters Section */}
                            <div className="border-t border-slate-200 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowFilterPanel(!showFilterPanel)}
                                    className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 transition-transform ${showFilterPanel ? 'rotate-180' : ''}`}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                    </svg>
                                    🔍 ตัวกรองรายงาน (เงื่อนไขพนักงานขาย/สาขา)
                                </button>

                                {/* Filter Summary */}
                                <FilterSummary
                                    filters={filters}
                                    employees={employees}
                                    branches={branches}
                                    className="mt-2"
                                />

                                {showFilterPanel && (
                                    <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                        <FilterPanel
                                            filters={filters}
                                            employees={employees}
                                            branches={branches}
                                            onEmployeeFilterTypeChange={setEmployeeFilterType}
                                            onSelectedEmployeeChange={setSelectedEmployee}
                                            onEmployeeRangeStartChange={setEmployeeRangeStart}
                                            onEmployeeRangeEndChange={setEmployeeRangeEnd}
                                            onToggleEmployeeSelection={toggleEmployeeSelection}
                                            onBranchFilterTypeChange={setBranchFilterType}
                                            onSelectedBranchChange={setSelectedBranch}
                                            onBranchRangeStartChange={setBranchRangeStart}
                                            onBranchRangeEndChange={setBranchRangeEnd}
                                            onToggleBranchSelection={toggleBranchSelection}
                                            compact={true}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Days of Week */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    วันที่ต้องการส่ง
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {DAYS_OF_WEEK.map(day => (
                                        <button
                                            key={day.value}
                                            type="button"
                                            onClick={() => toggleDayOfWeek(day.value)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${formData.days_of_week.includes(day.value)
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                }`}
                                        >
                                            {day.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Times */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    เวลาที่ส่ง
                                </label>
                                <div className="space-y-2">
                                    {formData.times.map((time, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="time"
                                                value={time}
                                                onChange={(e) => updateTime(index, e.target.value)}
                                                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                            {formData.times.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeTime(index)}
                                                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                                                >
                                                    ลบ
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addTime}
                                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition text-sm"
                                    >
                                        + เพิ่มเวลา
                                    </button>
                                </div>
                            </div>

                            {/* Recipients */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    ผู้รับ (อีเมล) - แยกด้วยเครื่องหมายจุลภาค
                                </label>
                                <input
                                    type="text"
                                    value={formData.recipients.join(', ')}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        recipients: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                    })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="email1@example.com, email2@example.com"
                                    required
                                />
                            </div>

                            {/* CC Recipients */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    สำเนาถึง (CC) - แยกด้วยเครื่องหมายจุลภาค
                                </label>
                                <input
                                    type="text"
                                    value={formData.cc_recipients.join(', ')}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        cc_recipients: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                    })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="email1@example.com, email2@example.com"
                                />
                            </div>

                            {/* Email Subject */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    หัวข้ออีเมล
                                </label>
                                <input
                                    type="text"
                                    value={formData.email_subject}
                                    onChange={(e) => setFormData({ ...formData, email_subject: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    required
                                />
                            </div>

                            {/* Include PDF */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="include_pdf"
                                    checked={formData.include_pdf}
                                    onChange={(e) => setFormData({ ...formData, include_pdf: e.target.checked })}
                                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                                />
                                <label htmlFor="include_pdf" className="text-sm font-medium text-slate-700">
                                    แนบไฟล์ PDF ในอีเมล
                                </label>
                            </div>

                            {/* Enabled */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="enabled"
                                    checked={formData.enabled}
                                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                                />
                                <label htmlFor="enabled" className="text-sm font-medium text-slate-700">
                                    เปิดใช้งานตารางส่งนี้
                                </label>
                            </div>

                            {/* Form Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
                                >
                                    {editingId ? 'บันทึกการแก้ไข' : 'เพิ่มตารางส่ง'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-2.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition font-medium"
                                >
                                    ยกเลิก
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Schedules List */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200">
                        <h2 className="text-lg font-semibold text-slate-900">รายการตารางส่งอีเมล</h2>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-slate-500">กำลังโหลด...</div>
                    ) : schedules.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            ยังไม่มีตารางส่งอีเมล กรุณาเพิ่มตารางส่งใหม่
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-200">
                            {schedules.map((schedule) => (
                                <div key={schedule.schedule_id} className="p-6 hover:bg-slate-50 transition">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-slate-900">{schedule.schedule_name}</h3>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${schedule.enabled
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {schedule.enabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                                                </span>
                                            </div>
                                            <div className="space-y-1 text-sm text-slate-600">
                                                <p>📅 ช่วงวันที่: {DATE_PRESETS.find(p => p.value === schedule.date_preset)?.label || schedule.date_preset}</p>
                                                <p>📆 วัน: {schedule.days_of_week.map(d => DAYS_OF_WEEK.find(day => day.value === d)?.label).join(', ')}</p>
                                                <p>⏰ เวลา: {schedule.times.join(', ')}</p>
                                                <p>📧 ผู้รับ: {schedule.recipients.join(', ')}</p>
                                                {schedule.cc_recipients && schedule.cc_recipients.length > 0 && (
                                                    <p>📋 CC: {schedule.cc_recipients.join(', ')}</p>
                                                )}
                                            </div>
                                            {/* แสดง Filter Summary ถ้ามี */}
                                            {schedule.filter_config && (
                                                <div className="mt-2">
                                                    <FilterSummary
                                                        filters={deserializeFilters(schedule.filter_config)}
                                                        employees={employees}
                                                        branches={branches}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => handleRunSchedule(schedule)}
                                                disabled={runningId === schedule.schedule_id}
                                                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
                                            >
                                                {runningId === schedule.schedule_id ? 'กำลังส่ง...' : 'ส่งทันที'}
                                            </button>
                                            <button
                                                onClick={() => toggleEnabled(schedule)}
                                                className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
                                            >
                                                {schedule.enabled ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                                            </button>
                                            <button
                                                onClick={() => handleEdit(schedule)}
                                                className="px-3 py-1.5 text-sm bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition"
                                            >
                                                แก้ไข
                                            </button>
                                            <button
                                                onClick={() => handleDelete(schedule.schedule_id)}
                                                className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                                            >
                                                ลบ
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
