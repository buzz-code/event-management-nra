import { useMemo } from 'react';
import { DateField, DateTimeInput, FunctionField, Labeled, NumberField, ReferenceField, TextField, TextInput, required, useGetMany, useRecordContext } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { commonAdminFilters } from '@shared/components/fields/PermissionFilter';
import { defaultYearFilter, yearChoices } from '@shared/utils/yearFilter';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';

const HistoryList = () => {
    const record = useRecordContext();
    const items = useMemo(() => record?.historyJson || [], [record?.historyJson]);
    const teacherIds = useMemo(
        () => [...new Set(items.map(i => i.teacherReferenceId).filter(Boolean))],
        [items]
    );
    const { data: teachers } = useGetMany('teacher', { ids: teacherIds });
    const teacherMap = useMemo(
        () => (teachers || []).reduce((acc, t) => ({ ...acc, [t.id]: t.name }), {}),
        [teachers]
    );

    if (!items.length) return null;

    return (
        <Labeled source="historyJson">
            <ul style={{ margin: 0, paddingInlineStart: 16 }}>
                {items.map((item, i) => (
                    <li key={i}>
                        {teacherMap[item.teacherReferenceId] || `מורה #${item.teacherReferenceId}`}
                        {item.assignedAt ? ` — ${new Date(item.assignedAt).toLocaleDateString('he-IL')}` : ''}
                        {item.source ? ` (${item.source})` : ''}
                    </li>
                ))}
            </ul>
        </Labeled>
    );
};

const filters = [
    ...commonAdminFilters,
    <CommonAutocompleteInput source="year" choices={yearChoices} alwaysOn />,
    <TextInput source="familyReferenceId" alwaysOn />,
    <CommonReferenceInput source="teacherReferenceId" reference="teacher" alwaysOn />,
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
            <NumberField source="year" />
            <TextField source="familyReferenceId" />
            <ReferenceField source="teacherReferenceId" reference="teacher" />
            <FunctionField source="historyJson" render={r => {
                const items = r.historyJson || [];
                return items.length ? `${items.length} שיוכים` : '—';
            }} />
            {isAdmin && <DateField showDate showTime source="createdAt" />}
            {isAdmin && <DateField showDate showTime source="updatedAt" />}
        </CommonDatagrid>
    );
};

const Inputs = ({ isCreate, isAdmin }) => {
    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        {isAdmin && <CommonReferenceInput source="userId" reference="user" validate={required()} />}
        <CommonAutocompleteInput source="year" choices={yearChoices} defaultValue={defaultYearFilter.year} />
        <TextInput source="familyReferenceId" />
        <CommonReferenceInput source="teacherReferenceId" reference="teacher" />
        {!isCreate && <HistoryList />}
        {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
    </>;
};

const Representation = CommonRepresentation;

const entity = {
    Datagrid,
    Inputs,
    Representation,
    filters,
    filterDefaultValues,
};

export default getResourceComponents(entity);
