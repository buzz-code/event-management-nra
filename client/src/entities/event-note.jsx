import { DateField, DateTimeInput, maxLength, ReferenceField, required, TextField, TextInput, SelectField } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { CommonReferenceInputFilter, filterByUserIdAndYear } from '@shared/components/fields/CommonReferenceInputFilter';
import { commonAdminFilters } from '@shared/components/fields/PermissionFilter';
import { defaultYearFilter, yearChoices } from '@shared/utils/yearFilter';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';

const filters = [
    ...commonAdminFilters,
    <CommonReferenceInputFilter source="eventReferenceId" reference="event" alwaysOn dynamicFilter={filterByUserIdAndYear} />,
    <TextInput source="noteText:$cont" alwaysOn />,
    <CommonAutocompleteInput source="year" choices={yearChoices} alwaysOn />,
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
            <TextField source="noteText" />
            <SelectField source="year" choices={yearChoices} />
            {isAdmin && <DateField showDate showTime source="createdAt" />}
            {isAdmin && <DateField showDate showTime source="updatedAt" />}
        </CommonDatagrid>
    );
}

const Inputs = ({ isCreate, isAdmin }) => {
    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        {isAdmin && <CommonReferenceInput source="userId" reference="user" validate={required()} />}
        <CommonReferenceInput source="eventReferenceId" reference="event" validate={required()} dynamicFilter={filterByUserIdAndYear} />
        <TextInput source="noteText" multiline validate={[required(), maxLength(2000)]} />
        <CommonAutocompleteInput source="year" choices={yearChoices} defaultValue={defaultYearFilter.year} />
        {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
    </>
}

const Representation = 'noteText';

const importer = {
    fields: ['eventReferenceId', 'noteText', 'year'],
}

const entity = {
    Datagrid,
    Inputs,
    Representation,
    filters,
    filterDefaultValues,
    importer,
};

export default getResourceComponents(entity);