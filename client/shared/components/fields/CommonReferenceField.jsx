import { ChipField, ListBase, ReferenceArrayField, ReferenceField, ReferenceOneField, SingleFieldList, useRecordContext } from 'react-admin';
import get from 'lodash/get';

export const CommonReferenceField = ({ source, reference, target, ...props }) => (
    <MultiReferenceField optionalSource={source} reference={reference} optionalTarget={target} {...props} />
)

export const MultiReferenceField = ({ source, reference, optionalSource, optionalTarget, sortBy, ...props }) => {
    const record = useRecordContext();
    if (!record) {
        return null;
    }

    if (get(record, source)) {
        return (
            <ReferenceField source={source} reference={reference} sortBy={sortBy} {...props} />
        )
    }
    if (record[optionalSource]) {
        return (
            <ReferenceOneField source={optionalSource} reference={reference} target={optionalTarget} sortBy={sortBy} link={false} {...props} />
        )
    }

    return null;
}

export const MultiReferenceArrayField = ({ source, reference, optionalSource, optionalTarget, ...props }) => {
    const record = useRecordContext();
    if (!record) {
        return null;
    }

    if (get(record, source)) {
        return (
            <ReferenceArrayField source={source} reference={reference} {...props} />
        )
    }

    let optionalValue = get(record, optionalSource)
    if (typeof optionalValue === 'string' && optionalValue.includes(',')) {
        optionalValue = optionalValue.split(',')
    }

    if (optionalValue) {
        return (
            <ListBase resource={reference} filter={{ [optionalTarget]: optionalValue }}>
                <SingleFieldList linkType={false}>
                    <ChipField source="name" size="small" />
                </SingleFieldList>
            </ListBase>
        )
    }

    return null;
}
