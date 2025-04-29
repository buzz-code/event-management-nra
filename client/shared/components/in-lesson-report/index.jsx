import React, { useCallback, useState } from 'react';
import { Container, Paper, Stack } from '@mui/material';
import { ReportContext, defaultContextValue } from './context';
import { LessonSelector } from './LessonSelector';
import { MainReport } from './MainReport';
import { round } from '@shared/utils/numericUtil';
import { useLateValue } from '@shared/utils/settingsUtil';

export const InLessonReport = ({
    gradeMode,
    resource,
    Datagrid,
    handleSuccess,
    setDataToSave,
    data,
    saveData,
    isShowLate
}) => {
    const [lesson, setLesson] = useState(null);
    const [students, setStudents] = useState(null);
    const lateValue = useLateValue();

    const handleLessonFound = useCallback(({ lesson, students }) => {
        setLesson(lesson);
        setStudents(students);
    }, []);

    const handleCancel = useCallback(() => {
        setLesson(null);
        setDataToSave(null);
    }, []);

    const handleSave = useCallback((formData) => {
        const { reportDates, howManyLessons, ...rest } = formData;
        const dataToSave = [];

        const entry = {
            teacherReferenceId: lesson.teacherReferenceId,
            klassReferenceId: lesson.klassReferenceIds[0],
            lessonReferenceId: lesson.id,
        };
        reportDates.forEach((reportDate, index) => {
            const reportDateEntry = { ...entry, reportDate };
            Object.keys(rest).forEach((studentId) => {
                const newEntry = { ...reportDateEntry, studentReferenceId: studentId };
                if (gradeMode) {
                    newEntry.grade = rest[studentId]?.[`grade_${index}`] ?? 0;
                    newEntry.comments = rest[studentId]?.[`comments_${index}`] ?? '';
                } else {
                    newEntry.howManyLessons = howManyLessons;
                    newEntry.absCount = round(
                        (rest[studentId]?.[`absence_${index}`] ?? 0) +
                        (rest[studentId]?.[`late_${index}`] ?? 0) * lateValue
                    );
                }
                dataToSave.push(newEntry);
            });
        });

        setDataToSave(dataToSave);
    }, [lesson, gradeMode]);

    const contextValue = {
        ...defaultContextValue,
        gradeMode,
        isShowLate,
        lesson,
        students,
        resource,
        Datagrid,
        data,
        saveData,
        handleSuccess,
        handleCancel,
    };

    return (
        <Container fixed mt={4}>
            <Paper>
                <Stack>
                    {!lesson ? (
                        <LessonSelector onLessonFound={handleLessonFound} />
                    ) : (
                        <ReportContext.Provider value={contextValue}>
                            <MainReport gradeMode={gradeMode} handleSave={handleSave} />
                        </ReportContext.Provider>
                    )}
                </Stack>
            </Paper>
        </Container>
    );
};