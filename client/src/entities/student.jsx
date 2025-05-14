import { DateField, DateTimeInput, Labeled, maxLength, ReferenceField, required, TextField, TextInput } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { useUnique } from '@shared/utils/useUnique';
import { CommonReferenceInputFilter, filterByUserId } from '@shared/components/fields/CommonReferenceInputFilter';
import { MultiReferenceField } from '@shared/components/fields/CommonReferenceField';
import { commonAdminFilters } from '@shared/components/fields/PermissionFilter';

const filters = [
    ...commonAdminFilters,
    <TextInput source="tz" />,
    <TextInput source="name:$cont" alwaysOn />,
    <TextInput source="address:$cont" />,
    <TextInput source="motherName:$cont" />,
    <TextInput source="motherContact:$cont" />,
    <TextInput source="fatherName:$cont" />,
    <TextInput source="fatherContact:$cont" />,
    <TextInput source="motherPreviousName:$cont" />,
];

const Datagrid = ({ isAdmin, children, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {children}
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <TextField source="tz" />
            <TextField source="name" />
            <TextField source="address" />
            <TextField source="motherName" />
            <TextField source="motherContact" />
            <TextField source="fatherName" />
            <TextField source="fatherContact" />
            <TextField source="motherPreviousName" />
            {isAdmin && <DateField showDate showTime source="createdAt" />}
            {isAdmin && <DateField showDate showTime source="updatedAt" />}
        </CommonDatagrid>
    );
}

const Inputs = ({ isCreate, isAdmin }) => {
    const unique = useUnique();

    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        {isAdmin && <CommonReferenceInput source="userId" reference="user" validate={required()} />}
        <TextInput source="tz" validate={[required(), maxLength(9), unique()]} />
        <TextInput source="name" validate={[required(), maxLength(510)]} />
        <TextInput source="address" validate={[maxLength(1000)]} multiline />
        <TextInput source="motherName" validate={[maxLength(255)]} />
        <TextInput source="motherContact" validate={[maxLength(255)]} />
        <TextInput source="fatherName" validate={[maxLength(255)]} />
        <TextInput source="fatherContact" validate={[maxLength(255)]} />
        <TextInput source="motherPreviousName" validate={[maxLength(255)]} />
        {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
    </>
}

const Representation = CommonRepresentation;

const importer = {
    fields: ['tz', 'name', 'address', 'motherName', 'motherContact', 'fatherName', 'fatherContact', 'motherPreviousName'],
}

const entity = {
    Datagrid,
    Inputs,
    Representation,
    filters,
    importer,
};

export default getResourceComponents(entity);
