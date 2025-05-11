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
    NumberField,
    BooleanField,
    BooleanInput,
    SingleFieldList,
    ChipField,
    SelectField
} from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { CommonReferenceInputFilter, filterByUserId, filterByUserIdAndYear } from '@shared/components/fields/CommonReferenceInputFilter';
import { MultiReferenceField } from '@shared/components/fields/CommonReferenceField';
import { commonAdminFilters, notPermissionFilter } from '@shared/components/fields/PermissionFilter';
import { isTeacher } from '../utils/appPermissions';
import { defaultYearFilter, yearChoices } from '@shared/utils/yearFilter';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';

const filters = [
    ...commonAdminFilters,
    // <TextInput source="name:$cont" alwaysOn />,
    notPermissionFilter(isTeacher, <CommonReferenceInputFilter source="teacherReferenceId" reference="teacher" dynamicFilter={filterByUserId} />),
    <CommonReferenceInputFilter source="studentReferenceId" reference="student" dynamicFilter={filterByUserId} />,
    <CommonReferenceInputFilter source="eventTypeReferenceId" reference="event_type" dynamicFilter={filterByUserIdAndYear} />,
    <CommonReferenceInputFilter source="levelTypeReferenceId" reference="level_type" dynamicFilter={filterByUserIdAndYear} />,
    <DateInput source="eventDate:$gte" />,
    <DateInput source="eventDate:$lte" />,
    <TextInput source="eventHebrewMonth:$cont" alwaysOn />,
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
            <MultiReferenceField source="studentReferenceId" reference="student" optionalSource="studentTz" optionalTarget="tz" />
            <MultiReferenceField source="eventTypeReferenceId" reference="event_type" optionalSource="eventTypeId" optionalTarget="key" />
            <MultiReferenceField source="levelTypeReferenceId" reference="level_type" optionalSource="levelTypeId" optionalTarget="key" />
            <MultiReferenceField source="teacherReferenceId" reference="teacher" optionalSource="teacherTz" optionalTarget="tz" />
            {/* <TextField source="name" />
            <TextField source="description" /> */}
            <DateField source="eventDate" />
            <TextField source="eventHebrewDate" />
            <TextField source="eventHebrewMonth" />
            <ReferenceManyField label="הערות" reference="event_note" target="eventReferenceId">
                <SingleFieldList>
                    <ChipField source="noteText" />
                </SingleFieldList>
            </ReferenceManyField>
            <ReferenceManyField label="מתנות" reference="event_gift" target="eventReferenceId">
                <SingleFieldList>
                    <ChipField source="gift.name" />
                </SingleFieldList>
            </ReferenceManyField>
            <SelectField source="year" choices={yearChoices} />
            <BooleanField source="completed" />
            <NumberField source="grade" />
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
        <CommonReferenceInput source="eventTypeReferenceId" reference="event_type" validate={required()} dynamicFilter={filterByUserIdAndYear} />
        <CommonReferenceInput source="levelTypeReferenceId" reference="level_type" dynamicFilter={filterByUserIdAndYear} />
        <CommonReferenceInput source="teacherReferenceId" reference="teacher" dynamicFilter={filterByUserId} />
        <TextInput source="name" validate={[maxLength(255)]} />
        <TextInput source="description" validate={[maxLength(1000)]} />
        <DateTimeInput source="eventDate" validate={[required()]} />
        <BooleanInput source="completed" validate={[required()]} />
        <NumberInput source="grade" validate={[required()]} />
        <CommonAutocompleteInput source="year" choices={yearChoices} defaultValue={defaultYearFilter.year} />
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
    fields: ['studentTz', 'eventTypeId', 'levelTypeId', 'teacherTz', 'name', 'description', 'eventDate', 'completed', 'grade', 'year'],
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