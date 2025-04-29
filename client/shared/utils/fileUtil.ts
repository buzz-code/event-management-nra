import * as XLSX from 'xlsx';

export const readAsDataURL = (file: File): Promise<string> => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onload = (event) => resolve((event.target.result) as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
};

export const readAsBinaryString = (file: File): Promise<string> => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onload = (event) => resolve((event.target.result) as string);
        reader.onerror = (err) => reject(err);
        reader.readAsBinaryString(file);
    });
};

export const readAsExcel = (file: File, fields: string[], xlsxOptions = {}) => {
    return readAsBinaryString(file)
        .then(bstr => {
            const workbook = XLSX.read(bstr, { type: 'binary', cellText: false, cellDates: true });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            return XLSX.utils.sheet_to_json(worksheet, { header: fields, range: 1, ...xlsxOptions });
        });
}
