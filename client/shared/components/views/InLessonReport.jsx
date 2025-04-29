import React, { useCallback, useMemo, useState } from 'react';
import { useRedirect } from 'react-admin';
import { useSavableData } from '../import/util';
import { Datagrid as AttDatagrid } from 'src/entities/att-report';
import { Datagrid as GradeDatagrid } from 'src/entities/grade';
import { useIsInLessonReportWithLate } from '@shared/utils/permissionsUtil';
import { InLessonReport } from '../in-lesson-report';

const entityConfig = [
    {
        index: 0,
        entityLabel: 'נוכחות',
        resource: 'att_report',
        Datagrid: AttDatagrid,
        redirectUrl: '/att_report_with_report_month',
    },
    {
        index: 1,
        entityLabel: 'ציון',
        resource: 'grade',
        Datagrid: GradeDatagrid,
        redirectUrl: '/grade',
    },
];

export default ({ gradeMode = false }) => {
    const redirect = useRedirect();
    const isShowLate = useIsInLessonReportWithLate();
    const { entityLabel, resource, Datagrid, redirectUrl } = useMemo(() => entityConfig[gradeMode ? 1 : 0], [gradeMode]);
    const fileName = useMemo(() => 'דיווח ' + entityLabel + ' ' + new Date().toISOString().split('T')[0], [entityLabel]);
    const [dataToSave, setDataToSave] = useState(null);
    const { data, saveData } = useSavableData(resource, fileName, dataToSave);

    const handleSuccess = useCallback(() => {
        redirect(redirectUrl);
    }, [redirect, redirectUrl]);

    return (
        <InLessonReport
            gradeMode={gradeMode}
            resource={resource}
            Datagrid={Datagrid}
            fileName={fileName}
            handleSuccess={handleSuccess}
            setDataToSave={setDataToSave}
            data={data}
            saveData={saveData}
            isShowLate={isShowLate}
        />
    );
};