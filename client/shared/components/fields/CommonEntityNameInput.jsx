import { useGetResourceLabel, useResourceDefinitions } from 'react-admin';
import CommonAutocompleteInput from './CommonAutocompleteInput';

export const CommonEntityNameInput = ({ source, disabled, allowedEntities = [], ...props }) => {
    const resources = useResourceDefinitions();
    const getResourceLabel = useGetResourceLabel();
    const resourceChoices = Object.keys(resources)
        .filter(key => allowedEntities.length === 0 || allowedEntities.includes(key))
        .map(key => ({ id: key, name: getResourceLabel(key) }))

    return (
        <CommonAutocompleteInput source={source} choices={resourceChoices} disabled={disabled} {...props} />
    )
}
