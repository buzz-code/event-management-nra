import { defaultSortBy, getDynamicFilter } from '@shared/utils/referenceUtil';
import * as React from 'react';
import { AutocompleteInputProps, ReferenceInput, ReferenceInputProps, FormDataConsumer } from 'react-admin';
import CommonAutocompleteInput from './CommonAutocompleteInput';

type CommonReferenceInputProps = ReferenceInputProps & AutocompleteInputProps & {
    dynamicFilter?: Record<string, string>;
};

export default (props: CommonReferenceInputProps) => {
    const getFilterByFormData = React.useCallback((formData) => {
        return {
            ...(props.filter as any || {}),
            ...getDynamicFilter(props.dynamicFilter, formData),
        };;
    }, [props.dynamicFilter, props.filter]);

    return (
        <FormDataConsumer>
            {({ formData, ...rest }) => (
                <ReferenceInput sort={defaultSortBy} {...props} validate={undefined} filter={getFilterByFormData(formData)}>
                    <CommonAutocompleteInput {...props} />
                </ReferenceInput>
            )}</FormDataConsumer>
    );
}