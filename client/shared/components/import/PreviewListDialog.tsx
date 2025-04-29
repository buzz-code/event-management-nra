import React, { useCallback, useState } from "react";
import { Button, Form, ListContextProvider, ResourceContextProvider, useList, useResourceContext, useTranslate } from "react-admin";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';
import { ImportStatusField } from "./ImportStatusField";
import { useIsAdmin } from "@shared/utils/permissionsUtil";
import CommonReferenceInput from "@shared/components/fields/CommonReferenceInput";

export const PreviewListDialog = ({ resource, data, isLoading, tryAgain, datagrid, onDialogClose }) => {
    const dataResource = useResourceContext({ resource });
    const isAdmin = useIsAdmin();
    const listContext = useList({ data });
    const translate = useTranslate();
    const [userId, setUserId] = useState(null);
    const Datagrid = datagrid;

    const closeDialog = useCallback(() => {
        onDialogClose(false);
    }, [onDialogClose]);

    const importAndCloseDialog = useCallback(() => {
        onDialogClose(true, userId);
    }, [onDialogClose, userId]);

    return (
        <Dialog
            open={!!data} onClose={closeDialog}
            scroll='paper' dir='rtl' fullWidth maxWidth='lg'>
            <DialogTitle>
                {translate('ra.message.import_title')}
            </DialogTitle>
            <DialogContent>
                {isLoading && <LinearProgress />}
                {isAdmin && (
                    <Form>
                        <CommonReferenceInput source="userId" reference="user" onChange={setUserId} />
                    </Form>
                )}
                <ListContextProvider value={listContext}>
                    <ResourceContextProvider value={dataResource}>
                        <Datagrid readonly isAdmin={isAdmin} bulkActionButtons={null}>
                            <ImportStatusField />
                        </Datagrid>
                    </ResourceContextProvider>
                </ListContextProvider>
            </DialogContent>
            <DialogActions>
                <Button onClick={closeDialog} autoFocus disabled={isLoading} label={translate('ra.action.cancel')} />
                <Button onClick={importAndCloseDialog} disabled={isLoading} label={tryAgain ? translate('ra.action.import_again') : translate('ra.action.import')} />
            </DialogActions>
        </Dialog >
    )
}