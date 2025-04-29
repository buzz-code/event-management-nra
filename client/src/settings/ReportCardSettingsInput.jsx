import React from 'react';
import { Typography, Accordion, AccordionSummary, AccordionDetails, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { BooleanInput, Link } from 'react-admin';

export function ReportCardSettingsInput() {
  return (
    <Accordion sx={{ width: '100%' }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="report-card-settings-content"
        id="report-card-settings-header"
      >
        <Typography variant="h6">הגדרות ברירת מחדל לתעודה</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ mb: 2 }}>
          <Link to="/image" target="_blank">להגדרת תמונות</Link>
        </Box>
        <BooleanInput source="reportCardSettings.attendance" defaultChecked />
        <BooleanInput source="reportCardSettings.grades" defaultChecked />
        <BooleanInput source="reportCardSettings.showStudentTz" defaultChecked />
        <BooleanInput source="reportCardSettings.groupByKlass" />
        <BooleanInput source="reportCardSettings.hideAbsTotal" />
        <BooleanInput source="reportCardSettings.minimalReport" />
        <BooleanInput source="reportCardSettings.forceAtt" />
        <BooleanInput source="reportCardSettings.forceGrades" />
        <BooleanInput source="reportCardSettings.downComment" />
        <BooleanInput source="reportCardSettings.lastGrade" defaultChecked />
        <BooleanInput source="reportCardSettings.debug" defaultChecked />
      </AccordionDetails>
    </Accordion>
  );
}