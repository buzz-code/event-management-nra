// filepath: /root/code-server/config/workspace/event-management-nra/client/src/entities/course-path.jsx
import { DateField, DateInput, DateTimeInput, maxLength, number, required, TextField, TextInput, NumberInput, NumberField, ReferenceField } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { CommonReferenceInputFilter } from '@shared/components/fields/CommonReferenceInputFilter';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';

const filters = [
    ({ isAdmin }) => isAdmin && <CommonReferenceInputFilter source="userId" reference="user" />,
    ({ isAdmin }) => isAdmin && <DateInput source="createdAt:$gte" />,
    ({ isAdmin }) => isAdmin && <DateInput source="createdAt:$lte" />,
    ({ isAdmin }) => isAdmin && <DateInput source="updatedAt:$gte" />,
    ({ isAdmin }) => isAdmin && <DateInput source="updatedAt:$lte" />,
    <TextInput source="name:$cont" alwaysOn />,
    <NumberInput source="key:$eq" />,
    <TextInput source="description:$cont" />,
];

const Datagrid = ({ isAdmin, children, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {children}
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <TextField source="name" />
            <NumberField source="key" />
            <TextField source="description" />
            {isAdmin && <DateField showDate showTime source="created_at" />}
            {isAdmin && <DateField showDate showTime source="updated_at" />}
        </CommonDatagrid>
    );
}

const Inputs = ({ isCreate, isAdmin }) => {
    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        {isAdmin && <CommonReferenceInput source="userId" reference="user" validate={required()} />}
        <TextInput source="name" validate={[required(), maxLength(255)]} />
        <NumberInput source="key" validate={[required(), number()]} />
        <TextInput source="description" validate={[maxLength(1000)]} multiline />
        {!isCreate && isAdmin && <DateTimeInput source="created_at" disabled />}
        {!isCreate && isAdmin && <DateTimeInput source="updated_at" disabled />}
    </>
}

const Representation = CommonRepresentation;

const importer = {
    fields: ['name', 'key', 'description'],
}

const entity = {
    Datagrid,
    Inputs,
    Representation,
    filters,
    importer,
};

export default getResourceComponents(entity);