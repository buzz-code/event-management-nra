import React, { useCallback } from 'react';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { ResourceImportButton } from '../crudContainers/ResourceImportButton';
import { Datagrid } from 'src/entities/att-report';
import { useDataProvider, useNotify, useRedirect } from 'react-admin';
import { defaultYearFilter } from '@shared/utils/yearFilter';

export default () => {
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const redirect = useRedirect();

    const handleDataBeforePreview = useCallback(async (data) => {
        const [lessonKey, reportDate, ...rest] = data.map(item => item.data);

        const { data: lessons } = await dataProvider.getManyReference('lesson', {
            target: 'key',
            id: lessonKey,
            pagination: { page: 1, perPage: 1 },
            filter: { year: defaultYearFilter.year },
        });
        if (lessons.length === 0) {
            notify('ra.message.lesson_not_found', { type: 'error' });
            return null;
        }

        const { data: students } = await dataProvider.getManyReference('student_klass', {
            target: 'klassReferenceId',
            id: lessons[0].klassReferenceIds[0],
            pagination: { page: 1, perPage: 1000 },
            sort: { field: 'student.name', order: 'ASC' }
        });

        reportDate.setMinutes(reportDate.getMinutes() - reportDate.getTimezoneOffset() + 1);
        const baseReport = {
            reportDate: reportDate.toISOString().split('T')[0],
            teacherReferenceId: lessons[0].teacherReferenceId,
            klassReferenceId: lessons[0].klassReferenceIds[0],
            lessonReferenceId: lessons[0].id,
            howManyLessons: 1,
        };

        const absentStudents = rest
            .map((item) => ({
                ...baseReport,
                studentTz: item,
                absCount: 1,
            }));
        const attendingStudents = students
            .filter((student) => !rest.includes(student.student?.tz))
            .map((student) => ({
                ...baseReport,
                studentReferenceId: student.studentReferenceId,
                absCount: 0,
            }));
        return absentStudents.concat(attendingStudents);
    }, [dataProvider]);

    const handleSuccess = useCallback(() => {
        redirect('/att_report_with_report_month');
    }, [redirect]);

    return (
        <Container maxWidth="sm" mt={4}>
            <Paper>
                <Stack>
                    <Box padding={2}>
                        <Typography variant="h6" component="div">
                            העלאת קבצי סורק
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            בחרי את הקבצים שברצונך להעלות למערכת
                        </Typography>
                    </Box>
                    <Divider />
                    <Box padding={2}>
                        <ResourceImportButton resource='att_report' fields={['data']} datagrid={Datagrid}
                            xlsxOptions={{ range: 0 }} handleDataBeforePreview={handleDataBeforePreview} handleSuccess={handleSuccess} />
                    </Box>
                </Stack>
            </Paper>
        </Container>
    );
}