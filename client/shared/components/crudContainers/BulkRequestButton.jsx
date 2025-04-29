import { useCallback, useState } from 'react';
import { Button, Form, useTranslate, SaveButton, useStore, useResourceContext, useRefresh } from 'react-admin';
import DownloadingIcon from '@mui/icons-material/Downloading';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';

export const BulkRequestButton = ({ label, name, mutate, isLoading, icon, defaultRequestValues = {}, requestValues = {}, reloadOnEnd = false, children }) => {
    const [showDialog, setShowDialog] = useState(false);
    const translate = useTranslate();
    const resource = useResourceContext();
    const refresh = useRefresh();
    const [cachedRequestValues, setRequestValues] = useStore('common.BulkRequestButton.' + resource + '.' + name, defaultRequestValues);

    const doMutation = useCallback(async (dataToSend) => {
        await mutate(dataToSend);
        if (reloadOnEnd) {
            refresh();
        }
    }, [mutate, reloadOnEnd, refresh]);
    const handleButtonClick = useCallback(() => {
        if (!children) {
            doMutation({});
        } else {
            setShowDialog(true);
        }
    }, [children, doMutation, setShowDialog]);
    const handleDialogClose = useCallback(() => {
        setShowDialog(false);
    }, [setShowDialog]);
    const handleSubmit = useCallback((formValues) => {
        setRequestValues(formValues);
        handleDialogClose();
        const requestData = {
            ...formValues,
            ...requestValues,
        };
        const dataToSend = Object.fromEntries(Object.entries(requestData).map(([key, value]) => (['extra.' + key, value])));
        doMutation(dataToSend);
    }, [requestValues, setRequestValues, handleDialogClose, doMutation]);

    return <>
        <Button label={label} onClick={handleButtonClick} disabled={isLoading}>
            {isLoading ? loader : icon}
        </Button>

        <Dialog onClose={handleDialogClose} open={showDialog} fullWidth>
            <DialogTitle>
                {translate('ra.bulk_request.params_dialog_title')}
            </DialogTitle>
            <Form onSubmit={handleSubmit} defaultValues={cachedRequestValues}>
                <DialogContent>
                    <Stack>
                        {children}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} label={translate('ra.action.cancel')} />
                    <SaveButton alwaysEnable autoFocus variant='text' icon={null} label={translate('ra.action.confirm')} />
                </DialogActions>
            </Form>
        </Dialog>
    </>
}

const loader = <DownloadingIcon />;
