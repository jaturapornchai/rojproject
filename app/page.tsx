'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();
  const isAdmin = Boolean(session?.user?.isAdmin);
  const allowedReports = (session?.user as any)?.allowed_reports || [];

  const canAccessReport = (reportId: string) => {
    if (isAdmin) return true;
    return allowedReports.includes(reportId);
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/50 blur-3xl"></div>
        <div className="absolute top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-emerald-100/50 blur-3xl"></div>
        <div className="absolute bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-purple-100/50 blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16 sm:py-24 relative z-10">

        {/* Hero Section */}
        <header className="text-center mb-20 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="inline-flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm mb-6 ring-1 ring-slate-200/50">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            ศูนย์รวมข้อมูล<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">ธุรกิจอัจฉริยะ</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-light">
            เข้าถึงรายงานวิเคราะห์ยอดขาย จัดการระบบ และติดตามสถานะธุรกิจของคุณได้ในที่เดียว
            ด้วยระบบที่ทันสมัยและใช้งานง่าย
          </p>
        </header>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">

          {/* Report Card: SRR40001 */}
          {canAccessReport('SRR40001') && (
            <Link
              href="/reports/srr40001"
              className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200/60 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                <svg className="w-32 h-32 text-blue-600 transform rotate-12 translate-x-8 -translate-y-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.035-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.035.84-1.875 1.875-1.875h.75c1.035 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.035.84-1.875 1.875-1.875h.75c1.035 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
                </svg>
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-blue-200 group-hover:shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                    </svg>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                    พร้อมใช้งาน
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  วิเคราะห์ขายขาดทุน
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  รายงาน SRR40001 แสดงรายการสินค้าที่มีผลกำไรติดลบ เพื่อการปรับปรุงกลยุทธ์ราคา
                </p>

                <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:translate-x-2 transition-transform duration-300">
                  ดูรายงาน
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 ml-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </div>
            </Link>
          )}

          {/* Email Management Card */}
          <Link
            href="/emails"
            className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200/60 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
              <svg className="w-32 h-32 text-emerald-600 transform rotate-12 translate-x-8 -translate-y-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
              </svg>
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-emerald-200 group-hover:shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                  จัดการระบบ
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                จัดการอีเมลแจ้งเตือน
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                เพิ่ม ลบ แก้ไข รายชื่อผู้รับอีเมลสำหรับรายงานต่างๆ เพื่อให้ข้อมูลส่งถึงมือผู้รับอย่างถูกต้อง
              </p>

              <div className="flex items-center text-emerald-600 font-semibold text-sm group-hover:translate-x-2 transition-transform duration-300">
                จัดการข้อมูล
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 ml-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Manual Card */}
          <Link
            href="/manual"
            className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200/60 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
              <svg className="w-32 h-32 text-amber-500 transform rotate-12 translate-x-8 -translate-y-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.25 4.533A9.707 9.707 0 006 3.75a9.706 9.706 0 00-6 3.75V16.575a1.125 1.125 0 001.35 1.085A9.673 9.673 0 016 17.25c.355 0 .708.013 1.059.04 1.31.101 2.65.31 3.942.625.25.06.51-.1.56-.357l.24-1.192a.563.563 0 00-.475-.653A12.43 12.43 0 006 15.25a12.48 12.48 0 00-3.25.43V7.26c.31-.06.625-.11.944-.152A14.018 14.018 0 016 6.75c1.966 0 3.89.426 5.643 1.187C11.25 7.773 11.25 7.586 11.25 7.402v-2.87zM12.75 4.533c.355-.083.72-.15 1.088-.2 1.416-.199 2.9-.283 4.412-.283 1.966 0 3.89.426 5.643 1.187v9.713a12.48 12.48 0 00-3.25-.43 12.43 12.43 0 00-5.19.653.564.564 0 00-.475.653l.24 1.192c.05.256.31.417.56.357 1.291-.315 2.632-.524 3.942-.625.351-.027.704-.04 1.059-.04.466 0 .92.026 1.35.085a1.125 1.125 0 001.35-1.085V7.5a9.706 9.706 0 00-6-3.75 9.707 9.707 0 00-5.25.783v2.87c0 .184 0 .371.05.535.183-.076.369-.148.557-.215V4.533z" />
              </svg>
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-amber-200 group-hover:shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                  คู่มือ
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">
                คู่มือการใช้งาน
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                เรียนรู้วิธีการใช้งานระบบ ขั้นตอนการสร้างรายงาน และเทคนิคต่างๆ เพื่อให้ได้ประโยชน์สูงสุด
              </p>

              <div className="flex items-center text-amber-600 font-semibold text-sm group-hover:translate-x-2 transition-transform duration-300">
                เปิดคู่มือ
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 ml-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Admin Card */}
          {isAdmin && (
            <Link
              href="/admin/access"
              className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200/60 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                <svg className="w-32 h-32 text-purple-600 transform rotate-12 translate-x-8 -translate-y-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1.5l9 4.5v6c0 6-4 11-9 12-5-1-9-6-9-12v-6l9-4.5z" />
                </svg>
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-purple-200 group-hover:shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                    สำหรับผู้ดูแล
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">
                  ผู้ดูแลระบบ
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  จัดการสิทธิ์ผู้ใช้งาน กำหนดบทบาท และตั้งค่าระบบความปลอดภัย
                </p>

                <div className="flex items-center text-purple-600 font-semibold text-sm group-hover:translate-x-2 transition-transform duration-300">
                  เข้าสู่เมนู
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 ml-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </div>
            </Link>
          )}

        </div>
      </div>
    </main>
  );
}
