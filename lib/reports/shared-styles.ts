/**
 * Shared PDF Styles for all reports in Project ROI
 * ปรับแต่งที่นี่ที่เดียวเพื่อให้ทุกรายงานมีรูปแบบ (Theme) เหมือนกันทั้งหมด
 */

export const SHARED_PDF_STYLES = {
    use_fill: false,
    header: {
        background: "#FFFFFF",
        text: "#000000",
        border: "#000000",
        font_weight: "bold"
    },
    detail: {
        background: "#FFFFFF",
        text: "#000000",
        border: "#E0E0E0" // เส้นขอบสีเทาอ่อนสำหรับรายการย่อย
    },
    summary: {
        background: "#F5F5F5",
        text: "#000000",
        border: "#000000",
        font_weight: "bold"
    },
    level_1: {
        background: "#F5F5F5",
        text: "#000000",
        border: "#000000",
        font_weight: "bold"
    },
    table: {
        row_spacing: 1.0, // เพิ่มระยะห่างระหว่างบรรทัดเล็กน้อยเพื่อความอ่านง่าย
        column_spacing: 1, // ลดระยะห่างคอลัมน์เล็กน้อยเพื่อให้ใส่ข้อมูลได้มากขึ้น
        grid_color: "#CCCCCC"
    }
};

/**
 * Standard PDF Page Config
 */
export const SHARED_PDF_PAGE_CONFIG = {
    title_align: "C",
    description_align: "L",
    orientation: "L" as const, // แนวนอนเป็นค่าเริ่มต้นสำหรับรายงานที่มีหลายคอลัมน์
    page_size: "A4" as const
};

/**
 * Common Number Formats
 */
export const SHARED_NUMBER_FORMATS = {
    currency: "#,##0.00",
    quantity: "#,##0.00",
    integer: "#,##0"
};

/**
 * Header Configuration Helper
 * @param title หัวข้อรายงาน
 * @param description คำอธิบาย (เช่น ช่วงวันที่)
 */
export const buildStandardPdfConfig = (title: string, description: string, orientation: "P" | "L" = "L") => ({
    title,
    description,
    ...SHARED_PDF_PAGE_CONFIG,
    orientation
});
