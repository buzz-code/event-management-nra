import { DateField, DateTimeInput, TextField, TextInput, RichTextField, required, maxLength, NumberInput, NumberField } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { CommonRichTextInput } from '@shared/components/fields/CommonRichTextInput';

const filters = [
    <TextInput source="name:$cont" alwaysOn />,
    <TextInput source="description:$cont" label="תיאור" />,
    <TextInput source="value:$cont" label="ערך" alwaysOn />,
];

const Datagrid = ({ isAdmin, children, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {children}
            {isAdmin && <TextField source="id" />}
            <TextField source="description" />
            <RichTextField source="value" maxHeight={120} overflow='hidden' display='inline-block' />
            <NumberField source="order" />
            {isAdmin && <DateField showDate showTime source="createdAt" />}
            {isAdmin && <DateField showDate showTime source="updatedAt" />}
        </CommonDatagrid>
    );
}

const Inputs = ({ isCreate, isAdmin }) => {
    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        <TextInput source="description" disabled={!isCreate} validate={[required(), maxLength(255)]} />
        <CommonRichTextInput source="value" validate={required()} />
        <NumberInput source="order" />
        {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
    </>
}

const Representation = CommonRepresentation;

const entity = {
    Datagrid,
    Inputs,
    Representation,
    filters,
};

export default getResourceComponents(entity);
