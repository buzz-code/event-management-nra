import { useMemo } from "react";
import { ArrayField, ChipField, SingleFieldList, useRecordContext } from "react-admin";
import get from 'lodash/get';

export const CommonSelectArrayField = ({ source, choices }) => {
    const record = useRecordContext();
    const choicesMap = useMemo(() => Object.fromEntries(choices.map(({ id, name }) => [id, name])), [choices]);

    if (!record || !get(record, source)) {
        return null;
    }

    const value = get(record, source);
    const listValue = {
        data: value.map(item => ({ item, name: choicesMap[item] ?? item })),
    }

    return (
        <ArrayField record={listValue} source="data">
            <SingleFieldList>
                <ChipField source="name" />
            </SingleFieldList>
        </ArrayField>
    )
}
