import React from "react";
import { useRecordContext, useTranslate } from "react-admin";
import get from 'lodash/get';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import AdjustIcon from '@mui/icons-material/Adjust';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { STATUSES } from "./util";

export const ImportStatusField = ({ ...props }) => {
    const record = useRecordContext(props);
    const translate = useTranslate();

    if (!record) return null;
    const status = get(record, 'status');
    const error = get(record, 'error');

    return (
        <>
            <StatusIcon status={status} />
            <StatusText status={status} error={error} translate={translate} />
        </>
    );
}

const StatusIcon = ({ status }) => {
    if (!status) return <ArrowCircleUpIcon color='disabled' />;
    if (status === STATUSES.pending) return <AdjustIcon color='action' />;
    if (status === STATUSES.success) return <CheckCircleOutlineIcon color='success' />;
    if (status === STATUSES.error) return <ErrorOutlineIcon color='error' />;
    return <>מצב לא ידוע</>;
}

const StatusText = ({ status, error, translate }) => {
    if (!status) return <></>;
    if (status === STATUSES.pending) return <>{translate('ra.message.pending')}</>;
    if (status === STATUSES.success) return <>{translate('ra.notification.created')}</>;
    if (status === STATUSES.error) return <>{translate('ra.page.error')}: {error}</>;
    return <></>;
}