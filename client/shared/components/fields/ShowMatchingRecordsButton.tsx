import * as React from 'react';
import { useCreatePath, useRecordContext, Button, Link } from "react-admin";
import ListIcon from '@mui/icons-material/List';
import get from 'lodash/get';

export const ShowMatchingRecordsButton = ({ source, resource, resourceField, filter, ...props }) => {
    const record = useRecordContext();
    const createPath = useCreatePath();

    if (!record || (!!source && !get(record, source))) return null;

    const resourceValue = resource ?? record?.[resourceField];
    const filterValue = filter ?? { 'id:$in': get(record, source) };

    return (
        <Button label='ra.action.show_matching_records' startIcon={<ListIcon />}
            component={Link}
            to={{
                pathname: createPath({ resource: resourceValue, type: 'list' }),
                search: `filter=${JSON.stringify(filterValue)}`
            }}
            onClick={e => e.stopPropagation()} />
    );
}
