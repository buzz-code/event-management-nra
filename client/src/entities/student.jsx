import { DateField, DateInput, DateTimeInput, Labeled, maxLength, ReferenceField, ReferenceManyField, required, SelectField, TextField, TextInput } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { defaultYearFilter, yearChoices } from '@shared/utils/yearFilter';
import { MultiReferenceField } from '@shared/components/fields/CommonReferenceField';
import { useUnique } from '@shared/utils/useUnique';
import { CommonReferenceInputFilter } from '@shared/components/fields/CommonReferenceInputFilter';
import StudentReportCardReactButton from 'src/reports/studentReportCardReactButton';

const filters = [
    ({ isAdmin }) => isAdmin && <CommonReferenceInputFilter source="userId" reference="user" />,
    ({ isAdmin }) => isAdmin && <DateInput source="createdAt:$gte" />,
    ({ isAdmin }) => isAdmin && <DateInput source="createdAt:$lte" />,
    ({ isAdmin }) => isAdmin && <DateInput source="updatedAt:$gte" />,
    ({ isAdmin }) => isAdmin && <DateInput source="updatedAt:$lte" />,
    <TextInput source="tz:$cont" label="תז" />,
    <TextInput source="name:$cont" alwaysOn />,
];

const filterDefaultValues = {
    ...defaultYearFilter,
};

const additionalBulkButtons = [
    // <BulkReportButton label='תעודה לתלמידה' icon={<NoteAltIcon />}
    //     key='studentReportCard' name='studentReportCard' filename='תעודה' />,
    <StudentReportCardReactButton key='studentReportCardReact' defaultRequestValues={filterDefaultValues} />,
];

const Datagrid = ({ isAdmin, children, ...props }) => {
    return (
        <CommonDatagrid {...props} additionalBulkButtons={additionalBulkButtons}>
            {children}
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <TextField source="tz" />
            <TextField source="name" />
            <TextField source="comment" />
            <TextField source="phone" />
            <TextField source="address" />
            {isAdmin && <DateField showDate showTime source="createdAt" />}
            {isAdmin && <DateField showDate showTime source="updatedAt" />}
        </CommonDatagrid>
    );
}

const Inputs = ({ isCreate, isAdmin }) => {
    const unique = useUnique();
    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        {isAdmin && <CommonReferenceInput source="userId" reference="user" validate={required()} />}
        <TextInput source="tz" validate={[required(), maxLength(10), unique()]} />
        <TextInput source="name" validate={[required(), maxLength(500)]} />
        <TextInput source="comment" validate={[maxLength(1000)]} />
        <TextInput source="phone" validate={[maxLength(1000)]} />
        <TextInput source="address" validate={[maxLength(1000)]} />
        {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
        {!isCreate && <Labeled label="שיוך לכיתות">
            <ReferenceManyField reference="student_klass" target="studentReferenceId">
                <CommonDatagrid>
                    <MultiReferenceField source="klassReferenceId" sortBy="klass.name" optionalSource="klassId" reference="klass" optionalTarget="key" />
                    <SelectField source="year" choices={yearChoices} />
                </CommonDatagrid>
            </ReferenceManyField>
        </Labeled>}
    </>
}

const Representation = CommonRepresentation;

const importer = {
    fields: ['tz', 'name', 'comment', 'phone', 'address'],
}

const entity = {
    Datagrid,
    Inputs,
    Representation,
    filters,
    importer,
};

export default getResourceComponents(entity);
