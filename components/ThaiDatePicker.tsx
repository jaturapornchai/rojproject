'use client';

import { th } from 'date-fns/locale';
import React from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// Register Thai locale
registerLocale('th', th);

interface ThaiDatePickerProps {
    value: Date | null;
    onChange: (date: Date | null) => void;
    label?: string;
}

export default function ThaiDatePicker({ value, onChange, label }: ThaiDatePickerProps) {
    // Custom header to show B.E. years
    const renderCustomHeader = ({
        date,
        changeYear,
        changeMonth,
        decreaseMonth,
        increaseMonth,
        prevMonthButtonDisabled,
        nextMonthButtonDisabled,
    }: any) => {
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i); // range around current year

        const months = [
            "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
            "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
        ];

        return (
            <div className="flex items-center justify-between px-2 py-2 bg-white border-b border-slate-200">
                <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled} className="p-1 hover:bg-slate-100 rounded text-slate-600">
                    {"<"}
                </button>

                <div className="flex gap-2">
                    <select
                        value={months[date.getMonth()]}
                        onChange={({ target: { value } }) =>
                            changeMonth(months.indexOf(value))
                        }
                        className="text-sm font-medium text-slate-700 bg-transparent cursor-pointer outline-none hover:text-blue-600"
                    >
                        {months.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>

                    <select
                        value={date.getFullYear()}
                        onChange={({ target: { value } }) =>
                            changeYear(Number(value))
                        }
                        className="text-sm font-bold text-slate-900 bg-transparent cursor-pointer outline-none hover:text-blue-600"
                    >
                        {years.map((option) => (
                            <option key={option} value={option}>
                                {option + 543}
                            </option>
                        ))}
                    </select>
                </div>

                <button onClick={increaseMonth} disabled={nextMonthButtonDisabled} className="p-1 hover:bg-slate-100 rounded text-slate-600">
                    {">"}
                </button>
            </div>
        );
    };

    // Custom Input to display B.E. date
    const CustomInput = React.forwardRef(({ value, onClick }: any, ref: any) => {
        // Value comes in as formatted string from DatePicker if we set dateFormat, 
        // but we want full control.
        // Let's format it manually here to ensure B.E.

        let displayText = "";
        if (value) {
            // The value passed by DatePicker is based on dateFormat prop.
            // If we pass the Date object directly to CustomInput, we can format it.
            // But DatePicker passes a string.
            // So we rely on the parent passing the correct 'selected' prop to DatePicker,
            // and we can use the 'value' prop here which is the formatted string.
            // Let's use a trick: The 'value' prop in CustomInput is what DatePicker formatted.
            // We will configure DatePicker to format it nicely, but we need to inject +543.

            // Actually, simpler: We have the `value` prop in the main component (Date object).
            // We can ignore the `value` prop passed to CustomInput and use our own formatting of the `value` prop from props.
        }

        const date = value ? new Date() : null; // This is tricky because 'value' is string.
        // Better approach: Format the display text inside the main component and pass it down?
        // Or just use the `dateFormat` function of DatePicker.

        return (
            <button
                className="w-full px-3 py-2 text-left bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between group"
                onClick={onClick}
                ref={ref}
            >
                <span className="text-black font-medium">
                    {value || "เลือกวันที่"}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
            </button>
        );
    });
    CustomInput.displayName = 'CustomInput';

    // Format function for the input display
    const formatDisplay = (date: Date | null) => {
        if (!date) return "";
        const year = date.getFullYear() + 543;
        const month = date.toLocaleDateString('th-TH', { month: 'long' });
        const day = date.getDate();
        return `${day} ${month} ${year}`;
    };

    return (
        <div className="w-full">
            {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
            <DatePicker
                selected={value}
                onChange={onChange}
                locale="th"
                renderCustomHeader={renderCustomHeader}
                customInput={<CustomInput />}
                dateFormat="d MMMM yyyy" // This is used for the 'value' prop passed to CustomInput, but we override it?
                // Actually, let's just use the valueFormatter approach
                value={formatDisplay(value)} // Override the string value passed to input
            />
        </div>
    );
}
