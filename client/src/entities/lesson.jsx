import { DateField, DateInput, DateTimeInput, maxLength, NumberInput, ReferenceArrayField, ReferenceArrayInput, ReferenceField, required, TextField, TextInput, SelectField, minValue } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { MultiReferenceField, MultiReferenceArrayField } from '@shared/components/fields/CommonReferenceField';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { CommonReferenceInputFilter, filterByUserId, filterByUserIdAndYear } from '@shared/components/fields/CommonReferenceInputFilter';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { defaultYearFilter, yearChoices } from '@shared/utils/yearFilter';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';
import CommonReferenceArrayInput from '@shared/components/fields/CommonReferenceArrayInput';
import { useUnique } from '@shared/utils/useUnique';

const filters = [
    ({ isAdmin }) => isAdmin && <CommonReferenceInputFilter source="userId" reference="user" />,
    ({ isAdmin }) => isAdmin && <DateInput source="createdAt:$gte" />,
    ({ isAdmin }) => isAdmin && <DateInput source="createdAt:$lte" />,
    ({ isAdmin }) => isAdmin && <DateInput source="updatedAt:$gte" />,
    ({ isAdmin }) => isAdmin && <DateInput source="updatedAt:$lte" />,
    <NumberInput source="key" />,
    <TextInput source="name:$cont" alwaysOn />,
    <CommonReferenceInputFilter source="klassReferenceIds:$cont" label="כיתה" reference="klass" dynamicFilter={filterByUserIdAndYear} />,
    <CommonReferenceInputFilter source="teacherReferenceId" reference="teacher" dynamicFilter={filterByUserId} alwaysOn />,
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
            <TextField source="key" />
            <TextField source="name" />
            <TextField source="displayName" />
            <MultiReferenceArrayField source="klassReferenceIds" reference="klass" optionalSource="klasses" optionalTarget="key" />
            <MultiReferenceField source="teacherReferenceId" sortBy="teacher.name" optionalSource="teacherId" reference="teacher" optionalTarget="tz" />
            <DateField source="startDate" />
            <DateField source="endDate" />
            <SelectField source="year" choices={yearChoices} />
            <TextField source="comment" />
            <TextField source="howManyLessons" />
            <TextField source="order" />
            {isAdmin && <DateField showDate showTime source="createdAt" />}
            {isAdmin && <DateField showDate showTime source="updatedAt" />}
        </CommonDatagrid>
    );
}

const Inputs = ({ isCreate, isAdmin }) => {
    const unique = useUnique({ dynamicFilter: { year: 'year' } });
    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        {isAdmin && <CommonReferenceInput source="userId" reference="user" validate={required()} />}
        <NumberInput source="key" validate={[required(), unique()]} />
        <TextInput source="name" validate={[required(), maxLength(500)]} />
        <TextInput source="displayName" validate={[maxLength(500)]} />
        <CommonReferenceArrayInput source="klassReferenceIds" reference='klass' dynamicFilter={filterByUserIdAndYear} />
        <CommonReferenceInput source="teacherReferenceId" reference="teacher" dynamicFilter={filterByUserId} />
        <DateInput source="startDate" />
        <DateInput source="endDate" />
        <CommonAutocompleteInput source="year" choices={yearChoices} defaultValue={defaultYearFilter.year} />
        <TextInput source="comment" validate={[maxLength(1000)]} />
        <NumberInput source="howManyLessons" validate={minValue(0)} />
        <NumberInput source="order" />
        {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
    </>
}

const Representation = CommonRepresentation;

const importer = {
    fields: ['key', 'name', 'klasses', 'teacherId', 'startDate', 'endDate', 'year', 'comment', 'howManyLessons', 'displayName', 'order'],
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
