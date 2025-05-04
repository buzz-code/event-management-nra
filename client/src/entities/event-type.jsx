import { DateField, DateInput, DateTimeInput, maxLength, ReferenceField, required, TextField, TextInput, NumberInput, NumberField, number } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { CommonReferenceInputFilter } from '@shared/components/fields/CommonReferenceInputFilter';

const filters = [
    ({ isAdmin }) => isAdmin && <CommonReferenceInputFilter source="userId" reference="user" />,
    ({ isAdmin }) => isAdmin && <DateInput source="createdAt:$gte" />,
    ({ isAdmin }) => isAdmin && <DateInput source="createdAt:$lte" />,
    ({ isAdmin }) => isAdmin && <DateInput source="updatedAt:$gte" />,
    ({ isAdmin }) => isAdmin && <DateInput source="updatedAt:$lte" />,
    <TextInput source="name:$cont" alwaysOn />,
    <NumberInput source="key:$eq" />,
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
            {isAdmin && <DateField showDate showTime source="createdAt" />}
            {isAdmin && <DateField showDate showTime source="updatedAt" />}
        </CommonDatagrid>
    );
}

const Inputs = ({ isCreate, isAdmin }) => {
    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        {isAdmin && <CommonReferenceInput source="userId" reference="user" validate={required()} />}
        <TextInput source="name" validate={[required(), maxLength(100)]} />
        <NumberInput source="key" validate={[required(), number()]} />
        <TextInput source="description" multiline validate={[maxLength(500)]} />
        {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
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