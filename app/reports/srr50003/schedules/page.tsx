'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SHOP_ID_PUBLIC } from '@/lib/constants';

const BASE_QUERY = `SELECT 
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
       select doc_date,pos_id,cashier_code,(select name_1 from erp_user where code=cashier_code) as cashier_name
       
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

       from  ic_trans where trans_flag = 44 and last_status = 0 and doc_date between '{{start_date}}' and '{{end_date}}'   ) t
GROUP BY doc_date,pos_id,cashier_code order by doc_date,pos_id,cashier_code`;

console.log('[SRR50003 Schedules] BASE_QUERY:', BASE_QUERY);

const DEFAULT_QUERY_CONFIG = {
    shopid: SHOP_ID_PUBLIC,
    query_items: [
        {
            alias: "daily_sales_summary",
            query: BASE_QUERY,
            summary_config: {
                levels: [
                    {
                        group_by_fields: ["doc_date"],
                        sum_fields: ["total_cash", "total_wallet", "total_card", "total_amount", "total_1", "total_2", "total_3", "total_s", "total_d"],
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
        title: "รายงานสรุปยอดขายประจำวัน (SRR50003)",
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
                row_spacing: 0,
                column_spacing: 2,
                grid_color: "#CCCCCC"
            }
        },
        sections: [
            {
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
            }
        ],
        column_schema: {
            "doc_date": { label: "เอกสารวันที่", flex: 10, align: "L", data_type: "date", format: "dd/MM/yyyy", use_buddhist_year: true },
            "pos_id": { label: "ประเภทการขาย", flex: 12, align: "L", hide_when_summary: true },
            "cashier_name": { label: "พนักงานขาย", flex: 15, align: "L", hide_when_summary: true },
            "total_cash": { label: "POS ขายเงินสด", flex: 12, align: "R", data_type: "number", format: "#,##0.00" },
            "total_wallet": { label: "POS ขาย Wallet", flex: 12, align: "R", data_type: "number", format: "#,##0.00" },
            "total_card": { label: "POS ขายเงินเชื่อ", flex: 12, align: "R", data_type: "number", format: "#,##0.00" },
            "total_amount": { label: "POS ยอดเงินรวม", flex: 12, align: "R", data_type: "number", format: "#,##0.00" },
            "total_1": { label: "ขายเงินสด", flex: 12, align: "R", data_type: "number", format: "#,##0.00" },
            "total_2": { label: "ขายเงินเชื่อ", flex: 12, align: "R", data_type: "number", format: "#,##0.00" },
            "total_3": { label: "รวมขาย", flex: 12, align: "R", data_type: "number", format: "#,##0.00" },
            "total_s": { label: "ยอดขายสุทธิ", flex: 12, align: "R", data_type: "number", format: "#,##0.00" }
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
    const reportid = 'SRR50003';

    const [formData, setFormData] = useState<Partial<EmailSchedule>>({
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
            const response = await fetch('/api/mongodb/get', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    collection: 'email_schedules',
                    filter: { shopid, reportid },
                    sort: { created_at: -1 },
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch schedules');
            }

            setSchedules(data.data || []);
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

            const payload = {
                collection: 'email_schedules',
                filter: { shopid, reportid, schedule_id },
                data: {
                    shopid,
                    reportid,
                    schedule_id,
                    report_name: 'รายงานสรุปยอดขายประจำวัน',
                    ...formData,
                    created_at: editingId ? undefined : now,
                    updated_at: now,
                },
                upsert: true,
            };

            const response = await fetch('/api/mongodb/update', {
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
            const response = await fetch('/api/process-schedule', {
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
            const response = await fetch('/api/mongodb/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    collection: 'email_schedules',
                    filter: { shopid, reportid, schedule_id },
                    delete_many: false,
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
            const response = await fetch('/api/mongodb/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    collection: 'email_schedules',
                    filter: { shopid, reportid, schedule_id: schedule.schedule_id },
                    data: {
                        enabled: !schedule.enabled,
                        updated_at: new Date().toISOString(),
                    },
                    upsert: false,
                }),
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
            email_subject: 'รายงานสรุปยอดขายประจำวัน',
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
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
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
                        <Link href="/reports/srr50003" className="text-slate-400 hover:text-emerald-600 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
                            </svg>
                        </Link>
                        <h1 className="text-lg font-semibold text-slate-800">ตารางการส่งอีเมล - SRR50003</h1>
                    </div>
                    <div className="flex gap-2 items-center">
                        <button
                            onClick={() => setShowJson(!showJson)}
                            className={"px-4 py-2 rounded-lg transition font-medium text-sm shadow-sm " + (showJson ? "bg-slate-200 text-slate-800" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50")}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 inline mr-1">
                                <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                                <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
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
                                    query_config: DEFAULT_QUERY_CONFIG,
                                    pdf_config: DEFAULT_PDF_CONFIG,
                                });
                                setShowForm(true);
                            }}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium text-sm shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 inline mr-1">
                                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                            </svg>
                            เพิ่มตารางส่ง
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
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${(formData.days_of_week || []).includes(day.value)
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
                                    {(formData.times || []).map((time, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="time"
                                                value={time}
                                                onChange={(e) => updateTime(index, e.target.value)}
                                                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
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
                                    value={(formData.recipients || []).join(', ')}
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
                                    value={(formData.cc_recipients || []).join(', ')}
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
                                                <p>📅 ช่วงวันที่: {DATE_PRESETS.find(p => p.value === schedule.date_preset)?.label}</p>
                                                <p>📆 วัน: {schedule.days_of_week.map(d => DAYS_OF_WEEK.find(day => day.value === d)?.label).join(', ')}</p>
                                                <p>⏰ เวลา: {schedule.times.join(', ')}</p>
                                                <p>📧 ผู้รับ: {schedule.recipients.join(', ')}</p>
                                                {schedule.cc_recipients && schedule.cc_recipients.length > 0 && (
                                                    <p>📋 CC: {schedule.cc_recipients.join(', ')}</p>
                                                )}
                                            </div>
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
