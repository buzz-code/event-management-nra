import { BooleanField, DateField, DateInput, ReferenceField, TextField, TextInput } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { CommonEntityNameField } from '@shared/components/fields/CommonEntityNameField';
import { CommonCountField } from '@shared/components/fields/CommonCountField';
import { CommonEntityNameInput } from '@shared/components/fields/CommonEntityNameInput';
import { ShowMatchingRecordsButton } from '@shared/components/fields/ShowMatchingRecordsButton';
import { CommonReferenceInputFilter } from '@shared/components/fields/CommonReferenceInputFilter';

const filters = [
    ({ isAdmin }) => isAdmin && <CommonReferenceInputFilter source="userId" reference="user" />,
    <CommonEntityNameInput source="entityName" />,
    <TextInput source="fileName" />,
    ({ isAdmin }) => isAdmin && <DateInput source="createdAt:$gte" alwaysOn />,
    ({ isAdmin }) => isAdmin && <DateInput source="createdAt:$lte" alwaysOn />,
];

const Datagrid = ({ isAdmin, children, ...props }) => {
    return (
        <CommonDatagrid {...props} readonly>
            {children}
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <TextField source="fileName" />
            <TextField source="fileSource" />
            <CommonCountField source="entityIds" />
            <CommonEntityNameField source="entityName" />
            <BooleanField source="fullSuccess" />
            <TextField source="response" />
            <DateField showDate showTime source="createdAt" />
            <ShowMatchingRecordsButton source="entityIds" resourceField="entityName" />
        </CommonDatagrid>
    );
}

const Representation = 'fileName';

const entity = {
    Datagrid,
    filters,
    Representation,
};

export default getResourceComponents(entity);
