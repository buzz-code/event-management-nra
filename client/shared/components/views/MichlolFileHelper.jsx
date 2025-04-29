import React, { useCallback, useRef } from 'react';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useDataProvider, useNotify, Button } from 'react-admin';
import { handleActionSuccess, handleError } from '@shared/utils/notifyUtil';
import { readAsExcel } from '@shared/utils/fileUtil';

const fromAToI = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
const MichlolFileHelper = () => {
    const dataProvider = useDataProvider();
    const fileSelector = useRef();
    const notify = useNotify();

    const handleFileSelect = useCallback((e) => {
        e.preventDefault();
        fileSelector.current?.click();
    }, []);

    const handleFileUpload = useCallback(async (e) => {
        const { files } = e.target;
        if (files && files.length) {
            const data = await readAsExcel(files[0], fromAToI, { range: 0 });
            const body = { data };
            const queryParams = { 'extra.fileName': files[0].name };
            dataProvider.actionAndDownload('grade', 'michlolPopulatedFile', queryParams, body)
                .then(handleActionSuccess(notify))
                .catch(handleError(notify));
        }
        e.target.value = null;
    }, [dataProvider]);

    return (
        <Container maxWidth="sm" mt={4}>
            <Paper>
                <Stack>
                    <Box padding={2}>
                        <Typography variant="h6" component="div">
                            עדכון קבצים
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            בחר את הקובץ שתרצה למלא
                        </Typography>
                    </Box>
                    <Divider />
                    <Box padding={2}>
                        <Button icon={<FileUploadIcon />} label='בחר קובץ' onClick={handleFileSelect} />
                        <input
                            type='file' accept='.csv, .xls, .xlsx' style={{ display: 'none' }}
                            ref={fileSelector} onChange={handleFileUpload} />
                    </Box>
                </Stack>
            </Paper>
        </Container>
    );
}

export default MichlolFileHelper;
