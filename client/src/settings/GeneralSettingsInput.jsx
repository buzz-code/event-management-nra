import React from 'react';
import { Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { NumberInput, required } from 'react-admin';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';
import { PAGE_SIZE_OPTIONS } from '@shared/config/settings';

const pageSizeOptions = PAGE_SIZE_OPTIONS.map(option => ({ id: option, name: option }));

export function GeneralSettingsInput() {
  return (
    <Accordion sx={{ width: '100%' }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="general-settings-content"
        id="general-settings-header"
      >
        <Typography variant="h6">הגדרות כלליות</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <CommonAutocompleteInput
          source="defaultPageSize"
          choices={pageSizeOptions}
          fullWidth
          disableClearable
          validate={required()}
        />
        <NumberInput
          source="lateValue"
          fullWidth
          validate={required()}
        />
      </AccordionDetails>
    </Accordion >
  );
}
