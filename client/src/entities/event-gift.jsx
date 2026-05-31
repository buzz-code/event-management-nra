import { DateField, DateTimeInput, ReferenceField, required, TextField, TextInput, SelectField } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import {
    CommonReferenceInputFilter,
    filterByUserIdAndYear,
} from '@shared/components/fields/CommonReferenceInputFilter';
import { commonAdminFilters } from '@shared/components/fields/PermissionFilter';
import { defaultYearFilter } from '@shared/utils/yearFilter';
import { CommonYearField, CommonYearInput, CommonYearInputFilter } from '@shared/components/fields/CommonYear';

const filters = [
    ...commonAdminFilters,
    <CommonReferenceInputFilter
        source="eventReferenceId"
        reference="event"
        alwaysOn
        dynamicFilter={filterByUserIdAndYear}
    />,
    <CommonReferenceInputFilter source="giftReferenceId" reference="gift" dynamicFilter={filterByUserIdAndYear} />,
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
            <ReferenceField source="eventReferenceId" reference="event" />
            <ReferenceField source="giftReferenceId" reference="gift" />
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
                source="eventReferenceId"
                reference="event"
                validate={required()}
                dynamicFilter={filterByUserIdAndYear}
            />
            <CommonReferenceInput source="giftReferenceId" reference="gift" dynamicFilter={filterByUserIdAndYear} />
            <CommonYearInput />
            {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
            {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
        </>
    );
};

const Representation = CommonRepresentation;

const importer = {
    fields: ['eventReferenceId', 'giftKey', 'year'],
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
