import React, { useMemo } from 'react';
import { useRecordContext, ArrayField, SingleFieldList } from 'react-admin';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';

const YemotCallHistoryField = ({ source }) => (
    <ArrayField source={source}>
        <SingleFieldList>
            <YemotCallHistoryItem />
        </SingleFieldList>
    </ArrayField>
);

const YemotCallHistoryItem = () => {
    const record = useRecordContext();
    if (!record || !record.response) {
        return null;
    }

    const parsedResponse = useMemo(() => {
        return record.response?.split('&')
            .map((item) => {
                const [key, value] = item.split('=');
                return { key, value };
            })
            .filter(({ key, value }) => Boolean(value))
            .map(({ key, value }) => {
                const [type, text] = value.split('-');
                return text ?? value;
            })
            .join(', ');
    }, [record.response]);

    if (!parsedResponse) {
        return null;
    }

    return (
        <Tooltip title={record.time}>
            <Chip label={parsedResponse} />
        </Tooltip>
    );
}

export default YemotCallHistoryField;
