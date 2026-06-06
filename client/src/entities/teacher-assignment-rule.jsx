import {
    BooleanField,
    BooleanInput,
    DateField,
    DateTimeInput,
    FunctionField,
    NumberField,
    NumberInput,
    ReferenceField,
    TextField,
    TextInput,
    required,
    ArrayInput,
    SimpleFormIterator,
} from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { commonAdminFilters } from '@shared/components/fields/PermissionFilter';
import { defaultYearFilter } from '@shared/utils/yearFilter';
import { CommonYearField, CommonYearInput, CommonYearInputFilter } from '@shared/components/fields/CommonYear';
import { filterByUserId } from '@shared/components/fields/CommonReferenceInputFilter';

const filters = [
    ...commonAdminFilters,
    <CommonYearInputFilter />,
    <BooleanInput source="isActive" />,
];

const filterDefaultValues = {
    ...defaultYearFilter,
    isActive: true,
};

const Datagrid = ({ isAdmin, children, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {children}
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <CommonYearField />
            <NumberField source="order" />
            <TextField source="gradeLevelKey" />
            <FunctionField
                source="teacherReferenceIds"
                render={(r) => {
                    const ids = r.teacherReferenceIds || [];
                    return ids.length ? `${ids.length} מורות` : '—';
                }}
            />
            <BooleanField source="isActive" />
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
            <CommonYearInput />
            <NumberInput source="order" validate={required()} />
            <TextInput source="gradeLevelKey" validate={required()} helperText="שכבה אחת בלבד (לדוג׳ יג, יב, יא)" />
            <ArrayInput source="teacherReferenceIds" validate={required()}>
                <SimpleFormIterator inline disableReordering>
                    <CommonReferenceInput source="" reference="teacher" dynamicFilter={filterByUserId} label="מורה" />
                </SimpleFormIterator>
            </ArrayInput>
            <BooleanInput source="isActive" defaultValue={true} />
            {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
            {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
        </>
    );
};

const Representation = CommonRepresentation;

const entity = {
    Datagrid,
    Inputs,
    Representation,
    filters,
    filterDefaultValues,
};

export default getResourceComponents(entity);
