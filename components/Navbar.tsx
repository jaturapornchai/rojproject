'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import UserMenu from './UserMenu';

export default function Navbar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isManualMenuOpen, setIsManualMenuOpen] = useState(false);
    const [isDebug, setIsDebug] = useState(false);
    const [apiUrl, setApiUrl] = useState('https://smlgoapi.dedepos.com/v1');

    useEffect(() => {
        const debug = process.env.DEBUG === 'true';
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL;
        setIsDebug(debug);
        setApiUrl(debug 
            ? (backendUrl || 'http://localhost:8108/v1')
            : 'https://smlgoapi.dedepos.com/v1');
    }, []);

    if (pathname === '/login') return null;

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-xl text-slate-900 hidden sm:block">ระบบรายงาน</span>
                            {session?.user?.role && (
                                <span className="hidden sm:block text-xs text-slate-500">สิทธิ์: {session.user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน'}</span>
                            )}
                        </div>
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200">
                            <div className={`w-2 h-2 rounded-full ${isDebug ? 'bg-yellow-400' : 'bg-green-500'}`}></div>
                            <span className="text-xs font-mono text-slate-500">{apiUrl}</span>
                        </div>
                        
                        {/* Manual Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setIsManualMenuOpen(!isManualMenuOpen)}
                                className="hidden md:flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                </svg>
                                คู่มือ
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 ml-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                            </button>
                            
                            {isManualMenuOpen && (
                                <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                                    <div className="py-2">
                                        <Link
                                            href="/manual"
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                            onClick={() => setIsManualMenuOpen(false)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                            </svg>
                                            <div>
                                                <div className="font-medium">คู่มือหลัก</div>
                                                <div className="text-xs text-slate-500">ภาพรวมฟีเจอร์</div>
                                            </div>
                                        </Link>
                                        <Link
                                            href="/manual/step-by-step-guide"
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                            onClick={() => setIsManualMenuOpen(false)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                            </svg>
                                            <div>
                                                <div className="font-medium">คู่มือแบบละเอียด</div>
                                                <div className="text-xs text-slate-500">จับมือทำทีละขั้นตอน</div>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {session?.user?.role === 'admin' && (
                            <Link
                                href="/admin/access"
                                className="hidden md:flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                </svg>
                                ผู้ดูแลระบบ
                            </Link>
                        )}
                        <UserMenu />
                    </div>
                </div>
            </div>
        </nav>
    );
}
