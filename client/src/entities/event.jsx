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
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import GetAppIcon from '@mui/icons-material/GetApp';
import EditIcon from '@mui/icons-material/Edit';
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
import CommonReferenceArrayInput from '@shared/components/fields/CommonReferenceArrayInput';
import { BulkActionButton } from '@shared/components/crudContainers/BulkActionButton';
import { BulkReportButton } from '@shared/components/crudContainers/BulkReportButton';
import { BulkFixReferenceButton } from '@shared/components/crudContainers/BulkFixReferenceButton';

const filters = [
    ...commonAdminFilters,
    // <TextInput source="name:$cont" alwaysOn />,
    notPermissionFilter(isTeacher, <CommonReferenceInputFilter source="teacherReferenceId" reference="teacher" dynamicFilter={filterByUserId} />),
    <CommonReferenceInputFilter source="studentReferenceId" reference="student" dynamicFilter={filterByUserId} />,
    <CommonReferenceInputFilter source="eventTypeReferenceId" reference="event_type" dynamicFilter={filterByUserIdAndYear} />,
    <CommonReferenceInputFilter source="levelTypeReferenceId" reference="level_type" dynamicFilter={filterByUserIdAndYear} />,
    <CommonReferenceInputFilter source="studentClassReferenceId" reference="class" dynamicFilter={filterByUserId} alwaysOn />,
    <TextInput source="studentClass.gradeLevel:$eq" label="שנתון" alwaysOn />,
    <DateInput source="eventDate:$gte" />,
    <DateInput source="eventDate:$lte" />,
    <TextInput source="eventHebrewMonth:$cont" alwaysOn />,
    <BooleanInput source="lotteryName:$isnull" label="ללא מסלול הגרלה" defaultValue={true} />,
    <TextInput source="lotteryName:$cont" label="שם הגרלה" />,
    <CommonAutocompleteInput source="year" choices={yearChoices} alwaysOn />,
];

const filterDefaultValues = {
    ...defaultYearFilter,
};

const Datagrid = ({ isAdmin, children, isPreview, ...props }) => {
    const additionalBulkButtons = [
        <BulkActionButton label='שיוך למורה' icon={<SupervisedUserCircleIcon />} name='teacherAssociation' >
            <CommonReferenceArrayInput source="teacherReferenceIds" reference="teacher" label="מורה" dynamicFilter={filterByUserId} validate={required()} />
        </BulkActionButton>,
        <BulkActionButton label='עדכון שם הגרלה' icon={<EditIcon />} name='lotteryNameUpdate' reloadOnEnd>
            <TextInput source="lotteryName" label="שם הגרלה" />
        </BulkActionButton>,
        <BulkReportButton label='ייצוא אירועים למורה' icon={<GetAppIcon />} name='eventExport' />,
        isAdmin && <BulkFixReferenceButton key="fixReferences" label="תיקון שיוך כיתות" />
    ];

    return (
        <CommonDatagrid {...props} additionalBulkButtons={additionalBulkButtons}>
            {children}
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <MultiReferenceField source="studentReferenceId" reference="student" optionalSource="studentTz" optionalTarget="tz" />
            <MultiReferenceField source="studentReferenceId" reference="student" optionalSource="studentTz" optionalTarget="tz" label='ת"ז תלמיד'>
                <TextField source="tz" />
            </MultiReferenceField>
            <MultiReferenceField source="eventTypeReferenceId" reference="event_type" optionalSource="eventTypeId" optionalTarget="key" />
            <MultiReferenceField source="levelTypeReferenceId" reference="level_type" optionalSource="levelTypeId" optionalTarget="key" />
            <MultiReferenceField source="teacherReferenceId" reference="teacher" optionalSource="teacherTz" optionalTarget="tz" />
            {/* <TextField source="name" />
            <TextField source="description" /> */}
            <DateField source="eventDate" />
            <TextField source="eventHebrewDate" />
            <TextField source="eventHebrewMonth" />
            {!isPreview && <ReferenceManyField label="הערות" reference="event_note" target="eventReferenceId">
                <SingleFieldList>
                    <ChipField source="noteText" />
                </SingleFieldList>
            </ReferenceManyField>}
            {!isPreview && <ReferenceManyField label="מתנות" reference="event_gift" target="eventReferenceId">
                <SingleFieldList>
                    <ChipField source="gift.name" />
                </SingleFieldList>
            </ReferenceManyField>}
            <SelectField source="year" choices={yearChoices} />
            <ReferenceField source="studentClassReferenceId" reference="class" />
            <BooleanField source="completed" />
            <BooleanField source="reportedByTatnikit" />
            <NumberField source="grade" />
            <NumberField source="fulfillmentQuestion1" />
            <NumberField source="fulfillmentQuestion2" />
            <NumberField source="fulfillmentQuestion3" />
            <NumberField source="fulfillmentQuestion4" />
            <NumberField source="fulfillmentQuestion5" />
            <NumberField source="fulfillmentQuestion6" />
            <NumberField source="fulfillmentQuestion7" />
            <NumberField source="fulfillmentQuestion8" />
            {/* <NumberField source="fulfillmentQuestion9" /> */}
            {/* <NumberField source="fulfillmentQuestion10" /> */}
            {/* <NumberField source="fulfillmentQuestion11" /> */}
            <NumberField source="lotteryTrack" />
            <TextField source="lotteryName" />
            {isPreview && <TextField source="newNote" />}
            {!isPreview && <DateField showDate showTime source="createdAt" />}
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
        <BooleanInput source="reportedByTatnikit" />
        <NumberInput source="grade" validate={[required()]} />
        <NumberInput source="fulfillmentQuestion1" />
        <NumberInput source="fulfillmentQuestion2" />
        <NumberInput source="fulfillmentQuestion3" />
        <NumberInput source="fulfillmentQuestion4" />
        <NumberInput source="fulfillmentQuestion5" />
        <NumberInput source="fulfillmentQuestion6" />
        <NumberInput source="fulfillmentQuestion7" />
        <NumberInput source="fulfillmentQuestion8" />
        {/* <NumberInput source="fulfillmentQuestion9" /> */}
        {/* <NumberInput source="fulfillmentQuestion10" /> */}
        {/* <NumberInput source="fulfillmentQuestion11" /> */}
        <NumberInput source="lotteryTrack" />
        <TextInput source="lotteryName" validate={[maxLength(255)]} />
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
    updateFields: ['id', 'teacherTz', '', 'studentTz', '', 'eventDate', 'eventHebrewDate', 'eventTypeId', '', '', '', '', '', '', '', '', '', '', '', 'newNote'],
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