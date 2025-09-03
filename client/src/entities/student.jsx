import { DateField, DateTimeInput, Labeled, maxLength, ReferenceField, required, TextField, TextInput, UrlField, useCreatePath, useRecordContext, useResourceContext } from 'react-admin';
import { Link } from 'react-router-dom';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { useUnique } from '@shared/utils/useUnique';
import { CommonReferenceInputFilter, filterByUserId } from '@shared/components/fields/CommonReferenceInputFilter';
import { commonAdminFilters } from '@shared/components/fields/PermissionFilter';
import get from 'lodash/get';

const FamilySizeField = ({ source, reference, ...props }) => {
    const record = useRecordContext(props);
    const resource = useResourceContext(props);
    const createPath = useCreatePath();

    if (!record || (!!source && !get(record, source))) return null;

    const listUrl = createPath({ resource, type: 'list' });
    const filterValue = { [source]: get(record, source) };

    return (
        <ReferenceField
            source={source}
            reference={reference}
            link={false}
            record={record}
        >
            <Link to={{
                pathname: listUrl,
                search: `filter=${JSON.stringify(filterValue)}`
            }} onClick={e => e.stopPropagation()}>
                <TextField source="numberOfDaughters" />
            </Link>
        </ReferenceField>
    );
};

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
    <CommonReferenceInputFilter source="familyStatusReferenceId" reference="family_status_type" filterToQuery={filterByUserId} />,
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
            <ReferenceField source="familyStatusReferenceId" reference="family_status_type" />
            <FamilySizeField source="familyReferenceId" reference="family" />
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
        <CommonReferenceInput source="familyStatusReferenceId" reference="family_status_type" dynamicFilter={filterByUserId} />
        {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
    </>
}

const Representation = CommonRepresentation;

const importer = {
    fields: ['tz', 'name', 'address', 'motherName', 'motherContact', 'fatherName', 'fatherContact', 'motherPreviousName', 'familyStatusKey'],
}

const entity = {
    Datagrid,
    Inputs,
    Representation,
    filters,
    importer,
};

export default getResourceComponents(entity);
