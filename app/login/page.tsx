'use client';

import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Suspense, useState } from "react";

function LoginContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const callbackUrl = searchParams.get("callbackUrl") || "/";

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!username || !password) {
            setError("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
            return;
        }

        setIsLoading(true);
        try {
            const result = await signIn("credentials", {
                username,
                password,
                redirect: false,
                callbackUrl,
            });

            if (result?.error) {
                setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
            } else {
                router.push(callbackUrl);
                router.refresh();
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg border border-slate-200">
                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-bold text-slate-900">
                        เข้าสู่ระบบ
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        ระบบจัดการรายงาน Rungroj
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-4 rounded-r-lg">
                            <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label htmlFor="username" className="block text-sm font-semibold text-slate-700">
                                ชื่อผู้ใช้
                            </label>
                            <input
                                id="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all text-black"
                                placeholder="Username"
                            />
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="password" title="Password" className="block text-sm font-semibold text-slate-700">
                                รหัสผ่าน
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all text-black"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white shadow-lg ${isLoading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 active:transform active:scale-[0.98]'} focus:outline-none focus:ring-4 focus:ring-red-500/20 transition-all`}
                        >
                            {isLoading ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : null}
                            {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-slate-600">
                            ยังไม่มีบัญชี?{" "}
                            <Link href="/register" className="font-bold text-red-600 hover:text-red-700 transition-colors">
                                สมัครสมาชิก
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}
