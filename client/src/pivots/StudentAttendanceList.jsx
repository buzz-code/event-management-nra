import { getResourceComponents } from "@shared/components/crudContainers/CommonEntity";
import { CommonDatagrid, getPivotColumns } from "@shared/components/crudContainers/CommonList"
import { CommonReferenceInputFilter, filterByUserId, filterByUserIdAndYear } from "@shared/components/fields/CommonReferenceInputFilter";
import { ReferenceField, TextField, useListContext, TextInput, DateInput, BooleanInput } from "react-admin"
import { defaultYearFilter, yearChoices } from '@shared/utils/yearFilter';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';
import { CommonSelectArrayField } from "@shared/components/fields/CommonSelectArrayField";
import { semesterChoices } from "src/entities/report-month";

const filters = [
    ({ isAdmin }) => isAdmin && <CommonReferenceInputFilter source="userId" reference="user" />,
    <TextInput source="tz:$cont" label="תז" />,
    <TextInput source="name:$cont" alwaysOn />,
    <CommonReferenceInputFilter source="klassReferenceIds:$cont" reference="klass" dynamicFilter={filterByUserIdAndYear} alwaysOn />,
    <CommonReferenceInputFilter source="klassTypeReferenceIds:$cont" reference="klass_type" dynamicFilter={filterByUserId} alwaysOn />,
    <CommonReferenceInputFilter source="extra.lessonId" reference="lesson" dynamicFilter={filterByUserIdAndYear} alwaysOn />,
    <CommonAutocompleteInput source="year:$cont" choices={yearChoices} alwaysOn />,
    <DateInput source="extra.fromDate" label="תאריך דיווח אחרי" alwaysOn />,
    <DateInput source="extra.toDate" label="תאריך דיווח לפני" alwaysOn />,
    <CommonReferenceInputFilter source="extra.reportMonthReferenceId" label="תקופת דיווח" reference="report_month" dynamicFilter={filterByUserId} />,
    <CommonAutocompleteInput source="extra.semester" label="מחצית" choices={semesterChoices} />,
    <BooleanInput source="extra.isCheckKlassType" label="סינון לפי שיוך כיתה" />,
];

const filterDefaultValues = {
    'year:$cont': defaultYearFilter.year,
    extra: {
        isCheckKlassType: true,
    },
};

const Datagrid = ({ isAdmin, children, ...props }) => {
    const { data } = useListContext();

    return (
        <CommonDatagrid {...props}>
            {children}
            {isAdmin && <TextField key="id" source="id" />}
            {isAdmin && <ReferenceField key="userId" source="userId" reference="user" />}
            <TextField key="tz" source="tz" />
            <TextField key="name" source="name" />
            <CommonSelectArrayField key="year" source="year" choices={yearChoices} />
            {getPivotColumns(data)}
        </CommonDatagrid>
    );
}

const entity = {
    resource: 'student_by_year/pivot?extra.pivot=StudentAttendance',
    Datagrid,
    filters,
    filterDefaultValues,
    configurable: false,
}

export default getResourceComponents(entity).list;