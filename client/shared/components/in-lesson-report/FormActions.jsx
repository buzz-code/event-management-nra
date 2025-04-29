import React, { useContext } from 'react';
import { Box, Divider } from '@mui/material';
import { Button, SaveButton } from 'react-admin';
import { PreviewListWithSavingDialog } from '../import/PreviewListWithSavingDialog';
import { ReportContext } from './context';

export const FormActions = () => {
    const { resource, Datagrid, data, saveData, handleSuccess, handleCancel } = useContext(ReportContext);

    return (
        <>
            <Divider />
            <Box padding={2}>
                <Button onClick={handleCancel}><>ביטול</></Button>
                <SaveButton alwaysEnable />
            </Box>
            <PreviewListWithSavingDialog
                resource={resource}
                datagrid={Datagrid}
                data={data}
                saveData={saveData}
                handleSuccess={handleSuccess}
                handlePreviewCancel={handleCancel}
            />
        </>
    );
};