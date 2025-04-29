import { ReferenceField, TextField, SelectField, NumberField } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { CommonReferenceInputFilter, filterByUserId } from '@shared/components/fields/CommonReferenceInputFilter';
import { defaultYearFilter, yearChoices } from '@shared/utils/yearFilter';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';
import { MultiReferenceField } from '@shared/components/fields/CommonReferenceField';

const filters = [
    ({ isAdmin }) => isAdmin && <CommonReferenceInputFilter source="userId" reference="user" />,
    <CommonReferenceInputFilter source="teacherReferenceId" reference="teacher" dynamicFilter={filterByUserId} />,
    <CommonReferenceInputFilter source="reportMonthReferenceId" reference="report_month" dynamicFilter={filterByUserId} />,
    <CommonReferenceInputFilter source="klass.klassTypeReferenceId" reference="klass_type" dynamicFilter={filterByUserId} />,
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
            <ReferenceField source="teacherReferenceId" reference="teacher" sortBy='teacher.name' />
            <ReferenceField source="lessonReferenceId" reference="lesson" sortBy='lesson.name' />
            <ReferenceField source="klassReferenceId" reference="klass" sortBy='klass.name' />
            <MultiReferenceField source="klassReferenceId" label='resources.teacher_salary_report.fields.klass.klassTypeReferenceId' sortable={false} optionalSource="klassId" reference="klass" optionalTarget="key" >
                <MultiReferenceField source='klassTypeReferenceId' reference='klass_type' />
            </MultiReferenceField>
            <NumberField source="howManyLessons" />
            <ReferenceField source="reportMonthReferenceId" reference="report_month" sortBy='reportMonth.name' />
            <SelectField source="year" choices={yearChoices} />
        </CommonDatagrid>
    );
}

const entity = {
    Datagrid,
    filters,
    filterDefaultValues,
};

export default getResourceComponents(entity);
