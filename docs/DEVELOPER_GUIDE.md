# Developer Guide - ระบบรายงานวิเคราะห์ขาดทุน

## 📋 สารบัญ
- [โครงสร้างโปรเจ็กต์](#โครงสร้างโปรเจ็กต์)
- [การเพิ่มรายงานใหม่](#การเพิ่มรายงานใหม่)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [PDF Configuration](#pdf-configuration)
- [Permissions & Security](#permissions--security)
- [Error Handling](#error-handling)
- [Testing](#testing)

## 🏗️ โครงสร้างโปรเจ็กต์

```
app/
├── reports/                    # หน้ารายงาน
│   └── srr40001/              # รายงานตัวอย่าง
│       ├── page.tsx           # หน้ารายงานหลัก
│       └── schedules/         # ตั้งเวลาส่งรายงาน
│           └── page.tsx
├── api/                       # API Routes
│   ├── generate-report/       # สร้างรายงาน
│   ├── get-pdf/              # สร้าง PDF
│   ├── mongodb/              # MongoDB operations
│   └── process-schedule/     # ส่งรายงานตามตารางเวลา
├── components/               # React Components
├── lib/                     # Constants และ Utilities
└── manual/                  # คู่มือการใช้งาน
```

## ➕ การเพิ่มรายงานใหม่

### Step 1: สร้างโฟลเดอร์และหน้ารายงาน
```bash
# สร้างโฟลเดอร์สำหรับรายงานใหม่
mkdir -p app/reports/srrXXXXX
mkdir -p app/reports/srrXXXXX/schedules
```

### Step 2: สร้างหน้ารายงานหลัก (`page.tsx`)
```typescript
'use client';

import { useState } from 'react';
import ThaiDatePicker from '@/components/ThaiDatePicker';
import { SHOP_ID_PUBLIC } from '@/lib/constants';

export default function ReportSRRXXXXX() {
    const [startDate, setStartDate] = useState<Date | null>(/* ค่าเริ่มต้น */);
    const [endDate, setEndDate] = useState<Date | null>(/* ค่าเริ่มต้น */);
    const [loading, setLoading] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    const handleGenerateResult = async () => {
        setLoading(true);
        try {
            // SQL Query สำหรับรายงานใหม่
            const baseQuery = `select 
                field1 as "ฟิลด์1",
                field2 as "ฟิลด์2",
                ...
            from table_name 
            where conditions
            AND doc_date BETWEEN '${formatDate(startDate)}' AND '${formatDate(endDate)}'
            order by ...`;

            // กำหนดค่าสำหรับ API
            const requestPayload = {
                shopid: SHOP_ID_PUBLIC,
                limit: 5000,
                query_items: [{
                    alias: "report_alias",
                    query: baseQuery,
                    summary_config: {
                        levels: [{
                            group_by_fields: ["field1"],
                            sum_fields: ["ฟิลด์ตัวเลข"],
                            typejson: 1
                        }],
                        grand_total: true,
                        grand_total_type: 99
                    }
                }]
            };

            // เรียก Generate Report API
            const reportRes = await fetch('/api/generate-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestPayload),
            });

            const reportData = await reportRes.json();

            if (reportData?.success && reportData.guid) {
                // สร้าง PDF
                await generatePDF(reportData.guid);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = async (guid: string) => {
        const pdfPayload = {
            shopid: SHOP_ID_PUBLIC,
            guid,
            pdf_config: {
                title: "ชื่อรายงานใหม่ (SRRXXXXX)",
                description: `ตั้งแต่วันที่ ${formatThaiDateForPdf(startDate)} ถึงวันที่ ${formatThaiDateForPdf(endDate)}`,
                orientation: "L", // หรือ "P" สำหรับ Portrait
                page_size: "A4"
            },
            layout_config: {
                sections: [{
                    alias: "report_alias",
                    row_type: "detail",
                    columns: [
                        { field: "ฟิลด์1" },
                        { field: "ฟิลด์2" },
                        // ... เพิ่มคอลัมน์
                    ]
                }],
                column_schema: {
                    "ฟิลด์1": { 
                        label: "ป้ายกำกับ", 
                        flex: 10, 
                        align: "L",
                        data_type: "string" 
                    },
                    "ฟิลด์2": { 
                        label: "ตัวเลข", 
                        flex: 10, 
                        align: "R",
                        data_type: "number",
                        format: "#,##0.00"
                    }
                }
            }
        };

        const pdfRes = await fetch('/api/get-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pdfPayload),
        });

        if (pdfRes.ok) {
            const pdfBlob = await pdfRes.blob();
            const url = URL.createObjectURL(pdfBlob);
            setPdfUrl(url);
        }
    };

    return (
        <div>
            {/* UI Components */}
            <ThaiDatePicker value={startDate} onChange={setStartDate} />
            <ThaiDatePicker value={endDate} onChange={setEndDate} />
            <button onClick={handleGenerateResult} disabled={loading}>
                {loading ? 'กำลังสร้างรายงาน...' : 'ดูรายงาน'}
            </button>
            
            {pdfUrl && (
                <iframe src={pdfUrl} className="w-full h-screen" />
            )}
        </div>
    );
}
```

### Step 3: อัปเดตสิทธิ์การเข้าถึง
```typescript
// ในฟังก์ชันตรวจสอบสิทธิ์
const hasAccess = isAdmin || allowedReports.includes('SRRXXXXX');
```

## 🔌 API Endpoints

### `/api/generate-report`
**วัตถุประสงค์**: สร้างและดึงข้อมูลรายงาน

**Request Body:**
```typescript
{
    shopid: string;
    limit?: number;
    offset?: number;
    query_items: Array<{
        alias: string;
        query: string;
        summary_config?: {
            levels: Array<{
                group_by_fields: string[];
                sum_fields: string[];
                typejson: number;
            }>;
            grand_total?: boolean;
            grand_total_type?: number;
        };
    }>;
}
```

**Response:**
```typescript
{
    success: boolean;
    message?: string;
    guid?: string;
    detailRowCount?: number;
    data?: Record<string, {
        detail?: Record<string, unknown>[];
        summary?: Array<{
            linenumber?: number;
            level?: number;
            typejson?: number;
            data?: Record<string, unknown>;
        }>;
    }>;
}
```

### `/api/get-pdf`
**วัตถุประสงค์**: แปลงข้อมูลรายงานเป็น PDF

**Request Body:**
```typescript
{
    shopid: string;
    guid: string;
    pdf_config: {
        title: string;
        description: string;
        orientation: "L" | "P";
        page_size: "A4" | "A3" | "Letter";
        title_align?: "C" | "L" | "R";
        description_align?: "C" | "L" | "R";
    };
    layout_config: {
        schema_version: number;
        styles?: {
            header?: StyleConfig;
            detail?: StyleConfig;
            summary?: StyleConfig;
            level_1?: StyleConfig;
        };
        sections: Array<{
            alias: string;
            row_type: "detail" | "summary";
            columns: Array<{ field: string }>;
        }>;
        column_schema: Record<string, ColumnConfig>;
    };
}
```

### `/api/mongodb/get`
**วัตถุประสงค์**: ดึงข้อมูลจาก MongoDB

**Request Body:**
```typescript
{
    collection: string;
    filter: Record<string, any>;
    sort?: Record<string, 1 | -1>;
    limit?: number;
}
```

### `/api/mongodb/update`
**วัตถุประสงค์**: อัปเดต/เพิ่มข้อมูลใน MongoDB

**Request Body:**
```typescript
{
    collection: string;
    filter: Record<string, any>;
    data: Record<string, any>;
    upsert?: boolean;
}
```

## 🗄️ Database Schema

### MongoDB Collections

#### `report_access_logs`
```typescript
{
    shopid: string;
    email: string;
    report_name: string;
    conditions: string;
    created_at: string;
    updated_at: string;
}
```

#### Report Schedules (สำหรับการส่งอัตโนมัติ)
```typescript
{
    shopid: string;
    report_name: string;
    email_list: string[];
    schedule_config: {
        frequency: "daily" | "weekly" | "monthly";
        day_of_week?: number; // 0-6 for weekly
        day_of_month?: number; // 1-31 for monthly
        time: string; // HH:mm format
    };
    conditions: string; // ช่วงวันที่หรือเงื่อนไข
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
```

## 📄 PDF Configuration

### Column Schema Types
```typescript
// ข้อมูลทั่วไป
"field_name": {
    label: "ป้ายกำกับที่แสดง",
    flex: 10, // ความกว้างสัมพัทธ์
    align: "L" | "C" | "R", // จัดชิดซ้าย, กลาง, ขวา
    data_type: "string" | "number" | "date",
    format?: string; // รูปแบบการแสดงผล
    use_buddhist_year?: boolean; // ใช้ปี พ.ศ. สำหรับวันที่
    text_color_negative?: string; // สีข้อความเมื่อเป็นค่าติดลบ
}
```

### Style Configurations
```typescript
"styles": {
    "use_fill": false,
    "header": {
        "background": "#FFFFFF",
        "text": "#000000",
        "border": "#000000",
        "font_weight": "bold"
    },
    "detail": {
        "background": "#FFFFFF",
        "text": "#000000",
        "border": "#E0E0E0"
    },
    "summary": {
        "background": "#F5F5F5",
        "text": "#000000",
        "border": "#000000",
        "font_weight": "bold"
    }
}
```

## 🔐 Permissions & Security

### User Session Structure
```typescript
interface UserSession {
    user: {
        email: string;
        isAdmin?: boolean;
        allowed_reports?: string[]; // ['SRR40001', 'SRRXXXXX']
    };
}
```

### Access Control Pattern
```typescript
// ตรวจสอบสิทธิ์การเข้าถึงรายงาน
const isAdmin = session?.user?.isAdmin;
const allowedReports = (session?.user as any)?.allowed_reports || [];
const hasAccess = isAdmin || allowedReports.includes('REPORT_CODE');

if (!hasAccess) {
    router.push('/');
    return;
}
```

### วิธีเพิ่มสิทธิ์ให้ผู้ใช้
1. เพิ่มรหัสรายงานใน `allowed_reports` array ของผู้ใช้
2. หรือตั้งค่า `isAdmin: true` สำหรับผู้ดูแลระบบ

## 🚨 Error Handling

### Client-Side Error Handling
```typescript
const handleGenerateResult = async () => {
    setError(null);
    
    if (!startDate || !endDate) {
        setError('กรุณาเลือกช่วงเวลา');
        return;
    }

    try {
        const response = await fetch('/api/generate-report', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            setError(errorData?.error || 'เกิดข้อผิดพลาด');
            return;
        }

        const result = await response.json();
        if (!result.success) {
            setError(result?.error || result?.message || 'ไม่สามารถสร้างรายงานได้');
            return;
        }

        // ดำเนินการต่อ...
    } catch (error: any) {
        console.error('Error:', error);
        setError(error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
};
```

### API Error Response Format
```typescript
{
    success: false,
    error: "ข้อความแสดงข้อผิดพลาด",
    details?: any,
    status?: number,
    guid?: string
}
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] ทดสอบการเลือกช่วงวันที่
- [ ] ทดสอบปุ่ม preset date ranges
- [ ] ทดสอบการสร้างรายงาน
- [ ] ทดสอบการแสดงผล PDF
- [ ] ทดสอบการจัดการ error cases
- [ ] ทดสอบสิทธิ์การเข้าถึง
- [ ] ทดสอบการบันทึก log

### Debug Configuration
```bash
# เปิด debug mode
DEBUG=true
NEXT_PUBLIC_DEBUG=true

# Backend URL (local development)
BACKEND_URL=http://localhost:8108/v1
```

## 🛠️ Common Development Tasks

### เพิ่มคอลัมน์ใหม่ในรายงาน
1. อัปเดต SQL query ในหน้ารายงาน
2. เพิ่ง column definition ใน `column_schema`
3. ทดสอบการแสดงผล

### เปลี่ยนการจัดเรียงข้อมูล
```typescript
// ใน SQL query
order by field1, field2

// หรือใน summary_config
sum_fields: ["field1", "field2"]
group_by_fields: ["field1"]
```

### เพิ่มการคำนวณใหม่
```typescript
// ใน SQL query
(field1 * field2) as "ผลลัพธ์"
sum(field1) over() as "รวมทั้งหมด"
```

### สร้างรายงานที่มีหลาย sections
```typescript
query_items: [
    {
        alias: "section1",
        query: "SELECT ...",
        summary_config: { /* config */ }
    },
    {
        alias: "section2", 
        query: "SELECT ...",
        summary_config: { /* config */ }
    }
]

// ใน layout_config.sections
sections: [
    { alias: "section1", columns: [...] },
    { alias: "section2", columns: [...] }
]
```

## 📝 Best Practices

1. **SQL Query**: ใช้ parameterized queries และตรวจสอบ SQL injection
2. **Error Messages**: ใช้ข้อความที่เข้าใจง่ายสำหรับผู้ใช้
3. **Performance**: จำกัดจำนวนรายการด้วย `limit`
4. **Security**: ตรวจสอบสิทธิ์การเข้าถึงทุกครั้ง
5. **Logging**: บันทึกการใช้งานรายงานเสมอ
6. **Testing**: ทดสอบกับข้อมูลจริงและ edge cases

## 🚀 Deployment Notes

1. ตรวจสอบ environment variables
2. อัปเดต `BACKEND_URL` สำหรับ production
3. ตรวจสอบ MongoDB connection
4. ทดสอบ PDF generation ใน production environment

## 📞 Support

หากพบปัญหาหรือต้องการความช่วยเหลือ:
- ตรวจสอบ console logs
- ดู API response details
- ตรวจสอบ network requests
- ทดสอบใน development environment ก่อน