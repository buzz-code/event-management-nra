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

const filters = [
    ({ isAdmin }) => isAdmin && <CommonReferenceInputFilter source="userId" reference="user" />,
    ({ isAdmin }) => isAdmin && <DateInput source="createdAt:$gte" />,
    ({ isAdmin }) => isAdmin && <DateInput source="createdAt:$lte" />,
    ({ isAdmin }) => isAdmin && <DateInput source="updatedAt:$gte" />,
    ({ isAdmin }) => isAdmin && <DateInput source="updatedAt:$lte" />,
    <TextInput source="name:$cont" alwaysOn label="שם האירוע" />,
    <CommonReferenceInputFilter source="eventTypeReferenceId" reference="event_type" label="סוג האירוע" />,
    <DateInput source="eventDate:$gte" label="מתאריך" />,
    <DateInput source="eventDate:$lte" label="עד תאריך" />,
];

const Datagrid = ({ isAdmin, children, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {children}
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <TextField source="name" label="שם האירוע" />
            <ReferenceField source="eventTypeReferenceId" reference="event_type" label="סוג האירוע" />
            <DateField source="eventDate" label="תאריך האירוע" />
            <TextField source="location" label="מיקום" />
            <NumberField source="maxParticipants" label="מספר משתתפים מקסימלי" />
            <TextField source="description" label="תיאור" />
            {isAdmin && <DateField showDate showTime source="createdAt" />}
            {isAdmin && <DateField showDate showTime source="updatedAt" />}
        </CommonDatagrid>
    );
}

const Inputs = ({ isCreate, isAdmin }) => {
    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        {isAdmin && <CommonReferenceInput source="userId" reference="user" validate={required()} />}
        <TextInput source="name" validate={[required(), maxLength(200)]} label="שם האירוע" />
        <CommonReferenceInput source="eventTypeReferenceId" reference="event_type" validate={required()} label="סוג האירוע" />
        <DateInput source="eventDate" validate={required()} label="תאריך האירוע" />
        <TextInput source="location" validate={[maxLength(200)]} label="מיקום" />
        <NumberInput source="maxParticipants" label="מספר משתתפים מקסימלי" />
        <TextInput source="description" multiline validate={[maxLength(1000)]} label="תיאור" />
        {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
        {!isCreate && <Labeled label="הערות לאירוע">
            <ReferenceManyField reference="event_note" target="eventReferenceId">
                <CommonDatagrid>
                    <TextField source="note" />
                    <DateField showDate showTime source="createdAt" />
                </CommonDatagrid>
            </ReferenceManyField>
        </Labeled>}
        {!isCreate && <Labeled label="מתנות לאירוע">
            <ReferenceManyField reference="event_gift" target="eventReferenceId">
                <CommonDatagrid>
                    <ReferenceField source="giftReferenceId" reference="gift" />
                    <NumberField source="quantity" />
                </CommonDatagrid>
            </ReferenceManyField>
        </Labeled>}
    </>
}

const Representation = CommonRepresentation;

const importer = {
    fields: ['name', 'eventTypeReferenceId', 'eventDate', 'location', 'maxParticipants', 'description'],
}

const entity = {
    Datagrid,
    Inputs,
    Representation,
    filters,
    importer,
};

export default getResourceComponents(entity);