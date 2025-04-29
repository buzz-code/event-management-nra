import { DateField, DateInput, DateTimeInput, Labeled, maxLength, ReferenceField, required, TextField, TextInput } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { useUnique } from '@shared/utils/useUnique';
import { CommonReferenceInputFilter } from '@shared/components/fields/CommonReferenceInputFilter';

const filters = [
    ({ isAdmin }) => isAdmin && <CommonReferenceInputFilter source="userId" reference="user" />,
    ({ isAdmin }) => isAdmin && <DateInput source="createdAt:$gte" />,
    ({ isAdmin }) => isAdmin && <DateInput source="createdAt:$lte" />,
    ({ isAdmin }) => isAdmin && <DateInput source="updatedAt:$gte" />,
    ({ isAdmin }) => isAdmin && <DateInput source="updatedAt:$lte" />,
    <TextInput source="first_name:$cont" alwaysOn label="שם משתתף" />,
    <TextInput source="last_name:$cont" label="שם משפחה" />,
    <CommonReferenceInputFilter source="classReferenceId" reference="class" label="כיתה" />,
    <TextInput source="address:$cont" label="כתובת" />,
    <TextInput source="mother_name:$cont" label="שם האם" />,
    <TextInput source="mother_contact:$cont" label="טלפון האם" />,
    <TextInput source="father_name:$cont" label="שם האב" />,
    <TextInput source="father_contact:$cont" label="טלפון האב" />,
];

const Datagrid = ({ isAdmin, children, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {children}
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <TextField source="first_name" label="שם משתתף" />
            <TextField source="last_name" label="שם משפחה" />
            <ReferenceField source="classReferenceId" reference="class" label="כיתה" />
            <TextField source="address" label="כתובת" />
            <TextField source="mother_name" label="שם האם" />
            <TextField source="mother_contact" label="טלפון האם" />
            <TextField source="father_name" label="שם האב" />
            <TextField source="father_contact" label="טלפון האב" />
            {isAdmin && <DateField showDate showTime source="created_at" label="נוצר ב" />}
            {isAdmin && <DateField showDate showTime source="updated_at" label="עודכן ב" />}
        </CommonDatagrid>
    );
}

const Inputs = ({ isCreate, isAdmin }) => {
    const unique = useUnique();
    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        {isAdmin && <CommonReferenceInput source="userId" reference="user" validate={required()} />}
        <TextInput source="first_name" validate={[required(), maxLength(255)]} label="שם משתתף" />
        <TextInput source="last_name" validate={[required(), maxLength(255)]} label="שם משפחה" />
        <CommonReferenceInput source="classReferenceId" reference="class" label="כיתה" />
        <TextInput source="address" validate={[maxLength(1000)]} label="כתובת" multiline />
        <TextInput source="mother_name" validate={[maxLength(255)]} label="שם האם" />
        <TextInput source="mother_contact" validate={[maxLength(255)]} label="טלפון האם" />
        <TextInput source="father_name" validate={[maxLength(255)]} label="שם האב" />
        <TextInput source="father_contact" validate={[maxLength(255)]} label="טלפון האב" />
        {!isCreate && isAdmin && <DateTimeInput source="created_at" disabled label="נוצר ב" />}
        {!isCreate && isAdmin && <DateTimeInput source="updated_at" disabled label="עודכן ב" />}
    </>
}

const Representation = CommonRepresentation;

const importer = {
    fields: ['first_name', 'last_name', 'classReferenceId', 'address', 'mother_name', 'mother_contact', 'father_name', 'father_contact'],
}

const entity = {
    Datagrid,
    Inputs,
    Representation,
    filters,
    importer,
};

export default getResourceComponents(entity);
