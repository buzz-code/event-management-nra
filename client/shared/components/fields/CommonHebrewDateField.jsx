import { useRecordContext } from 'react-admin';
import get from 'lodash/get';
import { formatJewishDateInHebrew, toJewishDate } from 'jewish-date';
import { useMemo } from 'react';

export const CommonHebrewDateField = ({ source }) => {
    const record = useRecordContext();

    if (!record || !get(record, source)) {
        return null;
    }

    const jewishDate = useMemo(() => convertDateToHebrew(get(record, source)), [record, source]);

    return (
        <span>{jewishDate}</span>
    )
}

export function convertDateToHebrew(value) {
    const date = new Date(value);
    const jewishDate = toJewishDate(date);
    const formattedJewishDate = formatJewishDateInHebrew(jewishDate);
    return formattedJewishDate;
}
