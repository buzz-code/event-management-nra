import * as React from "react";
import {
  TextField,
  TextInput,
} from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { adminUserFilter } from '@shared/components/fields/PermissionFilter';
import { yearChoices, defaultYearFilter } from '@shared/utils/yearFilter';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';
import { CommonReferenceInputFilter, filterByUserId } from "@shared/components/fields/CommonReferenceInputFilter";
import { MultiReferenceArrayField } from "@shared/components/fields/CommonReferenceField";

const filters = [
  adminUserFilter,
  <CommonReferenceInputFilter source="studentReferenceId" reference="student" dynamicFilter={filterByUserId} />,
  <TextInput source="studentName:$cont" alwaysOn />,
  <CommonAutocompleteInput source="year" choices={yearChoices} alwaysOn />
];

const filterDefaultValues = {
  ...defaultYearFilter,
};

const Datagrid = ({ isAdmin, children, ...props }) => {
  return (
    <CommonDatagrid {...props} rowClick="show">
      {children}
      {isAdmin && <TextField source="id" />}
      <TextField source="studentTz" />
      <TextField source="studentName" />
      <TextField source="year" />
      <TextField source="classNames" />
      <MultiReferenceArrayField source="classReferenceIds" reference="class" />
    </CommonDatagrid>
  );
}

const entity = {
  Datagrid,
  filters,
  filterDefaultValues,
};

export default getResourceComponents(entity);
