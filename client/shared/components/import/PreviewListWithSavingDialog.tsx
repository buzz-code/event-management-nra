import React, { useState, useCallback } from 'react';
import { useNotify } from 'react-admin';
import { useMutation } from '@tanstack/react-query';
import { handleError } from '@shared/utils/notifyUtil';
import { useIsAdmin } from "@shared/utils/permissionsUtil";
import { PreviewListDialog } from './PreviewListDialog';

export const PreviewListWithSavingDialog = ({ resource, datagrid, data, saveData, refetch, handleSuccess, handlePreviewCancel }) => {
    const isAdmin = useIsAdmin();
    const [tryAgain, setTryAgain] = useState(false);
    const notify = useNotify();

    const { mutate, isPending } = useMutation({
        mutationFn: () => saveData(),
        onSuccess: ({ successCount, errorCount }) => {
            if (errorCount === 0 && successCount > 0) {
                handlePreviewCancel();

                notify('ra.message.import_success', { type: 'info' });
                refetch?.();
                handleSuccess?.();
            } else if (successCount > 0) {
                notify('ra.message.import_partial_error', { type: 'warning' });
                refetch?.();
                setTryAgain(true);
            } else {
                notify('ra.message.import_error', { type: 'error' });
            }
        },
        onError: handleError(notify)
    });

    const handlePreviewClose = useCallback((isSave, userId) => {
        if (isSave) {
            if (isAdmin && userId) {
                data.forEach(item => {
                    item.userId = userId;
                });
            }
            mutate();
        } else {
            handlePreviewCancel();
        }
    }, [isAdmin, data, mutate, handlePreviewCancel]);

    return (
        <PreviewListDialog resource={resource} data={data} isLoading={isPending}
            tryAgain={tryAgain} datagrid={datagrid} onDialogClose={handlePreviewClose} />
    );
};
