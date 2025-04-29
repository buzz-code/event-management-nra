import * as React from 'react';
import { AutocompleteInput, AutocompleteInputProps } from 'react-admin';

const filterToQuery = searchText => ({ 'name:$contL': searchText });

export default (props: AutocompleteInputProps) => {
    return (
        <AutocompleteInput noOptionsText={'ra.message.no_options'} filterToQuery={filterToQuery} {...props} />
    );
}