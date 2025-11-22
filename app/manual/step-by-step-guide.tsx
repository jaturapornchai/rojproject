'use client';

import Link from 'next/link';

export default function StepByStepGuide() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 text-slate-900 font-sans">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 -ml-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">📚 คู่มือใช้งานแบบละเอียด</h1>
                            <p className="text-xs text-slate-500">จับมือทำทีละขั้นตอน</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-2xl p-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">🎯 ยินดีต้อนรับสู่ระบบรายงาน!</h2>
                    <p className="text-green-100 text-lg">
                        คู่มือนี้จะพาคุณใช้งานระบบทีละขั้นตอน ไม่ต้องกังวลถ้าไม่เคยใช้มาก่อน
                    </p>
                </div>

                {/* Table of Contents */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">📋 สารบัญ</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <a href="#step1" className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
                            <span className="text-3xl">1️⃣</span>
                            <div>
                                <div className="font-bold text-blue-900">เข้าสู่ระบบ</div>
                                <div className="text-sm text-blue-700">ล็อกอินด้วย Google Account</div>
                            </div>
                        </a>
                        <a href="#step2" className="flex items-center gap-4 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
                            <span className="text-3xl">2️⃣</span>
                            <div>
                                <div className="font-bold text-green-900">ทำความรู้จักระบบ</div>
                                <div className="text-sm text-green-700">หน้าหลักและการนำทาง</div>
                            </div>
                        </a>
                        <a href="#step3" className="flex items-center gap-4 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors">
                            <span className="text-3xl">3️⃣</span>
                            <div>
                                <div className="font-bold text-purple-900">ดูรายงาน</div>
                                <div className="text-sm text-purple-700">วิธีดูและสร้างรายงาน PDF</div>
                            </div>
                        </a>
                        <a href="#step4" className="flex items-center gap-4 p-4 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors">
                            <span className="text-3xl">4️⃣</span>
                            <div>
                                <div className="font-bold text-orange-900">จัดการอีเมล</div>
                                <div className="text-sm text-orange-700">เพิ่ม ลบ แก้ไขรายชื่อ</div>
                            </div>
                        </a>
                        <a href="#step5" className="flex items-center gap-4 p-4 rounded-xl bg-red-50 hover:bg-red-100 transition-colors">
                            <span className="text-3xl">5️⃣</span>
                            <div>
                                <div className="font-bold text-red-900">ส่งอีเมลอัตโนมัติ</div>
                                <div className="text-sm text-red-700">ตั้งค่าตารางส่งรายงาน</div>
                            </div>
                        </a>
                        <a href="#step6" className="flex items-center gap-4 p-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors">
                            <span className="text-3xl">6️⃣</span>
                            <div>
                                <div className="font-bold text-indigo-900">ผู้ดูแลระบบ</div>
                                <div className="text-sm text-indigo-700">จัดการสิทธิ์ผู้ใช้</div>
                            </div>
                        </a>
                    </div>
                </div>

                {/* Step 1: Login */}
                <section id="step1" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            1
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">🔐 ขั้นตอนที่ 1: เข้าสู่ระบบ</h3>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                            <h4 className="text-xl font-bold text-blue-900 mb-4">📱 วิธีการเข้าสู่ระบบ (ละเอียดทีละขั้น)</h4>
                            
                            <div className="space-y-4">
                                <div className="flex gap-4 p-4 bg-white rounded-lg border">
                                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                                    <div>
                                        <h5 className="font-bold text-slate-900">เปิดเว็บไซต์</h5>
                                        <p className="text-sm text-slate-600">พิมพ์ URL ของระบบในเบราว์เซอร์ (Chrome, Firefox, Safari)</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-4 p-4 bg-white rounded-lg border">
                                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                                    <div>
                                        <h5 className="font-bold text-slate-900">คลิกปุ่ม "Sign in with Google"</h5>
                                        <p className="text-sm text-slate-600">ปุ่มสีแดงที่มีโลโก้ Google ใต้ข้อความ "เข้าสู่ระบบ"</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-4 p-4 bg-white rounded-lg border">
                                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                                    <div>
                                        <h5 className="font-bold text-slate-900">เลือกบัญชี Google</h5>
                                        <p className="text-sm text-slate-600">เลือกจากรายชื่อบัญชีที่มี หรือคลิก "Use another account"</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-4 p-4 bg-white rounded-lg border">
                                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                                    <div>
                                        <h5 className="font-bold text-slate-900">อนุญาตสิทธิ์</h5>
                                        <p className="text-sm text-slate-600">คลิก "Allow" หรือ "อนุญาต" เพื่อให้ระบบเข้าถึงข้อมูลพื้นฐาน</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-4 p-4 bg-white rounded-lg border">
                                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">✓</div>
                                    <div>
                                        <h5 className="font-bold text-green-900">เสร็จ!</h5>
                                        <p className="text-sm text-green-700">รอสักครู่ ระบบจะพาเข้าสู่หน้าหลักอัตโนมัติ</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <h5 className="font-bold text-yellow-900 mb-2">⚠️ ไม่มีบัญชี Google?</h5>
                                <p className="text-yellow-800 text-sm">ไปที่ <a href="https://accounts.google.com" target="_blank" className="underline">accounts.google.com</a> เพื่อสมัครใช้งาน</p>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h5 className="font-bold text-green-900 mb-2">💡 เคล็ดลับ</h5>
                                <p className="text-green-800 text-sm">ใช้บัญชี Google ที่เป็นขององค์กร เพื่อความปลอดภัย</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Step 2: Dashboard */}
                <section id="step2" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            2
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">🏠 ขั้นตอนที่ 2: ทำความรู้จักระบบ</h3>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                            <h4 className="text-xl font-bold text-green-900 mb-4">🗺️ หน้าหลัก (Dashboard)</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                                        <h5 className="font-bold text-blue-900 mb-2">📊 การ์ดรายงาน</h5>
                                        <p className="text-blue-800 text-sm">คลิกเพื่อไปหน้าดูรายงาน SRR40001</p>
                                    </div>
                                    
                                    <div className="bg-white rounded-lg p-4 border-2 border-emerald-200">
                                        <h5 className="font-bold text-emerald-900 mb-2">📧 การ์ดจัดการอีเมล</h5>
                                        <p className="text-emerald-800 text-sm">คลิกเพื่อไปหน้าจัดการรายชื่อผู้ติดต่อ</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="bg-white rounded-lg p-4 border-2 border-orange-200">
                                        <h5 className="font-bold text-orange-900 mb-2">📚 การ์ดคู่มือ</h5>
                                        <p className="text-orange-800 text-sm">คลิกเพื่อดูคู่มือการใช้งาน</p>
                                    </div>
                                    
                                    <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                                        <h5 className="font-bold text-gray-900 mb-2">➕ เพิ่มรายงาน</h5>
                                        <p className="text-gray-800 text-sm">ยังไม่พร้อมใช้งาน (Coming soon)</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h5 className="font-bold text-blue-900 mb-3">🧭 แถบเมนูด้านบน</h5>
                            <ul className="text-blue-800 text-sm space-y-2">
                                <li>• <strong>หน้าหลัก:</strong> กลับมาหน้านี้</li>
                                <li>• <strong>รายงาน SRR40001:</strong> ดูรายงานและสร้าง PDF</li>
                                <li>• <strong>จัดการอีเมล:</strong> เพิ่ม ลบ แก้ไขรายชื่อ</li>
                                <li>• <strong>จัดการสิทธิ์:</strong> เฉพาะ Admin เท่านั้น</li>
                                <li>• <strong>คู่มือการใช้งาน:</strong> ดูคู่มือนี้</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Step 3: Reports */}
                <section id="step3" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            3
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">📊 ขั้นตอนที่ 3: การดูรายงาน</h3>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                            <h4 className="text-xl font-bold text-purple-900 mb-4">🗓️ ขั้นตอนที่ 1: เลือกช่วงเวลา</h4>
                            
                            <div className="space-y-4">
                                <div className="bg-white rounded-lg p-4 border">
                                    <h5 className="font-bold text-purple-900 mb-2">วิธีที่ 1: ใช้ปุ่มเร็ว</h5>
                                    <ol className="text-purple-800 text-sm space-y-2">
                                        <li>1. คลิกปุ่ม "วันนี้" สำหรับวันปัจจุบัน</li>
                                        <li>2. คลิกปุ่ม "เมื่อวานนี้" สำหรับข้อมูลเมื่อวาน</li>
                                        <li>3. คลิกปุ่ม "สัปดาห์นี้" สำหรับต้นสัปดาห์ถึงวันนี้</li>
                                        <li>4. คลิกปุ่ม "สัปดาห์ก่อน" สำหรับสัปดาห์ที่แล้ว</li>
                                        <li>5. คลิกปุ่ม "ปีนี้" หรือ "ปีก่อน" สำหรับปี</li>
                                    </ol>
                                </div>
                                
                                <div className="bg-white rounded-lg p-4 border">
                                    <h5 className="font-bold text-purple-900 mb-2">วิธีที่ 2: เลือกวันเอง</h5>
                                    <ol className="text-purple-800 text-sm space-y-2">
                                        <li>1. คลิกช่อง "จากวันที่" เพื่อเปิดปฏิทิน</li>
                                        <li>2. เลือกปี (พ.ศ.) และเดือนจากเมนู</li>
                                        <li>3. คลิกวันที่ต้องการ</li>
                                        <li>4. ทำเหมือนกันกับช่อง "ถึงวันที่"</li>
                                        <li>5. ใช้เมนู "เลือกเดือน" หรือ "เลือกปี" เพื่อเลือกเร็วขึ้น</li>
                                    </ol>
                                </div>
                            </div>
                        </div>

                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                            <h4 className="text-xl font-bold text-emerald-900 mb-4">🖨️ ขั้นตอนที่ 2: สร้างและดูรายงาน</h4>
                            
                            <div className="space-y-4">
                                <div className="bg-white rounded-lg p-4 border">
                                    <h5 className="font-bold text-emerald-900 mb-2">การสร้างรายงาน</h5>
                                    <ol className="text-emerald-800 text-sm space-y-1">
                                        <li>1. หลังจากเลือกช่วงเวลาแล้ว</li>
                                        <li>2. คลิกปุ่ม "View Report" (สีน้ำเงิน)</li>
                                        <li>3. รอสักครู่ ระบบจะสร้างรายงาน</li>
                                        <li>4. รายงานจะแสดงเป็น PDF ในหน้าจอ</li>
                                    </ol>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <h5 className="font-bold text-yellow-900 mb-2">📝 หมายเหตุ</h5>
                                <p className="text-yellow-800 text-sm">หากไม่มีข้อมูลในช่วงเวลาที่เลือก ระบบจะแสดง "ไม่พบข้อมูล" ลองเปลี่ยนช่วงเวลาอื่น</p>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h5 className="font-bold text-blue-900 mb-2">💡 เคล็ดลับ</h5>
                                <p className="text-blue-800 text-sm">เลือกช่วงเวลาที่มีข้อมูลมากที่สุด เช่น "เมื่อวานนี้" หรือ "สัปดาห์ก่อน"</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Step 4: Email Management */}
                <section id="step4" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            4
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">📧 ขั้นตอนที่ 4: จัดการรายชื่ออีเมล</h3>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                            <h4 className="text-xl font-bold text-orange-900 mb-4">➕ การเพิ่มผู้ติดต่อใหม่</h4>
                            
                            <div className="space-y-4">
                                <div className="bg-white rounded-lg p-4 border">
                                    <h5 className="font-bold text-orange-900 mb-2">ขั้นตอนการเพิ่ม</h5>
                                    <ol className="text-orange-800 text-sm space-y-2">
                                        <li>1. คลิกปุ่ม "เพิ่มผู้ติดต่อ" (สีเขียว)</li>
                                        <li>2. กรอกอีเมล (เช่น: somchai@company.com)</li>
                                        <li>3. กรอกชื่อ (เช่น: สมชาย ใจดี)</li>
                                        <li>4. กรอกตำแหน่ง (เช่น: ผู้จัดการ, บัญชี, พนักงาน)</li>
                                        <li>5. คลิก "สร้างผู้ติดต่อ"</li>
                                        <li>6. ตรวจสอบว่าผู้ติดต่อใหม่เพิ่มในตารางแล้ว</li>
                                    </ol>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h5 className="font-bold text-blue-900 mb-2">✏️ การแก้ไข</h5>
                                <ol className="text-blue-800 text-sm space-y-1">
                                    <li>1. หาแถวที่ต้องการแก้ไข</li>
                                    <li>2. คลิกไอคอนดินสอ</li>
                                    <li>3. แก้ไขข้อมูล</li>
                                    <li>4. คลิก "อัปเดตข้อมูล"</li>
                                </ol>
                            </div>
                            
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <h5 className="font-bold text-red-900 mb-2">🗑️ การลบ</h5>
                                <ol className="text-red-800 text-sm space-y-1">
                                    <li>1. หาแถวที่ต้องการลบ</li>
                                    <li>2. คลิกไอคอนถังขยะ</li>
                                    <li>3. ยืนยันในป๊อปอัพ</li>
                                    <li>4. ข้อมูลจะถูกลบทันที</li>
                                </ol>
                            </div>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h5 className="font-bold text-green-900 mb-2">🔍 การค้นหา</h5>
                            <p className="text-green-800 text-sm">พิมพ์ในช่องค้นหาเพื่อกรองจากชื่อ อีเมล หรือตำแหน่ง</p>
                        </div>
                    </div>
                </section>

                {/* Step 5: Email Schedule */}
                <section id="step5" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            5
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">⏰ ขั้นตอนที่ 5: ตั้งค่าส่งอีเมลอัตโนมัติ</h3>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                            <h4 className="text-xl font-bold text-red-900 mb-4">📅 การตั้งค่าตารางส่ง</h4>
                            
                            <div className="space-y-4">
                                <div className="bg-white rounded-lg p-4 border">
                                    <h5 className="font-bold text-red-900 mb-2">ขั้นตอนที่ 1: เลือกช่วงเวลา</h5>
                                    <ul className="text-red-800 text-sm space-y-1">
                                        <li>• วันนี้: ข้อมูลของวันนี้</li>
                                        <li>• เมื่อวานนี้: ข้อมูลของเมื่อวาน (แนะนำ)</li>
                                        <li>• สัปดาห์นี้: ต้นสัปดาห์ถึงวันนี้</li>
                                        <li>• เดือนนี้: ต้นเดือนถึงวันนี้</li>
                                    </ul>
                                </div>
                                
                                <div className="bg-white rounded-lg p-4 border">
                                    <h5 className="font-bold text-red-900 mb-2">ขั้นตอนที่ 2: เลือกวันส่ง</h5>
                                    <p className="text-red-800 text-sm mb-2">คลิกเฉพาะวันทำการ (จันทร์-ศุกร์) ตามต้องการ</p>
                                </div>
                                
                                <div className="bg-white rounded-lg p-4 border">
                                    <h5 className="font-bold text-red-900 mb-2">ขั้นตอนที่ 3: กำหนดเวลา</h5>
                                    <p className="text-red-800 text-sm mb-2">เลือกเวลา 09:00 (เวลาเปิดทำการ)</p>
                                    <p className="text-red-700 text-xs">สามารถเพิ่มเวลาเพิ่มเติมได้</p>
                                </div>
                                
                                <div className="bg-white rounded-lg p-4 border">
                                    <h5 className="font-bold text-red-900 mb-2">ขั้นตอนที่ 4: เลือกผู้รับ</h5>
                                    <p className="text-red-800 text-sm mb-2">คลิกช่อง "ผู้รับ (ถึง)" แล้วเลือกจากรายชื่อที่เพิ่มไว้</p>
                                </div>
                                
                                <div className="bg-white rounded-lg p-4 border">
                                    <h5 className="font-bold text-red-900 mb-2">ขั้นตอนที่ 5: ตั้งค่าอีเมล</h5>
                                    <ul className="text-red-800 text-sm space-y-1">
                                        <li>• ชื่อเรื่อง: "รายงานวิเคราะห์ขาดทุนประจำวัน"</li>
                                        <li>• เปิดใช้งาน: ✓ (เครื่องหมายถูก)</li>
                                        <li>• แนบไฟล์ PDF: ✓ (เครื่องหมายถูก)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h5 className="font-bold text-yellow-900 mb-2">▶️ การทดสอบส่ง</h5>
                            <p className="text-yellow-800 text-sm">หลังสร้างตารางส่งแล้ว คลิก "ทดสอบส่ง Email" เพื่อส่งทันทีและตรวจสอบว่าทำงานถูกต้อง</p>
                        </div>
                    </div>
                </section>

                {/* Step 6: Admin */}
                <section id="step6" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            6
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">⚙️ ขั้นตอนที่ 6: จัดการสิทธิ์ผู้ใช้ (เฉพาะ Admin)</h3>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
                            <h4 className="text-xl font-bold text-indigo-900 mb-4">👤 ประเภทผู้ใช้</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                                    <h5 className="font-bold text-blue-900 mb-2">🛡️ ผู้ดูแลระบบ (Admin)</h5>
                                    <ul className="text-blue-800 text-sm space-y-1">
                                        <li>• เข้าถึงระบบทั้งหมด</li>
                                        <li>• จัดการสิทธิ์ผู้ใช้อื่น</li>
                                        <li>• ดูรายงานทุกประเภท</li>
                                        <li>• ตั้งค่าอีเมล</li>
                                    </ul>
                                </div>
                                
                                <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                                    <h5 className="font-bold text-gray-900 mb-2">👥 ผู้ใช้งานทั่วไป (User)</h5>
                                    <ul className="text-gray-800 text-sm space-y-1">
                                        <li>• ดูรายงานตามสิทธิ์</li>
                                        <li>• ไม่สามารถจัดการผู้ใช้อื่น</li>
                                        <li>• ใช้ฟีเจอร์ที่เปิดให้</li>
                                        <li>• สิทธิ์จำกัด</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                            <h4 className="text-xl font-bold text-green-900 mb-4">➕ การเพิ่มสิทธิ์ผู้ใช้</h4>
                            <ol className="text-green-800 text-sm space-y-2">
                                <li>1. คลิก "เพิ่มสิทธิ์ใหม่"</li>
                                <li>2. กรอกอีเมลของผู้ใช้</li>
                                <li>3. เลือกบทบาท (Admin หรือ User)</li>
                                <li>4. เลือกสิทธิ์รายงานที่อนุญาต</li>
                                <li>5. เลือก "เปิดใช้งานทันที" หากต้องการ</li>
                                <li>6. คลิก "สร้างสิทธิ์"</li>
                            </ol>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h5 className="font-bold text-blue-900 mb-2">📊 สถิติสิทธิ์</h5>
                                <ul className="text-blue-800 text-sm space-y-1">
                                    <li>• สิทธิ์ทั้งหมด: จำนวนผู้ใช้</li>
                                    <li>• เปิดใช้งาน: ผู้ใช้ที่ใช้งานได้</li>
                                    <li>• ผู้ดูแลระบบ: จำนวน Admin</li>
                                </ul>
                            </div>
                            
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <h5 className="font-bold text-red-900 mb-2">⚠️ ข้อควรระวัง</h5>
                                <p className="text-red-800 text-sm">การลบสิทธิ์จะทำให้ผู้ใช้ไม่สามารถเข้าสู่ระบบได้ทันที</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Practical Examples */}
                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            💡
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">🎯 ตัวอย่างการใช้งานจริง</h3>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                            <h4 className="text-xl font-bold text-green-900 mb-4">📊 ตัวอย่าง: ดูรายงานประจำวัน</h4>
                            <ol className="text-green-800 text-sm space-y-2">
                                <li>1. ล็อกอินเข้าระบบ</li>
                                <li>2. คลิกการ์ด "รายงาน SRR40001"</li>
                                <li>3. เลือกช่วงเวลา "เมื่อวานนี้"</li>
                                <li>4. คลิก "View Report"</li>
                                <li>5. รอสักครู่ ดูผลรายงานใน PDF</li>
                                <li>6. ใช้ปุ่มดาวน์โหลดเพื่อบันทึกไฟล์</li>
                            </ol>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                            <h4 className="text-xl font-bold text-blue-900 mb-4">📧 ตัวอย่าง: เพิ่มรายชื่อผู้รับรายงาน</h4>
                            <ol className="text-blue-800 text-sm space-y-2">
                                <li>1. ไปที่เมนู "จัดการอีเมล"</li>
                                <li>2. คลิก "เพิ่มผู้ติดต่อ"</li>
                                <li>3. กรอก: manager@company.com / ผู้จัดการ / ผู้จัดการฝ่าย</li>
                                <li>4. คลิก "สร้างผู้ติดต่อ"</li>
                                <li>5. ตรวจสอบว่าเพิ่มในตารางแล้ว</li>
                                <li>6. ทำเหมือนกันสำหรับคนอื่นๆ</li>
                            </ol>
                        </div>

                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                            <h4 className="text-xl font-bold text-orange-900 mb-4">⏰ ตัวอย่าง: ตั้งค่าส่งรายงานทุกวันจันทร์</h4>
                            <ol className="text-orange-800 text-sm space-y-2">
                                <li>1. ไปหน้ารายงาน SRR40001</li>
                                <li>2. คลิก "📧 Schedule Email"</li>
                                <li>3. เลือก "เมื่อวานนี้" สำหรับช่วงเวลาข้อมูล</li>
                                <li>4. คลิกเฉพาะ "จันทร์" ในวันที่ส่ง</li>
                                <li>5. ตั้งเวลา 09:00 น.</li>
                                <li>6. เลือกผู้รับจากรายชื่อ</li>
                                <li>7. คลิก "สร้างตารางส่ง"</li>
                                <li>8. คลิก "ทดสอบส่ง Email" เพื่อตรวจสอบ</li>
                            </ol>
                        </div>
                    </div>
                </section>

                {/* Back to Home */}
                <div className="text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all font-medium shadow-lg text-lg"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                        เริ่มใช้งานระบบ
                    </Link>
                </div>
            </div>
        </main>
    );
}