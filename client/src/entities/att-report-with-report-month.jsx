import { DateField, DateInput, NumberField, TextField, TextInput, ReferenceField, SelectField, required, NumberInput, BooleanInput, maxLength } from 'react-admin';
import PlaylistRemoveIcon from '@mui/icons-material/PlaylistRemove';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { MultiReferenceField } from '@shared/components/fields/CommonReferenceField';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { CommonReferenceInputFilter, filterByUserId, filterByUserIdAndYear } from '@shared/components/fields/CommonReferenceInputFilter';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { defaultYearFilter, yearChoices } from '@shared/utils/yearFilter';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';
import { Inputs } from './att-report';
import { CommonHebrewDateField } from '@shared/components/fields/CommonHebrewDateField';
import { BulkActionButton } from '@shared/components/crudContainers/BulkActionButton';
import { BulkFixReferenceButton } from '@shared/components/crudContainers/BulkFixReferenceButton';

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
    <CommonReferenceInput source="reportMonthReferenceId" reference="report_month" dynamicFilter={filterByUserId} />,
    <CommonAutocompleteInput source="year" choices={yearChoices} alwaysOn />,
];

const filterDefaultValues = {
    ...defaultYearFilter,
};

const additionalBulkButtons = [
    <BulkActionButton label='הוספת חיסורים מאושרים' icon={<PlaylistRemoveIcon />} name='bulkKnownAbsences' >
        <DateInput source="reportDate" resource="known_absence" validate={required()} />
        <NumberInput source="absnceCount" resource="known_absence" validate={required()} defaultValue={1} />
        <NumberInput source="absnceCode" resource="known_absence" />
        <TextInput source="senderName" resource="known_absence" validate={maxLength(100)} defaultValue='' />
        <TextInput source="reason" resource="known_absence" validate={maxLength(500)} defaultValue='' />
        <TextInput source="comment" resource="known_absence" validate={maxLength(500)} defaultValue='' />
        <BooleanInput source="isApproved" resource="known_absence" defaultValue={true} />
    </BulkActionButton>,
    <BulkFixReferenceButton key='fixReferences' />,
];

export const Datagrid = ({ isAdmin, children, ...props }) => {
    return (
        <CommonDatagrid {...props} additionalBulkButtons={additionalBulkButtons}>
            {children}
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <MultiReferenceField source="studentReferenceId" sortBy="student.name" optionalSource="studentTz" reference="student_by_year" optionalTarget="tz" />
            <TextField source="studentBaseKlass.klassName" />
            <MultiReferenceField source="teacherReferenceId" sortBy="teacher.name" optionalSource="teacherId" reference="teacher" optionalTarget="tz" />
            <MultiReferenceField source="klassReferenceId" sortBy="klass.name" optionalSource="klassId" reference="klass" optionalTarget="key" />
            <MultiReferenceField source="klassReferenceId" label='resources.att_report_with_report_month.fields.klass.klassTypeReferenceId' sortable={false} optionalSource="klassId" reference="klass" optionalTarget="key" >
                <MultiReferenceField source='klassTypeReferenceId' reference='klass_type' />
            </MultiReferenceField>
            <MultiReferenceField source="lessonReferenceId" sortBy="lesson.name" optionalSource="lessonId" reference="lesson" optionalTarget="key" />
            <MultiReferenceField source="reportMonthReferenceId" sortBy="reportMonth.name" reference="report_month" />
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

const entity = {
    Datagrid,
    Inputs,
    filters,
    filterDefaultValues,
    editResource: 'att_report',
    deleteResource: 'att_report',
};

export default getResourceComponents(entity);
