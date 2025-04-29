import { TextInput, DateInput } from 'react-admin';
import { defaultYearFilter, yearChoices } from '@shared/utils/yearFilter';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import { BulkReportButton } from '@shared/components/crudContainers/BulkReportButton';
import CommonReferenceArrayInput from '@shared/components/fields/CommonReferenceArrayInput';
import { useReportCardSettings } from '@shared/utils/settingsUtil';

const defaultValues = {
    ...defaultYearFilter,
    personalNote: '',
};

export default ({ defaultRequestValues }) => {
    const reportCardSettings = useReportCardSettings();

    return (
        <BulkReportButton label='תעודה לתלמידה' icon={<NoteAltIcon />}
            name='studentReportCardReact' filename='תעודה'
            defaultRequestValues={{ ...defaultValues, ...defaultRequestValues }}
            requestValues={reportCardSettings}>
            <CommonAutocompleteInput source="year" label="שנה" choices={yearChoices} />
            <DateInput source="startDate" label="תאריך התחלה" />
            <DateInput source="endDate" label="תאריך סיום" />
            <CommonReferenceArrayInput source="globalLessonReferenceIds" reference="lesson" label="שיעורים ללא הגבלת תאריך" />
            <CommonReferenceArrayInput source="denyLessonReferenceIds" reference="lesson" label="שיעורים שלא ייכללו בתעודה" />
            <TextInput source="personalNote" label="הערה לתלמידה" defaultValue='' />
        </BulkReportButton>
    );
};