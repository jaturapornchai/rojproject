'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!username || !password || !confirmPassword) {
            setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
            return;
        }

        if (password !== confirmPassword) {
            setError("รหัสผ่านไม่ตรงกัน");
            return;
        }

        if (password.length < 6) {
            setError("รหัสผ่านควรมีความยาวอย่างน้อย 6 ตัวอักษร");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch("/rojproject/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    password
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/login");
            }, 2000);

        } catch (err: any) {
            console.error("Registration error:", err);
            setError(err.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg border border-slate-200 text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-10 h-10">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">สมัครสมาชิกสำเร็จ!</h2>
                    <p className="text-slate-600">ตรวจสอบสิทธิ์และเข้าสู่ระบบในลำดับถัดไป...</p>
                    <p className="text-xs text-slate-400">กำลังนำคุณไปยังหน้าเข้าสู่ระบบ</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg border border-slate-200">
                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-bold text-slate-900">
                        สมัครสมาชิก
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        สร้างบัญชีใหม่เพื่อเข้าใช้ระบบรายงาน Rungroj
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
                                ชื่อผู้ใช้ / อีเมล
                            </label>
                            <input
                                id="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all text-black"
                                placeholder="Username or Email"
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
                        <div className="space-y-1">
                            <label htmlFor="confirmPassword" title="Confirm Password" className="block text-sm font-semibold text-slate-700">
                                ยืนยันรหัสผ่าน
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all text-black"
                                placeholder="Confirm Password"
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
                            {isLoading ? "กำลังประมวลผล..." : "สมัครสมาชิก"}
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-slate-600">
                            มีบัญชีอยู่แล้ว?{" "}
                            <Link href="/login" className="font-bold text-red-600 hover:text-red-700 transition-colors">
                                เข้าสู่ระบบ
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
