'use client';

import { signOut, useSession } from 'next-auth/react';

export default function UserMenu() {
    const { data: session } = useSession();

    if (!session?.user) return null;

    return (
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm border border-slate-200">
            {session.user.image ? (
                <img src={session.user.image} alt="Profile" className="w-8 h-8 rounded-full" />
            ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {session.user.name?.charAt(0) || 'U'}
                </div>
            )}
            <div className="hidden md:flex flex-col items-start mr-2">
                <span className="text-xs font-semibold text-slate-800 leading-none">{session.user.name}</span>
                <span className="text-[10px] text-slate-500 leading-none mt-1">{session.user.email}</span>
            </div>
            <button
                onClick={() => signOut()}
                className="text-xs text-red-600 hover:text-red-700 font-medium px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
            >
                Sign Out
            </button>
        </div>
    );
}
