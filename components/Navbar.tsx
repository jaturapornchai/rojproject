'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserMenu from './UserMenu';

export default function Navbar() {
    const pathname = usePathname();

    // Don't show navbar on login page
    if (pathname === '/login') return null;

    const isDebug = process.env.NEXT_PUBLIC_DEBUG === 'true';
    const apiUrl = isDebug ? 'http://localhost:8108/v1' : 'https://smlgoapi.dedepos.com/v1';

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                            </div>
                            <span className="font-bold text-xl text-slate-900">Report Dashboard</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200">
                            <div className={`w-2 h-2 rounded-full ${isDebug ? 'bg-yellow-400' : 'bg-green-500'}`}></div>
                            <span className="text-xs font-mono text-slate-500">{apiUrl}</span>
                        </div>
                        <UserMenu />
                    </div>
                </div>
            </div>
        </nav>
    );
}
