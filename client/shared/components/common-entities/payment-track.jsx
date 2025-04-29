import { DateField, DateTimeInput, TextField, TextInput, required, maxLength, NumberInput, NumberField } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';

const filters = [
    <TextInput source="name:$cont" alwaysOn />,
    <TextInput source="description:$cont" label="תיאור" />,
];

const Datagrid = ({ isAdmin, children, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {children}
            {isAdmin && <TextField source="id" />}
            <TextField source="name" />
            <TextField source="description" />
            <NumberField source="monthlyPrice" />
            <NumberField source="annualPrice" />
            <NumberField source="studentNumberLimit" />
            {isAdmin && <DateField showDate showTime source="createdAt" />}
            {isAdmin && <DateField showDate showTime source="updatedAt" />}
        </CommonDatagrid>
    );
}

const Inputs = ({ isCreate, isAdmin }) => {
    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        <TextInput source="name" validate={[required(), maxLength(255)]} />
        <TextInput source="description" validate={[required()]} />
        <NumberInput source="monthlyPrice" validate={[required()]} />
        <NumberInput source="annualPrice" validate={[required()]} />
        <NumberInput source="studentNumberLimit" validate={[required()]} />
        {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
    </>
}

const Representation = CommonRepresentation;

const entity = {
    Datagrid,
    Inputs,
    Representation,
    filters,
};

export default getResourceComponents(entity);
