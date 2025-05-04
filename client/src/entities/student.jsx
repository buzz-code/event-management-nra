import { DateField, DateInput, DateTimeInput, Labeled, maxLength, ReferenceField, required, TextField, TextInput } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { useUnique } from '@shared/utils/useUnique';
import { CommonReferenceInputFilter } from '@shared/components/fields/CommonReferenceInputFilter';
import { MultiReferenceField } from '@shared/components/fields/CommonReferenceField';

const filters = [
    ({ isAdmin }) => isAdmin && <CommonReferenceInputFilter source="userId" reference="user" />,
    ({ isAdmin }) => isAdmin && <DateInput source="createdAt:$gte" />,
    ({ isAdmin }) => isAdmin && <DateInput source="createdAt:$lte" />,
    ({ isAdmin }) => isAdmin && <DateInput source="updatedAt:$gte" />,
    ({ isAdmin }) => isAdmin && <DateInput source="updatedAt:$lte" />,
    <TextInput source="tz" />,
    <TextInput source="first_name:$cont" alwaysOn />,
    <TextInput source="last_name:$cont" />,
    <CommonReferenceInputFilter source="classReferenceId" reference="class" />,
    <TextInput source="address:$cont" />,
    <TextInput source="mother_name:$cont" />,
    <TextInput source="mother_contact:$cont" />,
    <TextInput source="father_name:$cont" />,
    <TextInput source="father_contact:$cont" />,
];

const Datagrid = ({ isAdmin, children, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {children}
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <TextField source="tz" />
            <TextField source="first_name" />
            <TextField source="last_name" />
            <MultiReferenceField source="classReferenceId" reference="class" optionalSource="classKey" optionalTarget="key" />
            <TextField source="address" />
            <TextField source="mother_name" />
            <TextField source="mother_contact" />
            <TextField source="father_name" />
            <TextField source="father_contact" />
            {isAdmin && <DateField showDate showTime source="created_at" />}
            {isAdmin && <DateField showDate showTime source="updated_at" />}
        </CommonDatagrid>
    );
}

const Inputs = ({ isCreate, isAdmin }) => {
    const unique = useUnique();
    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        {isAdmin && <CommonReferenceInput source="userId" reference="user" validate={required()} />}
        <TextInput source="tz" validate={[maxLength(9)]} />
        <TextInput source="first_name" validate={[required(), maxLength(255)]} />
        <TextInput source="last_name" validate={[required(), maxLength(255)]} />
        <CommonReferenceInput source="classReferenceId" reference="class" />
        <TextInput source="address" validate={[maxLength(1000)]} multiline />
        <TextInput source="mother_name" validate={[maxLength(255)]} />
        <TextInput source="mother_contact" validate={[maxLength(255)]} />
        <TextInput source="father_name" validate={[maxLength(255)]} />
        <TextInput source="father_contact" validate={[maxLength(255)]} />
        {!isCreate && isAdmin && <DateTimeInput source="created_at" disabled />}
        {!isCreate && isAdmin && <DateTimeInput source="updated_at" disabled />}
    </>
}

const Representation = CommonRepresentation;

const importer = {
    fields: ['tz', 'first_name', 'last_name', 'classKey', 'address', 'mother_name', 'mother_contact', 'father_name', 'father_contact'],
}

const entity = {
    Datagrid,
    Inputs,
    Representation,
    filters,
    importer,
};

export default getResourceComponents(entity);
