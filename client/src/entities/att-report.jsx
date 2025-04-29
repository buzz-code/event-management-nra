import { DateField, DateInput, DateTimeInput, NumberField, NumberInput, TextField, TextInput, ReferenceField, required, minValue, maxLength, SelectField } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { MultiReferenceField } from '@shared/components/fields/CommonReferenceField';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { CommonReferenceInputFilter, filterByUserId, filterByUserIdAndYear } from '@shared/components/fields/CommonReferenceInputFilter';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { defaultYearFilter, yearChoices } from '@shared/utils/yearFilter';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';
import { CommonHebrewDateField } from '@shared/components/fields/CommonHebrewDateField';

const filters = [
    ({ isAdmin }) => isAdmin && <CommonReferenceInputFilter source="userId" reference="user" />,
    ({ isAdmin }) => isAdmin && <DateInput source="createdAt:$gte" />,
    ({ isAdmin }) => isAdmin && <DateInput source="createdAt:$lte" />,
    ({ isAdmin }) => isAdmin && <DateInput source="updatedAt:$gte" />,
    ({ isAdmin }) => isAdmin && <DateInput source="updatedAt:$lte" />,
    <DateInput source="reportDate:$gte" label="תאריך דיווח אחרי" alwaysOn />,
    <DateInput source="reportDate:$lte" label="תאריך דיווח לפני" alwaysOn />,
    <CommonReferenceInputFilter source="studentReferenceId" reference="student_by_year" dynamicFilter={{ ...filterByUserId, 'year:$cont': filterByUserIdAndYear.year }} />,
    <TextInput source="studentBaseKlass.klassName:$cont" label="כיתת בסיס" />,
    <CommonReferenceInputFilter source="teacherReferenceId" reference="teacher" dynamicFilter={filterByUserId} />,
    <CommonReferenceInputFilter source="klassReferenceId" reference="klass" dynamicFilter={filterByUserIdAndYear} />,
    <CommonReferenceInputFilter source="klass.klassTypeReferenceId" reference="klass_type" dynamicFilter={filterByUserId} />,
    <CommonReferenceInputFilter source="lessonReferenceId" reference="lesson" dynamicFilter={{ ...filterByUserIdAndYear, teacherReferenceId: 'teacherReferenceId', 'klassReferenceIds:$cont': 'klassReferenceId' }} />,
    <CommonAutocompleteInput source="year" choices={yearChoices} alwaysOn />,
];

const filterDefaultValues = {
    ...defaultYearFilter,
};

export const Datagrid = ({ isAdmin, children, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {children}
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <MultiReferenceField source="studentReferenceId" sortBy="student.name" optionalSource="studentTz" reference="student_by_year" optionalTarget="tz" />
            <TextField source="studentBaseKlass.klassName" />
            <MultiReferenceField source="teacherReferenceId" sortBy="teacher.name" optionalSource="teacherId" reference="teacher" optionalTarget="tz" />
            <MultiReferenceField source="klassReferenceId" sortBy="klass.name" optionalSource="klassId" reference="klass" optionalTarget="key" />
            <MultiReferenceField source="klassReferenceId" label='resources.att_report.fields.klass.klassTypeReferenceId' sortable={false} optionalSource="klassId" reference="klass" optionalTarget="key" >
                <MultiReferenceField source='klassTypeReferenceId' reference='klass_type' />
            </MultiReferenceField>
            <MultiReferenceField source="lessonReferenceId" sortBy="lesson.name" optionalSource="lessonId" reference="lesson" optionalTarget="key" />
            <SelectField source="year" choices={yearChoices} />
            <DateField source="reportDate" />
            <CommonHebrewDateField source="reportDate" />
            <NumberField source="howManyLessons" />
            <NumberField source="absCount" />
            {/* <NumberField source="approvedAbsCount" /> */}
            <TextField source="comments" />
            {/* <TextField source="sheetName" /> */}
            {isAdmin && <DateField showDate showTime source="createdAt" />}
            {isAdmin && <DateField showDate showTime source="updatedAt" />}
        </CommonDatagrid>
    );
}

export const Inputs = ({ isCreate, isAdmin }) => {
    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        {isAdmin && <CommonReferenceInput source="userId" reference="user" validate={required()} />}
        <CommonReferenceInput source="studentReferenceId" reference="student_by_year" validate={required()} dynamicFilter={{ ...filterByUserId, 'year:$cont': filterByUserIdAndYear.year }} />
        <CommonReferenceInput source="teacherReferenceId" reference="teacher" validate={required()} dynamicFilter={filterByUserId} />
        <CommonReferenceInput source="klassReferenceId" reference="klass" validate={required()} dynamicFilter={filterByUserIdAndYear} />
        <CommonReferenceInput source="lessonReferenceId" reference="lesson" validate={required()} dynamicFilter={filterByUserIdAndYear} />
        <DateInput source="reportDate" validate={required()} />
        <NumberInput source="howManyLessons" defaultValue={1} validate={minValue(1)} />
        <NumberInput source="absCount" defaultValue={0} />
        {/* <NumberInput source="approvedAbsCount" defaultValue={0} /> */}
        <TextInput source="comments" validate={maxLength(500)} />
        <CommonAutocompleteInput source="year" choices={yearChoices} defaultValue={defaultYearFilter.year} />
        {/* <TextInput source="sheetName" validate={maxLength(100)} /> */}
        {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
    </>
}

const importer = {
    fields: ['studentTz', 'teacherId', 'klassId', 'lessonId', 'year', 'reportDate', 'howManyLessons', 'absCount', 'comments']
}

const entity = {
    Datagrid,
    Inputs,
    filters,
    filterDefaultValues,
};

export default getResourceComponents(entity);
