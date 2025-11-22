'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import UserMenu from './UserMenu';

export default function Navbar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    if (pathname === '/login') return null;

    const isDebug = process.env.NEXT_PUBLIC_DEBUG === 'true';
    const apiUrl = isDebug ? 'http://localhost:8108/v1' : 'https://smlgoapi.dedepos.com/v1';

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
