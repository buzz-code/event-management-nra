import { useState, useCallback } from 'react';
import { useSavableData } from '../import/util';
import { ImportButton } from '../import/ImportButton';
import { PreviewListWithSavingDialog } from '../import/PreviewListWithSavingDialog';

export const ResourceImportButton = ({ resource, refetch = null, fields, handleDataBeforePreview = null, xlsxOptions = {}, datagrid, handleSuccess = null, ...props }) => {
    const [uploadedData, setUploadedData] = useState(null);
    const [fileName, setFileName] = useState(null);
    const { data, saveData } = useSavableData(resource, fileName, uploadedData);

    const handleDataParse = useCallback(async ({ name, data }) => {
        const dataToSave = handleDataBeforePreview ? await handleDataBeforePreview(data) : data;
        setUploadedData(dataToSave);
        setFileName(name);
    }, [setUploadedData, setFileName]);

    const handlePreviewCancel = useCallback(() => {
        setUploadedData(null);
        setFileName(null);
    }, [setUploadedData, setFileName]);

    return <>
        <ImportButton fields={fields} handleDataParse={handleDataParse} xlsxOptions={xlsxOptions} {...props} />
        <PreviewListWithSavingDialog resource={resource} datagrid={datagrid}
            data={data} saveData={saveData}
            refetch={refetch} handleSuccess={handleSuccess} handlePreviewCancel={handlePreviewCancel} />
    </>
}
