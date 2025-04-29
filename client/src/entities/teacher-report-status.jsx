import { ReferenceField, ReferenceArrayField, TextField, required, SelectField, BooleanInput, TextInput, useGetList } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { CommonReferenceInputFilter, filterByUserId } from '@shared/components/fields/CommonReferenceInputFilter';
import { BulkReportButton } from '@shared/components/crudContainers/BulkReportButton';
import { BulkActionButton } from '@shared/components/crudContainers/BulkActionButton';
import AttachEmailIcon from '@mui/icons-material/AttachEmail';
import BrowserUpdatedIcon from '@mui/icons-material/BrowserUpdated';
import { CommonRichTextInput } from '@shared/components/fields/CommonRichTextInput';
import { defaultYearFilter, yearChoices } from '@shared/utils/yearFilter';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';

const filters = [
    ({ isAdmin }) => isAdmin && <CommonReferenceInputFilter source="userId" reference="user" />,
    <CommonReferenceInputFilter source="teacherReferenceId" reference="teacher" dynamicFilter={filterByUserId} />,
    <CommonReferenceInputFilter source="reportMonthReferenceId" reference="report_month" dynamicFilter={filterByUserId} />,
    <CommonAutocompleteInput source="year" choices={yearChoices} alwaysOn />,
];

const filterDefaultValues = {
    ...defaultYearFilter,
};

const Datagrid = ({ isAdmin, children, ...props }) => {
    const { data: subjectText } = useGetList('text_by_user', { page: 1, perPage: 1, filter: { name: 'teacherReportStatusEmailSubject' } });
    const { data: bodyText } = useGetList('text_by_user', { page: 1, perPage: 1, filter: { name: 'teacherReportStatusEmailBody1' } });
    const defaultMailSubject = subjectText?.[0]?.value ?? 'תזכורת לשליחת דווח נוכחות';
    const defaultMailBody = bodyText?.[0]?.value ?? 'שלום המורה {0} היקרה, תזכורת לשלוח נתוני נוכחות עבור השיעורים {2} בתודה ההנהלה';
    const additionalBulkButtons = [
        <BulkReportButton label='הורדת אקסל למורה' icon={<BrowserUpdatedIcon />} name='teacherReportFile' >
            {/* <BooleanInput source="isGrades" label="קובץ ציונים" /> */}
        </BulkReportButton>,
        <BulkActionButton label='שליחת אקסל למורה' icon={<AttachEmailIcon />} name='teacherReportFile' >
            <TextInput key="mailSubject" source="mailSubject" label="נושא המייל" validate={required()} defaultValue={defaultMailSubject} />
            <CommonRichTextInput key="mailBody" source="mailBody" label="תוכן המייל" validate={required()} defaultValue={defaultMailBody} />
            <CommonReferenceInputFilter source="lessonReferenceId" reference="lesson" label="שיעור" dynamicFilter={filterByUserId} />
            {/* <BooleanInput source="isGrades" label="קובץ ציונים" /> */}
        </BulkActionButton>,
    ];

    return (
        <CommonDatagrid {...props} additionalBulkButtons={additionalBulkButtons}>
            {children}
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <ReferenceField source="teacherReferenceId" reference="teacher" sortBy='teacherName' />
            <TextField source="teacherComment" />
            <ReferenceField source="reportMonthReferenceId" reference="report_month" sortBy='reportMonthName' />
            <SelectField source="year" choices={yearChoices} />
            <ReferenceArrayField source="reportedLessons" reference="lesson" sortBy="reportedLessonNames" />
            <ReferenceArrayField source="notReportedLessons" reference="lesson" sortBy="notReportedLessonNames" />
        </CommonDatagrid>
    );
}

const entity = {
    Datagrid,
    filters,
    filterDefaultValues,
};

export default getResourceComponents(entity);
