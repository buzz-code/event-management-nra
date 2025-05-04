import {
    DateField,
    DateInput,
    DateTimeInput,
    Labeled,
    maxLength,
    ReferenceField,
    ReferenceManyField,
    required,
    TextField,
    TextInput,
    NumberInput,
    NumberField
} from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { CommonReferenceInputFilter } from '@shared/components/fields/CommonReferenceInputFilter';
import { CommonReferenceField, MultiReferenceField } from '@shared/components/fields/CommonReferenceField';

const filters = [
    ({ isAdmin }) => isAdmin && <CommonReferenceInputFilter source="userId" reference="user" />,
    ({ isAdmin }) => isAdmin && <DateInput source="createdAt:$gte" />,
    ({ isAdmin }) => isAdmin && <DateInput source="createdAt:$lte" />,
    ({ isAdmin }) => isAdmin && <DateInput source="updatedAt:$gte" />,
    ({ isAdmin }) => isAdmin && <DateInput source="updatedAt:$lte" />,
    <TextInput source="name:$cont" alwaysOn />,
    <CommonReferenceInputFilter source="eventTypeReferenceId" reference="event_type" />,
    <CommonReferenceInputFilter source="levelTypeReferenceId" reference="level_type" />,
    <DateInput source="eventDate:$gte" />,
    <DateInput source="eventDate:$lte" />,
];

const Datagrid = ({ isAdmin, children, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {children}
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <TextField source="name" />
            <MultiReferenceField source="eventTypeReferenceId" reference="event_type" optionalSource="eventTypeKey" optionalTarget="key" />
            <MultiReferenceField source="levelTypeReferenceId" reference="level_type" optionalSource="levelTypeKey" optionalTarget="key" />
            <DateField source="eventDate" />
            <TextField source="location" />
            <NumberField source="maxParticipants" />
            <TextField source="description" />
            {isAdmin && <DateField showDate showTime source="createdAt" />}
            {isAdmin && <DateField showDate showTime source="updatedAt" />}
        </CommonDatagrid>
    );
}

const Inputs = ({ isCreate, isAdmin }) => {
    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        {isAdmin && <CommonReferenceInput source="userId" reference="user" validate={required()} />}
        <TextInput source="name" validate={[required(), maxLength(255)]} />
        <CommonReferenceInput source="eventTypeReferenceId" reference="event_type" validate={required()} />
        <CommonReferenceInput source="levelTypeReferenceId" reference="level_type" />
        <DateInput source="eventDate" validate={required()} />
        <TextInput source="location" validate={[maxLength(255)]} />
        <NumberInput source="maxParticipants" />
        <TextInput source="description" multiline validate={[maxLength(1000)]} />
        {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
        {!isCreate && <Labeled>
            <ReferenceManyField reference="event_note" target="eventReferenceId">
                <CommonDatagrid>
                    <TextField source="noteText" />
                    <DateField showDate showTime source="createdAt" />
                </CommonDatagrid>
            </ReferenceManyField>
        </Labeled>}
        {!isCreate && <Labeled>
            <ReferenceManyField reference="event_gift" target="eventReferenceId">
                <CommonDatagrid>
                    <ReferenceField source="giftReferenceId" reference="gift" />
                </CommonDatagrid>
            </ReferenceManyField>
        </Labeled>}
    </>
}

const Representation = CommonRepresentation;

const importer = {
    fields: ['name', 'eventTypeKey', 'levelTypeKey', 'eventDate', 'location', 'maxParticipants', 'description'],
}

const entity = {
    Datagrid,
    Inputs,
    Representation,
    filters,
    importer,
};

export default getResourceComponents(entity);