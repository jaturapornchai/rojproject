# วิธีการใช้ Query เพื่ออ่าน Guide ในรายงาน

## 🎯 วิธีการทำงาน

ระบบรายงานแต่ละตัวจะมี SQL Query ที่ใช้ดึงข้อมูลจากฐานข้อมูล ซึ่งเราสามารถนำมาใช้เป็นตัวอย่างในการพัฒนารายงานใหม่ได้

## 📝 ตัวอย่าง SQL Query ในรายงานเดิม (SRR40001)

```sql
const baseQuery = `select 
doc_date as docdate,
doc_no as docno,
(select name_1 from ar_customer where ar_customer.code = ic_trans_detail.cust_code) as "ชื่อลูกค้า",
item_code as "รหัสสินค้า",
item_name as "ชื่อสินค้า",
wh_code as "คลัง",
qty as "จำนวน",
unit_code as "หน่วย",
price as "ราคาขาย",
(sum_of_cost/qty) as "ราคาทุน",
sum_of_cost as "รวมต้นทุน",
sum_amount as "รวมราคาขาย",
(sum_amount-sum_of_cost) as "ผลต่าง" 
from ic_trans_detail 
where trans_flag = 44 and sum_amount<sum_of_cost
AND doc_date BETWEEN '${formatDate(startDate)}' AND '${formatDate(endDate)}'
order by doc_date, doc_no`;
```

## 🔍 วิธีการแทนที่ Query ในรายงานใหม่

### Step 1: คัดลอกโครงสร้างจากรายงานเดิม
```typescript
// แทนที่ส่วนนี้ในรายงานใหม่
const baseQuery = `-- ใส่ SQL Query ใหม่ที่นี่
select 
    field1 as "ชื่อฟิลด์1",
    field2 as "ชื่อฟิลด์2",
    field3 as "ชื่อฟิลด์3"
from table_name 
where conditions = 'value'
AND doc_date BETWEEN '${formatDate(startDate)}' AND '${formatDate(endDate)}'
order by field1`;
```

### Step 2: ปรับแต่ง Request Payload
```typescript
const requestPayload = {
    shopid: SHOP_ID_PUBLIC,
    limit: 5000,
    query_items: [
        {
            alias: "report_alias", // เปลี่ยนให้เหมาะสม
            query: baseQuery,
            summary_config: {
                levels: [
                    {
                        group_by_fields: ["field1"], // ฟิลด์สำหรับจัดกลุ่ม
                        sum_fields: ["ชื่อฟิลด์2", "ชื่อฟิลด์3"], // ฟิลด์ตัวเลขสำหรับรวม
                        typejson: 1
                    }
                ],
                grand_total: true,
                grand_total_type: 99
            }
        }
    ]
};
```

### Step 3: อัปเดต PDF Configuration
```typescript
const pdfPayload = {
    shopid: SHOP_ID_PUBLIC,
    guid,
    pdf_config: {
        title: "ชื่อรายงานใหม่ (SRRXXXXX)",
        description: `ตั้งแต่วันที่ ${formatThaiDateForPdf(startDate)} ถึงวันที่ ${formatThaiDateForPdf(endDate)}`,
        orientation: "L",
        page_size: "A4"
    },
    layout_config: {
        sections: [
            {
                alias: "report_alias",
                row_type: "detail",
                columns: [
                    { field: "ชื่อฟิลด์1" },
                    { field: "ชื่อฟิลด์2" },
                    { field: "ชื่อฟิลด์3" }
                ]
            }
        ],
        column_schema: {
            "ชื่อฟิลด์1": { 
                label: "ป้ายกำกับ1", 
                flex: 15, 
                align: "L" 
            },
            "ชื่อฟิลด์2": { 
                label: "ป้ายกำกับ2", 
                flex: 10, 
                align: "R",
                data_type: "number",
                format: "#,##0.00"
            },
            "ชื่อฟิลด์3": { 
                label: "ป้ายกำกับ3", 
                flex: 10, 
                align: "R",
                data_type: "number",
                format: "#,##0.00"
            }
        }
    }
};
```

## 📋 ตัวอย่าง Query Templates

### Template 1: รายงานขายทั่วไป
```sql
select 
    doc_date as docdate,
    doc_no as docno,
    cust_code as "รหัสลูกค้า",
    (select name_1 from ar_customer where ar_customer.code = ic_trans_detail.cust_code) as "ชื่อลูกค้า",
    sum_amount as "ยอดขาย",
    sum_of_cost as "ต้นทุน",
    (sum_amount - sum_of_cost) as "กำไร"
from ic_trans_detail 
where trans_flag = 44 -- ประเภทเอกสารขาย
AND doc_date BETWEEN '${formatDate(startDate)}' AND '${formatDate(endDate)}'
order by doc_date, doc_no
```

