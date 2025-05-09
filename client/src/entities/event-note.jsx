import { DateField, DateTimeInput, maxLength, ReferenceField, required, TextField, TextInput } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { CommonReferenceInputFilter } from '@shared/components/fields/CommonReferenceInputFilter';
import { commonAdminFilters } from '@shared/components/fields/PermissionFilter';

const filters = [
    ...commonAdminFilters,
    <CommonReferenceInputFilter source="eventReferenceId" reference="event" alwaysOn />,
    <TextInput source="noteText:$cont" alwaysOn />,
];

const Datagrid = ({ isAdmin, children, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {children}
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <ReferenceField source="eventReferenceId" reference="event" />
            <TextField source="noteText" />
            {isAdmin && <DateField showDate showTime source="createdAt" />}
            {isAdmin && <DateField showDate showTime source="updatedAt" />}
        </CommonDatagrid>
    );
}

const Inputs = ({ isCreate, isAdmin }) => {
    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        {isAdmin && <CommonReferenceInput source="userId" reference="user" validate={required()} />}
        <CommonReferenceInput source="eventReferenceId" reference="event" validate={required()} />
        <TextInput source="noteText" multiline validate={[required(), maxLength(2000)]} />
        {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
    </>
}

const Representation = 'noteText';

const importer = {
    fields: ['eventReferenceId', 'noteText'],
}

const entity = {
    Datagrid,
    Inputs,
    Representation,
    filters,
    importer,
};

export default getResourceComponents(entity);