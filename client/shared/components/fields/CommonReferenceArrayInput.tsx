import { defaultSortBy, getDynamicFilter } from '@shared/utils/referenceUtil';
import * as React from 'react';
import { AutocompleteInputProps, FormDataConsumer, ReferenceArrayInputProps, ReferenceArrayInput } from 'react-admin';
import CommonAutocompleteInput from './CommonAutocompleteInput';

type CommonReferenceArrayInputProps = ReferenceArrayInputProps & AutocompleteInputProps & {
    dynamicFilter: Record<string, string>;
};

export default (props: CommonReferenceArrayInputProps) => {
    const getFilterByFormData = React.useCallback((formData) => {
        return {
            ...(props.filter as any || {}),
            ...getDynamicFilter(props.dynamicFilter, formData),
        };;
    }, [props.dynamicFilter, props.filter]);

    return (
        <FormDataConsumer>
            {({ formData, ...rest }) => (
                <ReferenceArrayInput sort={defaultSortBy} {...props} filter={getFilterByFormData(formData)}>
                    <CommonAutocompleteInput multiple {...props} />
                </ReferenceArrayInput>
            )}</FormDataConsumer>
    );
}