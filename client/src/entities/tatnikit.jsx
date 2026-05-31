import { DateField, DateTimeInput, ReferenceField, required, TextField, TextInput, SelectField } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { CommonReferenceInputFilter, filterByUserId } from '@shared/components/fields/CommonReferenceInputFilter';
import { commonAdminFilters } from '@shared/components/fields/PermissionFilter';
import { defaultYearFilter } from '@shared/utils/yearFilter';
import { CommonYearField, CommonYearInput, CommonYearInputFilter } from '@shared/components/fields/CommonYear';
import { MultiReferenceField } from '@shared/components/fields/CommonReferenceField';

const filters = [
    ...commonAdminFilters,
    <CommonReferenceInputFilter source="studentReferenceId" reference="student" dynamicFilter={filterByUserId} />,
    <CommonReferenceInputFilter source="classReferenceId" reference="class" dynamicFilter={filterByUserId} />,
    <CommonYearInputFilter />,
];

const filterDefaultValues = {
    ...defaultYearFilter,
};

const Datagrid = ({ isAdmin, children, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {children}
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <MultiReferenceField
                source="studentReferenceId"
                reference="student"
                optionalSource="studentTz"
                optionalTarget="tz"
            />
            <MultiReferenceField
                source="studentReferenceId"
                reference="student"
                optionalSource="studentTz"
                optionalTarget="tz"
                label='ת"ז תלמידה'
            >
                <TextField source="tz" />
            </MultiReferenceField>
            <MultiReferenceField
                source="classReferenceId"
                reference="class"
                optionalSource="classKey"
                optionalTarget="key"
            />
            <CommonYearField />
            {isAdmin && <DateField showDate showTime source="createdAt" />}
            {isAdmin && <DateField showDate showTime source="updatedAt" />}
        </CommonDatagrid>
    );
};

const Inputs = ({ isCreate, isAdmin }) => {
    return (
        <>
            {!isCreate && isAdmin && <TextInput source="id" disabled />}
            {isAdmin && <CommonReferenceInput source="userId" reference="user" validate={required()} />}
            <CommonReferenceInput
                source="studentReferenceId"
                reference="student"
                validate={required()}
                dynamicFilter={filterByUserId}
            />
            <CommonReferenceInput
                source="classReferenceId"
                reference="class"
                validate={required()}
                dynamicFilter={filterByUserId}
            />
            <CommonYearInput validate={required()} />
            {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
            {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
        </>
    );
};

const Representation = CommonRepresentation;

const importer = {
    fields: ['studentTz', 'classKey', 'year'],
};

const entity = {
    Datagrid,
    Inputs,
    Representation,
    filters,
    filterDefaultValues,
    importer,
};

export default getResourceComponents(entity);
