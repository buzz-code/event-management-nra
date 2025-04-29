import { DateField, DateTimeInput, ImageField, maxLength, ReferenceField, required, TextField, TextInput } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { CommonJsonField, CommonJsonInput } from '@shared/components/fields/CommonJsonItem';
import { CommonImageInput } from '@shared/components/fields/CommonImageInput';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';
import { useUnique } from '@shared/utils/useUnique';
import { CommonReferenceInputFilter } from '@shared/components/fields/CommonReferenceInputFilter';

const filters = [
    ({ isAdmin }) => isAdmin && <CommonReferenceInputFilter source="userId" reference="user" />,
];

const Datagrid = ({ isAdmin, children, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {children}
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            {/* <CommonJsonField source="fileData" /> */}
            <ImageField source="fileData.src" title="fileData.title" />
            <TextField source="imageTarget" />
            {isAdmin && <DateField showDate showTime source="createdAt" />}
            {isAdmin && <DateField showDate showTime source="updatedAt" />}
        </CommonDatagrid>
    );
}

const imageTargetEnum = ['לוגו לתעודה', 'לוגו לתחתית התעודה'];

const Inputs = ({ isCreate, isAdmin }) => {
    const unique = useUnique();

    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        {isAdmin && <CommonReferenceInput source="userId" reference="user" validate={required()} />}
        {/* <CommonJsonInput source="fileData" /> */}
        <CommonImageInput source="fileData" validate={required()} />
        <CommonAutocompleteInput source="imageTarget" choices={imageTargetEnum.map(item => ({ id: item, name: item }))} validate={[required(), maxLength(255), unique()]} />
        {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
    </>;
}

const Representation = CommonRepresentation;

const entity = {
    Datagrid,
    Inputs,
    Representation,
    filters,
    exporter: false,
};

export default getResourceComponents(entity);
