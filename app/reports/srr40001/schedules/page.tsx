'use client';

import EmailSelector from '@/components/EmailSelector';
import { SHOP_ID_PUBLIC } from '@/lib/constants';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const BASE_QUERY = `select 
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
    AND doc_date BETWEEN '{{start_date}}' AND '{{end_date}}'
    order by doc_date, doc_no`;

const DEFAULT_QUERY_CONFIG = {
    shopid: SHOP_ID_PUBLIC,
    query_items: [
        {
            alias: "inventory_list",
            query: BASE_QUERY,
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

const DEFAULT_PDF_CONFIG = {
    shopid: SHOP_ID_PUBLIC,
    pdf_config: {
        title: "รายงานวิเคราะห์ขายขาดทุนแสดงรายละเอียดสินค้า (SRR40001)",
        description: "ตั้งแต่วันที่ {{thai_start_date}} ถึงวันที่ {{thai_end_date}}",
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
                row_spacing: 1.0,
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

interface EmailSchedule {
    schedule_id: string;
    schedule_name: string;
    enabled: boolean;
    date_preset: string;
    days_of_week: number[];
    times: string[];
    timezone: string;
    recipients: string[];
    cc_recipients: string[];
    email_subject: string;
    include_pdf: boolean;
    query_config?: any;
    pdf_config?: any;
    created_at?: string;
    updated_at?: string;
}

const DATE_PRESETS = [
    { value: 'today', label: 'วันนี้' },
    { value: 'yesterday', label: 'เมื่อวานนี้' },
    { value: 'this_week', label: 'สัปดาห์นี้' },
    { value: 'last_week', label: 'สัปดาห์ก่อน' },
    { value: 'this_month', label: 'เดือนนี้' },
    { value: 'last_month', label: 'เดือนก่อน' },
    { value: 'this_year', label: 'ปีนี้' },
    { value: 'last_year', label: 'ปีก่อน' },
];

const DAYS_OF_WEEK = [
    { value: 0, label: 'อาทิตย์' },
    { value: 1, label: 'จันทร์' },
    { value: 2, label: 'อังคาร' },
    { value: 3, label: 'พุธ' },
    { value: 4, label: 'พฤหัสบดี' },
    { value: 5, label: 'ศุกร์' },
    { value: 6, label: 'เสาร์' },
];

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

    const shopid = SHOP_ID_PUBLIC;
    const reportid = 'SRR40001';

    const [formData, setFormData] = useState<Partial<EmailSchedule>>({
        schedule_name: '',
        enabled: true,
        date_preset: 'today',
        days_of_week: [1, 2, 3, 4, 5],
        times: ['09:00'],
        timezone: 'Asia/Bangkok',
        recipients: [],
        cc_recipients: [],
        email_subject: 'รายงานวิเคราะห์ขายขาดทุนประจำวัน',
        include_pdf: true,
        query_config: DEFAULT_QUERY_CONFIG,
        pdf_config: DEFAULT_PDF_CONFIG,
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
                body: JSON.stringify({ shopid, reportid }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch schedules');
            }

            const parsedSchedules = (data.data || []).map((item: any) => {
                try {
                    const pattern = JSON.parse(item.schedule_pattern);
                    return {
                        ...pattern,
                        schedule_id: item.schedule_id,
                        schedule_name: item.schedule_name,
                    };
                } catch (e) {
                    return item;
                }
            });

            setSchedules(parsedSchedules);
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
            const now = new Date().toISOString();
            const schedule_id = editingId || ('schedule-' + Date.now());

            const scheduleData = {
                shopid,
                reportid,
                schedule_id,
                report_name: 'รายงานวิเคราะห์ขายขาดทุนแสดงรายละเอียดสินค้า',
                ...formData,
                created_at: editingId ? undefined : now,
                updated_at: now,
            };

            const payload = {
                schedule_id,
                schedule_name: formData.schedule_name,
                shop_id: shopid,
                report_id: reportid,
                schedule_pattern: JSON.stringify(scheduleData),
                next_run_at: new Date(), // This should be calculated properly but for now let's set it to now
                interval_minutes: 0,
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

            // Auto dismiss success message
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
            cc_recipients: schedule.cc_recipients,
            email_subject: schedule.email_subject,
            include_pdf: schedule.include_pdf,
            query_config: schedule.query_config || DEFAULT_QUERY_CONFIG,
            pdf_config: schedule.pdf_config || DEFAULT_PDF_CONFIG,
        });
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
                body: JSON.stringify({ schedule_id }),
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
            const updatedSchedule = {
                ...schedule,
                enabled: !schedule.enabled,
                updated_at: new Date().toISOString(),
            };

            const payload = {
                schedule_id: schedule.schedule_id,
                schedule_name: schedule.schedule_name,
                shop_id: shopid,
                report_id: reportid,
                schedule_pattern: JSON.stringify(updatedSchedule),
                next_run_at: new Date(),
                interval_minutes: 0,
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
            schedule_name: generateGuid(),
            enabled: true,
            date_preset: 'today',
            days_of_week: [1, 2, 3, 4, 5],
            times: ['09:00'],
            timezone: 'Asia/Bangkok',
            recipients: [],
            cc_recipients: [],
            email_subject: 'รายงานวิเคราะห์ขายขาดทุนประจำวัน',
            include_pdf: true,
            query_config: DEFAULT_QUERY_CONFIG,
            pdf_config: DEFAULT_PDF_CONFIG,
        });
        setShowForm(false);
        setEditingId(null);
    };

    const toggleDayOfWeek = (day: number) => {
        const days = formData.days_of_week || [];
        if (days.includes(day)) {
            setFormData({ ...formData, days_of_week: days.filter(d => d !== day) });
        } else {
            setFormData({ ...formData, days_of_week: [...days, day].sort() });
        }
    };

    const addTime = () => {
        const times = formData.times || [];
        setFormData({ ...formData, times: [...times, '09:00'] });
    };

    const updateTime = (index: number, value: string) => {
        const times = [...(formData.times || [])];
        times[index] = value;
        setFormData({ ...formData, times });
    };

    const removeTime = (index: number) => {
        const times = formData.times || [];
        setFormData({ ...formData, times: times.filter((_, i) => i !== index) });
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
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">ยืนยันการส่งอีเมล</h3>
                        </div>
                        <p className="text-slate-600">
                            คุณต้องการทดสอบส่งอีเมล "{confirmModal.schedule?.schedule_name}" ทันทีหรือไม่?
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
                        <Link href="/reports/srr40001" className="text-slate-400 hover:text-emerald-600 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                        </Link>
                        <h1 className="text-lg font-semibold text-slate-800">ตารางการส่งอีเมล - SRR40001</h1>
                    </div>
                    <div className="flex gap-2 items-center">
                        <button
                            onClick={() => setShowJson(!showJson)}
                            className={"px-4 py-2 rounded-lg transition font-medium text-sm shadow-sm " + (showJson ? "bg-slate-200 text-slate-800" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50")}
                        >
                            {showJson ? 'ซ่อน JSON' : 'แสดง JSON'}
                        </button>
                        <button
                            onClick={() => {
                                resetForm();
                                setShowForm(!showForm);
                            }}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium text-sm shadow-sm"
                        >
                            {showForm ? 'ยกเลิก' : '+ เพิ่มตารางส่ง'}
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
                                onClick={() => {
                                    navigator.clipboard.writeText(JSON.stringify(schedules, null, 2));
                                    alert('Copied to clipboard!');
                                }}
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
                            {editingId ? 'แก้ไขตารางส่ง' : 'สร้างตารางส่งใหม่'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        ชื่อตารางส่ง <span className="text-red-500">*</span> (สร้างอัตโนมัติ)
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        readOnly
                                        value={formData.schedule_name}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none bg-slate-100 text-slate-500 cursor-not-allowed"
                                        placeholder="Auto-generated GUID"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        หัวข้ออีเมล <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.email_subject}
                                        onChange={(e) => setFormData({ ...formData, email_subject: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-black"
                                        placeholder="รายงานวิเคราะห์ขายขาดทุน"
                                    />
                                </div>
                            </div>

                            {/* Date Preset */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    ช่วงเวลาข้อมูล <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {DATE_PRESETS.map(preset => (
                                        <button
                                            key={preset.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, date_preset: preset.value })}
                                            className={"px-4 py-2 rounded-lg border text-sm font-medium transition-colors " + (formData.date_preset === preset.value ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-700 border-slate-300 hover:border-emerald-400")}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Days of Week */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    วันที่ส่ง <span className="text-red-500">*</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {DAYS_OF_WEEK.map(day => (
                                        <button
                                            key={day.value}
                                            type="button"
                                            onClick={() => toggleDayOfWeek(day.value)}
                                            className={"px-4 py-2 rounded-lg border text-sm font-medium transition-colors " + ((formData.days_of_week || []).includes(day.value) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-300 hover:border-blue-400")}
                                        >
                                            {day.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Times */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    เวลาที่ส่ง <span className="text-red-500">*</span>
                                </label>
                                <div className="space-y-2">
                                    {(formData.times || []).map((time, index) => (
                                        <div key={index} className="flex gap-2">
                                            {/* Time Options Generator - Split Hour/Minute */}
                                            {(() => {
                                                const [h, m] = time.split(':');
                                                const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
                                                const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

                                                return (
                                                    <div className="flex items-center gap-1">
                                                        <select
                                                            value={h}
                                                            onChange={(e) => updateTime(index, `${e.target.value}:${m}`)}
                                                            className="px-2 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-black bg-white"
                                                        >
                                                            {hours.map(hour => (
                                                                <option key={hour} value={hour}>{hour}</option>
                                                            ))}
                                                        </select>
                                                        <span className="text-slate-500 font-bold">:</span>
                                                        <select
                                                            value={m}
                                                            onChange={(e) => updateTime(index, `${h}:${e.target.value}`)}
                                                            className="px-2 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-black bg-white"
                                                        >
                                                            {minutes.map(minute => (
                                                                <option key={minute} value={minute}>{minute}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                );
                                            })()}
                                            {(formData.times || []).length > 1 && (
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
                                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition text-sm font-medium"
                                    >
                                        + เพิ่มเวลา
                                    </button>
                                </div>
                            </div>

                            {/* Recipients */}
                            <EmailSelector
                                label="ผู้รับ (ถึง)"
                                selectedEmails={formData.recipients || []}
                                onChange={(emails) => setFormData({ ...formData, recipients: emails })}
                                placeholder="เลือกผู้รับ..."
                            />

                            {/* CC Recipients */}
                            <EmailSelector
                                label="ผู้รับสำเนา (CC)"
                                selectedEmails={formData.cc_recipients || []}
                                onChange={(emails) => setFormData({ ...formData, cc_recipients: emails })}
                                placeholder="เลือกผู้รับสำเนา..."
                            />

                            {/* Options */}
                            <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.enabled}
                                        onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                                        className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                                    />
                                    <span className="text-sm text-slate-700">เปิดใช้งาน</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.include_pdf}
                                        onChange={(e) => setFormData({ ...formData, include_pdf: e.target.checked })}
                                        className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                                    />
                                    <span className="text-sm text-slate-700">แนบไฟล์ PDF</span>
                                </label>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
                                >
                                    {editingId ? 'อัปเดตตารางส่ง' : 'สร้างตารางส่ง'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium"
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
                        <h2 className="text-lg font-semibold text-slate-900">รายการตารางส่งรายงาน</h2>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-slate-500">กำลังโหลดตารางส่ง...</div>
                    ) : schedules.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            ยังไม่มีตารางส่ง สร้างตารางส่งรายงานอัตโนมัติแรกของคุณ!
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-200">
                            {schedules.map((schedule) => (
                                <div key={schedule.schedule_id} className="p-6 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-slate-900">{schedule.schedule_name}</h3>
                                                <button
                                                    onClick={() => toggleEnabled(schedule)}
                                                    className={"px-2.5 py-1 rounded-full text-xs font-medium " + (schedule.enabled ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600")}
                                                >
                                                    {schedule.enabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                                                </button>
                                            </div>
                                            <div className="space-y-1 text-sm text-slate-600">
                                                <p>📅 <strong>ช่วงเวลา:</strong> {DATE_PRESETS.find(p => p.value === schedule.date_preset)?.label}</p>
                                                <p>📆 <strong>วัน:</strong> {schedule.days_of_week.map(d => DAYS_OF_WEEK.find(day => day.value === d)?.label).join(', ')}</p>
                                                <p>🕐 <strong>เวลา:</strong> {schedule.times.join(', ')}</p>
                                                <p>📧 <strong>ถึง:</strong> {schedule.recipients.join(', ')}</p>
                                                {schedule.cc_recipients.length > 0 && (
                                                    <p>📧 <strong>สำเนา:</strong> {schedule.cc_recipients.join(', ')}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => handleRunSchedule(schedule)}
                                                disabled={runningId === schedule.schedule_id}
                                                className={"px-3 py-1.5 text-sm font-medium rounded-lg transition " + (runningId === schedule.schedule_id ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "text-purple-600 hover:bg-purple-50")}
                                            >
                                                {runningId === schedule.schedule_id ? 'Sending...' : 'ทดสอบส่ง Email'}
                                            </button>
                                            <button
                                                onClick={() => handleEdit(schedule)}
                                                className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                            >
                                                แก้ไข
                                            </button>
                                            <button
                                                onClick={() => handleDelete(schedule.schedule_id)}
                                                className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
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
