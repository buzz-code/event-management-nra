import { DateField, DateTimeInput, Labeled, maxLength, ReferenceField, required, TextField, TextInput } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { useUnique } from '@shared/utils/useUnique';
import { CommonReferenceInputFilter } from '@shared/components/fields/CommonReferenceInputFilter';
import { MultiReferenceField } from '@shared/components/fields/CommonReferenceField';
import { commonAdminFilters } from '@shared/components/fields/PermissionFilter';

const filters = [
    ...commonAdminFilters,
    <TextInput source="tz" />,
    <TextInput source="firstName:$cont" alwaysOn />,
    <TextInput source="lastName:$cont" />,
    <CommonReferenceInputFilter source="classReferenceId" reference="class" />,
    <TextInput source="address:$cont" />,
    <TextInput source="motherName:$cont" />,
    <TextInput source="motherContact:$cont" />,
    <TextInput source="fatherName:$cont" />,
    <TextInput source="fatherContact:$cont" />,
];

const Datagrid = ({ isAdmin, children, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {children}
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <TextField source="tz" />
            <TextField source="firstName" />
            <TextField source="lastName" />
            <MultiReferenceField source="classReferenceId" reference="class" optionalSource="classKey" optionalTarget="key" />
            <TextField source="address" />
            <TextField source="motherName" />
            <TextField source="motherContact" />
            <TextField source="fatherName" />
            <TextField source="fatherContact" />
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
        <TextInput source="tz" validate={[maxLength(9)]} />
        <TextInput source="firstName" validate={[required(), maxLength(255)]} />
        <TextInput source="lastName" validate={[required(), maxLength(255)]} />
        <CommonReferenceInput source="classReferenceId" reference="class" />
        <TextInput source="address" validate={[maxLength(1000)]} multiline />
        <TextInput source="motherName" validate={[maxLength(255)]} />
        <TextInput source="motherContact" validate={[maxLength(255)]} />
        <TextInput source="fatherName" validate={[maxLength(255)]} />
        <TextInput source="fatherContact" validate={[maxLength(255)]} />
        {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
    </>
}

const Representation = CommonRepresentation;

const importer = {
    fields: ['tz', 'firstName', 'lastName', 'classKey', 'address', 'motherName', 'motherContact', 'fatherName', 'fatherContact'],
}

const entity = {
    Datagrid,
    Inputs,
    Representation,
    filters,
    importer,
};

export default getResourceComponents(entity);
