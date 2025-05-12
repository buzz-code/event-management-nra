import {
  DateField,
  DateTimeInput,
  ReferenceField,
  required,
  TextField,
  TextInput,
  SelectField
} from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { CommonReferenceInputFilter, filterByUserId } from '@shared/components/fields/CommonReferenceInputFilter';
import { commonAdminFilters } from '@shared/components/fields/PermissionFilter';
import { yearChoices, defaultYearFilter } from '@shared/utils/yearFilter';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';
import { MultiReferenceField } from '@shared/components/fields/CommonReferenceField';

const filters = [
  ...commonAdminFilters,
  <CommonReferenceInputFilter source="studentReferenceId" reference="student" dynamicFilter={filterByUserId} />,
  <CommonReferenceInputFilter source="classReferenceId" reference="class" dynamicFilter={filterByUserId} />,
  <CommonAutocompleteInput source="year" choices={yearChoices} alwaysOn />
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
      <MultiReferenceField source="studentReferenceId" reference="student" optionalSource="studentTz" optionalTarget="tz" />
      <MultiReferenceField source="classReferenceId" reference="class" optionalSource="classKey" optionalTarget="key" />
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
    <CommonReferenceInput source="studentReferenceId" reference="student" validate={required()} dynamicFilter={filterByUserId} />
    <CommonReferenceInput source="classReferenceId" reference="class" validate={required()} dynamicFilter={filterByUserId} />
    <CommonAutocompleteInput source="year" choices={yearChoices} defaultValue={defaultYearFilter.year} validate={required()} />
    {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
    {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
  </>
}

const Representation = CommonRepresentation;

const importer = {
  fields: ['studentTz', 'classKey', 'year'],
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
