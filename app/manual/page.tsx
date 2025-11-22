'use client';

import Link from 'next/link';

export default function UserManual() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-slate-900 font-sans">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 -ml-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">📖 คู่มือการใช้งาน</h1>
                            <p className="text-xs text-slate-500">ระบบรายงานและการจัดการอีเมล</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                
                {/* Introduction */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl mx-auto mb-4">
                            📚
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">ยินดีต้อนรับ</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">
                            คู่มือนี้จะแนะนำวิธีการใช้งานระบบรายงานขาดทุนและการจัดการอีเมลอย่างละเอียด 
                            เหมาะสำหรับผู้ใช้งานทั่วไปที่ไม่มีความรู้ด้านเทคโนโลยี
                        </p>
                    </div>
                </div>

                {/* Table of Contents */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">📋 สารบัญ</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <a href="#login" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                            <span className="text-2xl">🔐</span>
                            <div>
                                <div className="font-semibold text-slate-900">1. การเข้าสู่ระบบ</div>
                                <div className="text-sm text-slate-500">วิธีล็อกอินเข้าใช้งาน</div>
                            </div>
                        </a>
                        <a href="#dashboard" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                            <span className="text-2xl">🏠</span>
                            <div>
                                <div className="font-semibold text-slate-900">2. หน้าหลัก</div>
                                <div className="text-sm text-slate-500">ทำความรู้จักหน้าแรก</div>
                            </div>
                        </a>
                        <a href="#reports" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                            <span className="text-2xl">📊</span>
                            <div>
                                <div className="font-semibold text-slate-900">3. การดูรายงาน</div>
                                <div className="text-sm text-slate-500">รายงานวิเคราะห์ขาดทุน</div>
                            </div>
                        </a>
                        <a href="#emails" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                            <span className="text-2xl">📧</span>
                            <div>
                                <div className="font-semibold text-slate-900">4. จัดการอีเมล</div>
                                <div className="text-sm text-slate-500">เพิ่ม ลบ แก้ไขรายชื่อ</div>
                            </div>
                        </a>
                        <a href="#schedule" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                            <span className="text-2xl">⏰</span>
                            <div>
                                <div className="font-semibold text-slate-900">5. ตารางส่งอีเมล</div>
                                <div className="text-sm text-slate-500">ส่งรายงานอัตโนมัติ</div>
                            </div>
                        </a>
                        <a href="#tips" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                            <span className="text-2xl">💡</span>
                            <div>
                                <div className="font-semibold text-slate-900">6. เคล็ดลับ</div>
                                <div className="text-sm text-slate-500">ข้อแนะนำการใช้งาน</div>
                            </div>
                        </a>
                    </div>
                </div>

                {/* Section 1: Login */}
                <section id="login" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl">
                            🔐
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">1. การเข้าสู่ระบบ</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <p className="text-slate-700">
                            ระบบนี้ใช้การเข้าสู่ระบบด้วย Google Account ของคุณ เพื่อความปลอดภัยและสะดวก
                        </p>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-900 mb-2">📌 ขั้นตอนการเข้าสู่ระบบ:</h4>
                            <ol className="list-decimal list-inside space-y-2 text-blue-800">
                                <li>คลิกที่ปุ่ม <strong>"Sign in with Google"</strong></li>
                                <li>เลือกบัญชี Google ที่ต้องการใช้</li>
                                <li>อนุญาตสิทธิ์การเข้าถึง (หากมี)</li>
                                <li>รอสักครู่ ระบบจะพาเข้าสู่หน้าหลักอัตโนมัติ</li>
                            </ol>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-yellow-800 text-sm">
                                <strong>⚠️ ข้อควรระวัง:</strong> หากคุณไม่มีบัญชี Google กรุณาสมัครบัญชีก่อนที่ <a href="https://accounts.google.com" target="_blank" className="underline hover:text-yellow-900">accounts.google.com</a>
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section 2: Dashboard */}
                <section id="dashboard" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xl">
                            🏠
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">2. หน้าหลัก (Dashboard)</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <p className="text-slate-700">
                            หน้าหลักเป็นจุดเริ่มต้นของการใช้งาน มีการ์ดให้เลือกใช้งานฟีเจอร์ต่างๆ
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-semibold text-blue-900 mb-2">📊 รายงาน SRR40001</h4>
                                <p className="text-blue-800 text-sm">ดูรายงานวิเคราะห์ขายขาดทุนและสร้างไฟล์ PDF</p>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                                <h4 className="font-semibold text-emerald-900 mb-2">📧 จัดการอีเมล</h4>
                                <p className="text-emerald-800 text-sm">เพิ่ม ลบ แก้ไขรายชื่อผู้ติดต่อสำหรับส่งรายงาน</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                            <p className="text-slate-700 text-sm">
                                <strong>💡 เคล็ดลับ:</strong> คลิกที่การ์ดใดก็ได้เพื่อเข้าสู่ฟีเจอร์นั้นๆ หรือใช้เมนูด้านบนเพื่อการนำทางที่สะดวกขึ้น
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section 3: Reports */}
                <section id="reports" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xl">
                            📊
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">3. การดูรายงาน SRR40001</h3>
                    </div>
                    
                    <div className="space-y-6">
                        <p className="text-slate-700">
                            รายงานนี้ใช้แสดงข้อมูลการขายขาดทุนของสินค้า ช่วยในการวิเคราะห์และตัดสินใจทางธุรกิจ
                        </p>

                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-slate-900">📅 การเลือกช่วงเวลา</h4>
                            
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h5 className="font-semibold text-blue-900 mb-2">วิธีที่ 1: ใช้ปุ่มคำสั่งด่วน</h5>
                                <p className="text-blue-800 text-sm mb-2">ใช้ปุ่มที่เตรียมไว้สำหรับช่วงเวลาที่ใช้บ่อย:</p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">วันนี้</span>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">เมื่อวานนี้</span>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">สัปดาห์นี้</span>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">สัปดาห์ก่อน</span>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">ปีนี้</span>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">ปีก่อน</span>
                                </div>
                            </div>

                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                                <h5 className="font-semibold text-emerald-900 mb-2">วิธีที่ 2: เลือกวันที่เอง</h5>
                                <p className="text-emerald-800 text-sm mb-2">คลิกที่ช่องวันที่แล้วเลือกจากปฏิทิน:</p>
                                <ul className="text-emerald-800 text-sm list-disc list-inside space-y-1">
                                    <li>คลิกช่อง "จากวันที่" เพื่อเลือกวันเริ่มต้น</li>
                                    <li>คลิกช่อง "ถึงวันที่" เพื่อเลือกวันสุดท้าย</li>
                                    <li>ใช้เมนู "เลือกปี" และ "เลือกเดือน" เพื่อนำทางได้เร็วขึ้น</li>
                                </ul>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-slate-900">🖨️ การสร้างและดูรายงาน</h4>
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <ol className="list-decimal list-inside space-y-2 text-purple-800">
                                    <li>เลือกช่วงเวลาที่ต้องการ</li>
                                    <li>คลิกปุ่ม <strong>"View Report"</strong></li>
                                    <li>รอสักครู่ ระบบจะสร้างรายงาน</li>
                                    <li>รายงานจะแสดงในหน้าจอ พร้อมสามารถดาวน์โหลดเป็นไฟล์ PDF ได้</li>
                                </ol>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-slate-900">⚙️ ตารางส่งอีเมลอัตโนมัติ</h4>
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <p className="text-orange-800 text-sm mb-2">
                                    สำหรับการส่งรายงานแบบอัตโนมัติ คลิกปุ่ม <strong>"📧 Schedule Email"</strong>
                                </p>
                                <p className="text-orange-700 text-xs">
                                    ฟีเจอร์นี้จะอธิบายในหัวข้อถัดไป
                                </p>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-yellow-800 text-sm">
                                <strong>📝 หมายเหตุ:</strong> หากไม่มีข้อมูลในช่วงเวลาที่เลือก ระบบจะแสดงข้อความแจ้งเตือน กรุณาลองเลือกช่วงเวลาอื่น
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section 4: Email Management */}
                <section id="emails" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-xl">
                            📧
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">4. การจัดการรายชื่ออีเมล</h3>
                    </div>
                    
                    <div className="space-y-6">
                        <p className="text-slate-700">
                            หน้านี้ใช้จัดการรายชื่อผู้ติดต่อสำหรับส่งรายงาน เพิ่ม ลบ แก้ไข และค้นหาข้อมูลได้
                        </p>

                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-slate-900">➕ การเพิ่มผู้ติดต่อใหม่</h4>
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                                <ol className="list-decimal list-inside space-y-2 text-emerald-800">
                                    <li>คลิกปุ่ม <strong>"เพิ่มผู้ติดต่อ"</strong> สีเขียว</li>
                                    <li>กรอกข้อมูลในช่องที่จำเป็น:
                                        <ul className="list-disc list-inside ml-4 mt-1">
                                            <li>อีเมล: ที่อยู่อีเมลของผู้รับ</li>
                                            <li>ชื่อ: ชื่อผู้ติดต่อ</li>
                                            <li>ตำแหน่ง: ตำแหน่งงาน เช่น ผู้จัดการ, บัญชี</li>
                                        </ul>
                                    </li>
                                    <li>คลิก <strong>"สร้างผู้ติดต่อ"</strong></li>
                                    <li>ระบบจะบันทึกและแสดงรายชื่อในตารางด้านล่าง</li>
                                </ol>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-slate-900">✏️ การแก้ไขข้อมูล</h4>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <ol className="list-decimal list-inside space-y-2 text-blue-800">
                                    <li>คลิกไอคอนดินสอ (แก้ไข) ในคอลัมน์ "จัดการ"</li>
                                    <li>แก้ไขข้อมูลที่ต้องการ</li>
                                    <li>คลิก <strong>"อัปเดตข้อมูล"</strong></li>
                                </ol>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-slate-900">🗑️ การลบข้อมูล</h4>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <ol className="list-decimal list-inside space-y-2 text-red-800">
                                    <li>คลิกไอคอนถังขยะ (ลบ) ในคอลัมน์ "จัดการ"</li>
                                    <li>ยืนยันการลบในป๊อปอัป</li>
                                    <li>ข้อมูลจะถูกลบออกทันที</li>
                                </ol>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-slate-900">🔍 การค้นหา</h4>
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <p className="text-purple-800 text-sm">
                                    ใช้ช่องค้นหาด้านบนเพื่อค้นหาจากชื่อ อีเมล หรือตำแหน่ง ระบบจะกรองข้อมูลให้ทันที
                                </p>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-yellow-800 text-sm">
                                <strong>⚠️ สำคัญ:</strong> อีเมลที่เพิ่มในรายการนี้จะใช้สำหรับการส่งรายงานอัตโนมัติ กรุณาตรวจสอบความถูกต้องก่อนเพิ่ม
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section 5: Email Schedule */}
                <section id="schedule" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-xl">
                            ⏰
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">5. ตารางส่งอีเมลอัตโนมัติ</h3>
                    </div>
                    
                    <div className="space-y-6">
                        <p className="text-slate-700">
                            ฟีเจอร์นี้ใช้สำหรับตั้งค่าการส่งรายงานอัตโนมัติตามเวลาที่กำหนด เช่น ทุกวัน ทุกสัปดาห์ หรือเฉพาะวันทำการ
                        </p>

                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-slate-900">📅 การเลือกช่วงเวลาข้อมูล</h4>
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <p className="text-orange-800 text-sm mb-2">เลือกว่าต้องการข้อมูลช่วงใด:</p>
                                <ul className="text-orange-800 text-sm list-disc list-inside space-y-1">
                                    <li><strong>วันนี้:</strong> ข้อมูลของวันปัจจุบัน</li>
                                    <li><strong>เมื่อวานนี้:</strong> ข้อมูลของเมื่อวาน</li>
                                    <li><strong>สัปดาห์นี้:</strong> ข้อมูลตั้งแต่จันทร์ถึงวันนี้</li>
                                    <li><strong>สัปดาห์ก่อน:</strong> ข้อมูลของสัปดาห์ที่แล้ว</li>
                                    <li><strong>เดือนนี้:</strong> ข้อมูลตั้งแต่ต้นเดือนถึงวันนี้</li>
                                    <li><strong>เดือนก่อน:</strong> ข้อมูลของเดือนที่แล้ว</li>
                                    <li><strong>ปีนี้/ปีก่อน:</strong> ข้อมูลตามปี</li>
                                </ul>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-slate-900">📆 การเลือกวันที่ส่ง</h4>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-blue-800 text-sm mb-2">เลือกวันที่ต้องการให้ระบบส่งอีเมล:</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                    <div className="bg-blue-100 px-2 py-1 rounded text-blue-800">อาทิตย์</div>
                                    <div className="bg-blue-100 px-2 py-1 rounded text-blue-800">จันทร์</div>
                                    <div className="bg-blue-100 px-2 py-1 rounded text-blue-800">อังคาร</div>
                                    <div className="bg-blue-100 px-2 py-1 rounded text-blue-800">พุธ</div>
                                    <div className="bg-blue-100 px-2 py-1 rounded text-blue-800">พฤหัสบดี</div>
                                    <div className="bg-blue-100 px-2 py-1 rounded text-blue-800">ศุกร์</div>
                                    <div className="bg-blue-100 px-2 py-1 rounded text-blue-800">เสาร์</div>
                                </div>
                                <p className="text-blue-700 text-xs mt-2">คลิกที่วันเพื่อเลือก/ยกเลิก มักจะเลือกเฉพาะวันทำการ (จันทร์-ศุกร์)</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-slate-900">🕐 การตั้งเวลาส่ง</h4>
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                                <p className="text-emerald-800 text-sm mb-2">กำหนดเวลาที่ต้องการให้ส่งอีเมล:</p>
                                <ul className="text-emerald-800 text-sm list-disc list-inside space-y-1">
                                    <li>คลิกที่ช่องเวลาแล้วเลือกชั่วโมง:นาที</li>
                                    <li>สามารถเพิ่มเวลาเพิ่มเติมได้โดยคลิก "+ เพิ่มเวลา"</li>
                                    <li>เวลาที่แนะนำ: 09:00 (เวลาเปิดทำการ)</li>
                                </ul>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-slate-900">👥 การเลือกผู้รับ</h4>
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <ol className="list-decimal list-inside space-y-2 text-purple-800">
                                    <li>คลิกที่ช่อง "ผู้รับ (ถึง)"</li>
                                    <li>เลือกจากรายชื่อที่เพิ่มไว้ในหน้า "จัดการอีเมล"</li>
                                    <li>สามารถเลือกผู้รับสำเนา (CC) ได้ในช่องถัดไป</li>
                                </ol>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-slate-900">📧 การตั้งค่าอีเมล</h4>
                            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                                <ul className="text-indigo-800 text-sm list-disc list-inside space-y-2">
                                    <li><strong>หัวข้ออีเมล:</strong> ชื่อเรื่องที่จะแสดงในกล่องอีเมล</li>
                                    <li><strong>เปิดใช้งาน:</strong> เปิด/ปิดการทำงานของตารางส่ง</li>
                                    <li><strong>แนบไฟล์ PDF:</strong> เลือกว่าต้องการแนบไฟล์รายงานหรือไม่</li>
                                </ul>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-slate-900">▶️ การทดสอบส่ง</h4>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-yellow-800 text-sm">
                                    หลังจากสร้างตารางส่งแล้ว สามารถคลิก <strong>"ทดสอบส่ง Email"</strong> 
                                    เพื่อทดสอบการส่งอีเมลทันที โดยไม่ต้องรอตามเวลาที่กำหนด
                                </p>
                            </div>
                        </div>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-800 text-sm">
                                <strong>⚠️ ข้อควรระวัง:</strong> ตารางส่งอัตโนมัติจะทำงานตามเวลาที่กำหนด 
                                กรุณาตรวจสอบการตั้งค่าให้ถูกต้องก่อนเปิดใช้งาน
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section 6: Tips */}
                <section id="tips" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 text-xl">
                            💡
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">6. เคล็ดลับและข้อแนะนำ</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h4 className="font-semibold text-green-900 mb-2">✅ แนวทางปฏิบัติที่ดี</h4>
                                <ul className="text-green-800 text-sm space-y-1">
                                    <li>• ตั้งเวลาส่งในเวลาทำการ (09:00-17:00)</li>
                                    <li>• เลือกช่วงเวลาข้อมูลเป็น "เมื่อวานนี้" สำหรับรายงานประจำวัน</li>
                                    <li>• ใช้ชื่ออีเมลที่ชัดเจนและเข้าใจง่าย</li>
                                    <li>• ทดสอบการส่งก่อนเปิดใช้งานจริง</li>
                                </ul>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-semibold text-blue-900 mb-2">🔧 การแก้ปัญหาเบื้องต้น</h4>
                                <ul className="text-blue-800 text-sm space-y-1">
                                    <li>• ไม่มีข้อมูลในรายงาน → ลองเปลี่ยนช่วงเวลา</li>
                                    <li>• อีเมลไม่ส่ง → ตรวจสอบสถานะ "เปิดใช้งาน"</li>
                                    <li>• ไม่พบผู้รับ → เพิ่มรายชื่อในหน้าจัดการอีเมล</li>
                                    <li>• รายงานช้า → รอสักครู่แล้วลองใหม่</li>
                                </ul>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <h4 className="font-semibold text-purple-900 mb-2">⚡ การใช้งานที่มีประสิทธิภาพ</h4>
                                <ul className="text-purple-800 text-sm space-y-1">
                                    <li>• สร้างตารางส่งเฉพาะวันทำการ (จ-ศ)</li>
                                    <li>• ใช้ CC สำหรับผู้บังคับบัญชา</li>
                                    <li>• ตั้งชื่อหัวข้อให้บ่งบอกเนื้อหา</li>
                                    <li>• ตรวจสอบรายงานเป็นประจำ</li>
                                </ul>
                            </div>

                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <h4 className="font-semibold text-orange-900 mb-2">📞 การติดต่อ</h4>
                                <p className="text-orange-800 text-sm">
                                    หากพบปัญหาหรือต้องการความช่วยเหลือ กรุณาติดต่อทีม IT 
                                    หรือส่งอีเมลแจ้งปัญหาพร้อมสกรีนช็อต
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 text-center">
                        <h4 className="text-lg font-bold mb-2">🎉 ขอให้ใช้งานระบบอย่างมีความสุข!</h4>
                        <p className="text-blue-100 text-sm">
                            ระบบนี้ถูกออกแบบมาเพื่อช่วยให้การทำงานง่ายขึ้น หากมีข้อเสนอแนะเพื่อปรับปรุง 
                            กรุณาแจ้งให้ทราบ
                        </p>
                    </div>
                </section>

                {/* Back to Home */}
                <div className="text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                        กลับสู่หน้าหลัก
                    </Link>
                </div>
            </div>
        </main>
    );
}