### Template 2: รายงานสินค้าคงคลัง
```sql
select 
    item_code as "รหัสสินค้า",
    item_name as "ชื่อสินค้า",
    wh_code as "คลัง",
    qty as "จำนวน",
    unit_code as "หน่วย",
    avg_cost as "ต้นทุนเฉลี่ย",
    (qty * avg_cost) as "มูลค่ารวม"
from ic_inventory 
where wh_code = '01' -- รหัสคลัง
AND last_update BETWEEN '${formatDate(startDate)}' AND '${formatDate(endDate)}'
order by item_code
```

### Template 3: รายงานลูกหนี้
```sql
select 
    cust_code as "รหัสลูกค้า",
    (select name_1 from ar_customer where ar_customer.code = ar_trans_detail.cust_code) as "ชื่อลูกค้า",
    sum(outstanding) as "ยอดคงค้าง",
    max(due_date) as "วันครบกำหนดล่าสุด"
from ar_trans_detail 
where outstanding > 0
AND doc_date BETWEEN '${formatDate(startDate)}' AND '${formatDate(endDate)}'
group by cust_code
order by sum(outstanding) desc
```

## 🛠️ วิธีการ Customize รายงาน

### เพิ่มคอลัมน์ใหม่
1. **ใน SQL Query**: เพิ่มฟิลด์ใหม่ใน SELECT
2. **ใน PDF Layout**: เพิ่ม columns ใหม่
3. **ใน Column Schema**: เพิ่ม definition ใหม่

### เปลี่ยนการจัดเรียง
```sql
-- เปลี่ยน ORDER BY ใน SQL
order by field1 desc, field2 asc

-- หรือเปลี่ยนใน summary_config
summary_config: {
    levels: [
        {
            group_by_fields: ["field1", "field2"],
            sum_fields: ["field3"],
            typejson: 1
        }
    ]
}
```

### เพิ่มเงื่อนไขการค้นหา
```sql
-- เพิ่มใน WHERE clause
where 
    trans_flag = 44 
    AND sum_amount < sum_of_cost -- เฉพาะที่ขาดทุน
    AND wh_code = '01' -- คลังที่กำหนด
    AND cust_code LIKE 'C%' -- ลูกค้ากลุ่ม C
```

## 🔧 การตั้งค่าขั้นสูง

### Multiple Query Items
```typescript
const requestPayload = {
    query_items: [
        {
            alias: "sales_detail",
            query: `SELECT ... FROM ic_trans_detail WHERE ...`,
            summary_config: { /* config */ }
        },
        {
            alias: "customer_summary", 
            query: `SELECT ... FROM ar_customer WHERE ...`,
            summary_config: { /* config */ }
        }
    ]
};
```

### Summary Configuration
```typescript
summary_config: {
    levels: [
        {
            group_by_fields: ["docdate", "cust_code"], // จัดกลุ่มตามวันที่และลูกค้า
            sum_fields: ["ยอดขาย", "ต้นทุน", "กำไร"], // รวมตัวเลข
            typejson: 1 // ประเภทการสรุป
        }
    ],
    grand_total: true, // แสดงยอดรวมทั้งหมด
    grand_total_type: 99
}
```

## 📝 การบันทึก Log

```typescript
const saveLog = async (conditions: string) => {
    try {
        const now = new Date().toISOString();
        const normalizedEmail = session?.user?.email?.toLowerCase() || 'unknown';
        await fetch('/api/mongodb/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                collection: 'report_access_logs',
                filter: {
                    shopid: SHOP_ID_PUBLIC,
                    email: normalizedEmail,
                    created_at: now,
                },
                data: {
                    shopid: SHOP_ID_PUBLIC,
                    email: normalizedEmail,
                    report_name: 'SRRXXXXX', // เปลี่ยนรหัสรายงาน
                    conditions: conditions,
                    created_at: now,
                    updated_at: now,
                },
                upsert: true,
            }),
        });
        fetchLogs();
    } catch (error) {
        console.error('Failed to save log', error);
    }
};
```

## 🎯 ข้อแนะนำ

1. **ทดสอบ SQL Query ก่อนใช้งาน**: ทดสอบใน Database Client ก่อนนำมาใส่ในโค้ด
2. **จำกัดจำนวนรายการ**: ใช้ `limit` เพื่อป้องกันการโหลดข้อมูลมากเกินไป
3. **ตั้งชื่อคอลัมน์ให้ชัดเจน**: ใช้ชื่อภาษาไทยใน alias เพื่อการแสดงผลที่เข้าใจง่าย
4. **จัดการ Error ให้ดี**: แสดงข้อความแจ้งเตือนที่เป็นมิตรกับผู้ใช้
5. **อัปเดต Permissions**: เพิ่มรหัสรายงานใหม่ในรายการสิทธิ์ของผู้ใช้