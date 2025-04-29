import React, { useContext } from 'react';
import { Box, Typography } from '@mui/material';
import { ReportContext } from './context';

export const ReportHeader = () => {
    const { lesson, gradeMode } = useContext(ReportContext);
    
    return (
        <Box padding={2}>
            <Typography variant="h6" component="div">
                {gradeMode ? 'הגדרת ציונים' : 'סימון נוכחות'} לתלמידות - שיעור {lesson.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {gradeMode ? 'מלאי את הציונים של התלמידות' : 'סמני את התלמידות שחסרו בשיעור'}
            </Typography>
        </Box>
    );
};
