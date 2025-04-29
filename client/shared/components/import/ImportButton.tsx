import React, { useCallback, useRef } from 'react';
import { Button } from 'react-admin';
import UploadIcon from '@mui/icons-material/FileUpload';
import { ExcelImportInput } from './ExcelImportInput';

export const ImportButton = ({ fields, handleDataParse, xlsxOptions, ...props }) => {
    const fileSelector = useRef();

    const handleFileSelect = useCallback((e) => {
        e.preventDefault();
        fileSelector.current?.click();
    }, []);

    return <>
        <Button onClick={handleFileSelect} label={'ra.action.import'} startIcon={<UploadIcon />} {...props} />
        <ExcelImportInput ref={fileSelector} fields={fields} onDataParsed={handleDataParse} xlsxOptions={xlsxOptions} />
    </>
}