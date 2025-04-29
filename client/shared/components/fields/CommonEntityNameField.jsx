import { useGetResourceLabel, useRecordContext } from 'react-admin';
import get from 'lodash/get';

export const CommonEntityNameField = ({ source }) => {
    const record = useRecordContext();
    const getResourceLabel = useGetResourceLabel();

    if (!record || !get(record, source)) {
        return null;
    }

    return (
        <span>{getResourceLabel(get(record, source))}</span>
    )
}
