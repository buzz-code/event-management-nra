import { ReferenceField, TextField, TextInput } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { adminUserFilter } from '@shared/components/fields/PermissionFilter';

const filters = [
  adminUserFilter,
  <TextInput source="familyName:$cont" alwaysOn />,
  <TextInput source="fatherName:$cont" />,
  <TextInput source="motherName:$cont" />,
  <TextInput source="motherPreviousName:$cont" />,
  <TextInput source="fatherContact:$cont" />,
  <TextInput source="motherContact:$cont" />,
];

const Datagrid = ({ isAdmin, children, ...props }) => {
  return (
    <CommonDatagrid {...props}>
      {children}
      {isAdmin && <TextField source="id" />}
      {isAdmin && <TextField source="userId" />}
      <TextField source="familyName" />
      <TextField source="fatherName" />
      <TextField source="motherName" />
      <TextField source="motherPreviousName" />
      <TextField source="fatherContact" />
      <TextField source="motherContact" />
      <TextField source="numberOfDaughters" />
      <ReferenceField source="representativeStudentId" reference="student" />
    </CommonDatagrid>
  );
}

const Representation = 'numberOfDaughters';

const entity = {
  Datagrid,
  Representation,
  filters,
};

export default getResourceComponents(entity);
