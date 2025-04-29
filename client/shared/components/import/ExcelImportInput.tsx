import { readAsExcel } from "@shared/utils/fileUtil";
import React, { forwardRef, useCallback } from "react";
import * as XLSX from 'xlsx';

export const ExcelImportInput = forwardRef<HTMLInputElement, any>(({ fields, onDataParsed, xlsxOptions = {} }, ref) => {
    const processFile = useCallback(file => {
        var name = file.name;
        readAsExcel(file, fields, xlsxOptions)
            .then(data => {
                fixDates(data);
                onDataParsed({ name, data });
            });
    }, [fields, onDataParsed]);

    const handleFileUpload = useCallback(e => {
        const { files } = e.target;
        if (files && files.length) {
            processFile(files[0]);
        }
        e.target.value = null;
    }, [processFile]);

    return (
        <input
            type='file' accept='.csv, .xls, .xlsx' style={{ display: 'none' }}
            ref={ref} onChange={handleFileUpload} />
    )
});

function fixDates(data: any[]) {
    data.forEach(row => {
        Object.keys(row).forEach(key => {
            if (row[key] instanceof Date) {
                const date = new Date(row[key].getTime() - row[key].getTimezoneOffset() * 60000 + 60000);
                row[key] = date.toISOString().slice(0, 10);
            }
        });
    });
}