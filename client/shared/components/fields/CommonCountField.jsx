import { useRecordContext } from 'react-admin';
import get from 'lodash/get';

export const CommonCountField = ({ source }) => {
    const record = useRecordContext();

    if (!record || !get(record, source)) {
        return null;
    }

    return (
        <span>{get(record, source).length}</span>
    )
}
