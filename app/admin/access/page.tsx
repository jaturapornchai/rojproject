'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import { SHOP_ID_PUBLIC } from '@/lib/constants';

interface AllowedUser {
    email: string;
    role: 'admin' | 'user';
    is_active?: boolean;
    allowed_reports?: string[];
    created_at?: string;
    updated_at?: string;
}

interface FormState {
    email: string;
    role: 'admin' | 'user';
    is_active: boolean;
    allowed_reports: string[];
}

const defaultFormState: FormState = {
    email: '',
    role: 'user',
    is_active: true,
    allowed_reports: [],
};

export default function AccessManagementPage() {
    const { data: session, status } = useSession();
    const isAdmin = session?.user?.isAdmin;
    const [users, setUsers] = useState<AllowedUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [formState, setFormState] = useState<FormState>(defaultFormState);
    const [editingUser, setEditingUser] = useState<AllowedUser | null>(null);
    const shopId = SHOP_ID_PUBLIC;

    const AVAILABLE_REPORTS = [
        { id: 'SRR40001', name: 'รายงานวิเคราะห์ขายขาดทุน (SRR40001)' },
    ];

    const adminCount = useMemo(() => users.filter((user) => user.role === 'admin').length, [users]);
    const activeCount = useMemo(() => users.filter((user) => user.is_active !== false).length, [users]);

    useEffect(() => {
        if (!isAdmin) return;
        void fetchUsers();
    }, [isAdmin]);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/mongodb/get', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    collection: 'user_access',
                    filter: { shopid: shopId },
                    sort: { updated_at: -1 },
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'ไม่สามารถดึงข้อมูลสิทธิ์ผู้ใช้ได้');
            }

            const list = Array.isArray(data.data) ? data.data : [];
            setUsers(list as AllowedUser[]);
        } catch (err: any) {
            setError(err.message || 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (record: AllowedUser) => {
        setEditingUser(record);
        setFormState({
            email: record.email,
            role: (record.role ?? 'user'),
            is_active: record.is_active !== false,
            allowed_reports: record.allowed_reports || [],
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setEditingUser(null);
        setFormState(defaultFormState);
        setShowForm(false);
    };

    const toggleReport = (reportId: string) => {
        const current = formState.allowed_reports || [];
        if (current.includes(reportId)) {
            setFormState({ ...formState, allowed_reports: current.filter(id => id !== reportId) });
        } else {
            setFormState({ ...formState, allowed_reports: [...current, reportId] });
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        const normalizedEmail = formState.email.trim().toLowerCase();
        if (!normalizedEmail) {
            setError('กรุณาระบุอีเมล');
            return;
        }

        try {
            const now = new Date().toISOString();
            const payload = {
                collection: 'user_access',
                filter: { shopid: shopId, email: normalizedEmail },
                data: {
                    shopid: shopId,
                    email: normalizedEmail,
                    role: formState.role,
                    is_admin: formState.role === 'admin',
                    is_active: formState.is_active,
                    allowed_reports: formState.allowed_reports,
                    created_at: editingUser?.created_at ?? now,
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
                throw new Error(data.error || 'ไม่สามารถบันทึกข้อมูลได้');
            }

            await fetchUsers();
            resetForm();
        } catch (err: any) {
            setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    const handleToggleActive = async (record: AllowedUser, nextActive: boolean) => {
        try {
            const now = new Date().toISOString();
            const response = await fetch('/api/mongodb/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    collection: 'user_access',
                    filter: { shopid: shopId, email: record.email },
                    data: {
                        is_active: nextActive,
                        updated_at: now,
                    },
                    upsert: false,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'ไม่สามารถอัปเดตสถานะได้');
            }

            await fetchUsers();
        } catch (err: any) {
            setError(err.message || 'เกิดข้อผิดพลาดในการอัปเดตสถานะ');
        }
    };

    const handleDelete = async (record: AllowedUser) => {
        if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสิทธิ์ของ ${record.email}?`)) {
            return;
        }

        try {
            const response = await fetch('/api/mongodb/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    collection: 'user_access',
                    filter: { shopid: shopId, email: record.email },
                    delete_many: false,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'ไม่สามารถลบข้อมูลได้');
            }

            await fetchUsers();
        } catch (err: any) {
            setError(err.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
        }
    };

    if (status === 'loading') {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500 text-sm">กำลังตรวจสอบสิทธิ์...</div>
            </main>
        );
    }

    if (!isAdmin) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 max-w-md text-center space-y-4">
                    <h1 className="text-xl font-semibold text-gray-900">ไม่มีสิทธิ์เข้าถึง</h1>
                    <p className="text-gray-600 text-sm">เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถจัดการสิทธิ์ผู้ใช้ได้</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                    >
                        กลับสู่หน้าหลัก
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 font-sans">
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 -ml-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">จัดการสิทธิ์ผู้ใช้งาน</h1>
                            <p className="text-xs text-gray-500">กำหนดรายชื่อผู้ที่สามารถเข้าสู่ระบบ</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            if (showForm) {
                                resetForm();
                                return;
                            }
                            setShowForm(true);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium text-sm shadow-sm ${showForm
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md'
                            }`}
                    >
                        {showForm ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                ปิดฟอร์ม
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                เพิ่มสิทธิ์ใหม่
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                        {error}
                    </div>
                )}

                {showForm && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-900">{editingUser ? 'แก้ไขสิทธิ์ผู้ใช้' : 'เพิ่มสิทธิ์ผู้ใช้ใหม่'}</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700">อีเมล <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    required
                                    value={formState.email}
                                    onChange={(event) => setFormState({ ...formState, email: event.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-black"
                                    placeholder="user@example.com"
                                    disabled={Boolean(editingUser)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">บทบาท</label>
                                <select
                                    value={formState.role}
                                    onChange={(event) => setFormState({ ...formState, role: event.target.value as 'admin' | 'user' })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-black"
                                >
                                    <option value="user">ผู้ใช้งานทั่วไป</option>
                                    <option value="admin">ผู้ดูแลระบบ</option>
                                </select>
                            </div>

                            {/* Report Permissions */}
                            <div className="md:col-span-3 space-y-3 border-t border-gray-100 pt-4">
                                <label className="block text-sm font-semibold text-gray-700">สิทธิ์การเข้าถึงรายงาน</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {AVAILABLE_REPORTS.map(report => (
                                        <label key={report.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={(formState.allowed_reports || []).includes(report.id)}
                                                onChange={() => toggleReport(report.id)}
                                                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                            />
                                            <span className="text-sm text-gray-700">{report.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="md:col-span-3 flex items-center gap-4 pt-4 border-t border-gray-100">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={formState.is_active}
                                        onChange={(event) => setFormState({ ...formState, is_active: event.target.checked })}
                                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded"
                                    />
                                    เปิดใช้งานทันที
                                </label>
                                <div className="ml-auto flex gap-3">
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-medium shadow-sm"
                                    >
                                        {editingUser ? 'บันทึกการแก้ไข' : 'สร้างสิทธิ์'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                                    >
                                        ยกเลิก
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <div className="text-xs text-gray-500">สิทธิ์ทั้งหมด</div>
                        <div className="text-2xl font-semibold text-gray-900 mt-1">{users.length}</div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <div className="text-xs text-gray-500">สิทธิ์ที่เปิดใช้งาน</div>
                        <div className="text-2xl font-semibold text-emerald-600 mt-1">{activeCount}</div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <div className="text-xs text-gray-500">จำนวนผู้ดูแลระบบ</div>
                        <div className="text-2xl font-semibold text-blue-600 mt-1">{adminCount}</div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                            <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">ยังไม่มีการกำหนดสิทธิ์</h3>
                            <p className="text-gray-500 text-sm">เริ่มต้นเพิ่มอีเมลที่สามารถเข้าสู่ระบบได้</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">อีเมล</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">บทบาท</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">สิทธิ์รายงาน</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">สถานะ</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {users.map((user) => {
                                        const isActive = user.is_active !== false;
                                        return (
                                            <tr key={user.email} className="hover:bg-gray-50/80 transition-colors group">
                                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">{user.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.role === 'admin'
                                                        ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                        : 'bg-gray-100 text-gray-700 border-gray-200'
                                                        }`}>
                                                        {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งานทั่วไป'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {(user.allowed_reports && user.allowed_reports.length > 0) ? (
                                                            user.allowed_reports.map(r => (
                                                                <span key={r} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                                    {r}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-gray-400">-</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${isActive
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                        : 'bg-red-50 text-red-700 border-red-100'
                                                        }`}>
                                                        {isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEdit(user)}
                                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                            title="แก้ไข"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleActive(user, !isActive)}
                                                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                            title={isActive ? 'ปิดการใช้งาน' : 'เปิดการใช้งาน'}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l2.25 2.25L15 9.75m6 2.25a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(user)}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                            title="ลบ"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
