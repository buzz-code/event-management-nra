import { DateInput, NumberField, TextField, ReferenceField, useRecordContext, SelectField, useListFilterContext, TextInput, useAuthState, usePermissions, BooleanInput } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { MultiReferenceField } from '@shared/components/fields/CommonReferenceField';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { CommonReferenceInputFilter, filterByUserId, filterByUserIdAndYear } from '@shared/components/fields/CommonReferenceInputFilter';
import { defaultYearFilter, yearChoices } from '@shared/utils/yearFilter';
import { ShowMatchingRecordsButton } from '@shared/components/fields/ShowMatchingRecordsButton';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';

const filters = [
    ({ isAdmin }) => isAdmin && <CommonReferenceInputFilter source="userId" reference="user" />,
    <DateInput source="extra.fromDate" label="תאריך דיווח אחרי" alwaysOn />,
    <DateInput source="extra.toDate" label="תאריך דיווח לפני" alwaysOn />,
    <BooleanInput source="extra.lastGrade" label="חשב ציון אחרון" alwaysOn defaultChecked />,
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

const Datagrid = ({ isAdmin, children, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {children}
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <MultiReferenceField source="studentReferenceId" sortBy="student.name" optionalSource="studentTz" reference="student_by_year" optionalTarget="tz" />
            <TextField source="studentBaseKlass.klassName" />
            <MultiReferenceField source="teacherReferenceId" sortBy="teacher.name" optionalSource="teacherId" reference="teacher" optionalTarget="tz" />
            <MultiReferenceField source="klassReferenceId" sortBy="klass.name" optionalSource="klassId" reference="klass" optionalTarget="key" />
            <MultiReferenceField source="lessonReferenceId" sortBy="lesson.name" optionalSource="lessonId" reference="lesson" optionalTarget="key" />
            <SelectField source="year" choices={yearChoices} />
            <NumberField source="lessonsCount" />
            <NumberField source="absCount" />
            <NumberField source="approvedAbsCount" sortable={false} />
            <NumberField source="absPercents" options={{ style: 'percent', maximumFractionDigits: 2 }} />
            <NumberField source="attPercents" options={{ style: 'percent', maximumFractionDigits: 2 }} />
            <NumberField source="gradeAvg" options={{ style: 'percent', maximumFractionDigits: 2 }} />
            <NumberField source="attGradeEffect" sortable={false} />
            <NumberField source="finalGrade" sortable={false} />
            <TextField source="estimation" />
            <TextField source="comments" />
            <NumberField source="estimatedAbsPercents" options={{ style: 'percent', maximumFractionDigits: 2 }} />
            <ShowMatchingAttReportsButton />
        </CommonDatagrid>
    );
}

const ShowMatchingAttReportsButton = ({ ...props }) => {
    const { filterValues } = useListFilterContext();
    const { studentReferenceId, teacherReferenceId, klassReferenceId, lessonReferenceId } = useRecordContext();
    const filter = {
        studentReferenceId,
        teacherReferenceId,
        klassReferenceId,
        lessonReferenceId,
        'reportDate:$gte': filterValues.extra?.fromDate,
        'reportDate:$lte': filterValues.extra?.toDate,
    };

    return (
        <ShowMatchingRecordsButton filter={filter} resource="att_report" />
    );
}

const entity = {
    resource: 'student_percent_report/pivot?extra.pivot=PercentReportWithDates',
    Datagrid,
    filters,
    filterDefaultValues,
};

export default getResourceComponents(entity).list;
