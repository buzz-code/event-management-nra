import React from 'react';
import { Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { NumberInput, required, TextInput } from 'react-admin';
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
        <TextInput
          source="maintainanceMessage"
          fullWidth
          helperText="הודעה שתוצג למתקשרים בזמן תחזוקה. השאר ריק כדי לאפשר שיחות רגילות."
        />
      </AccordionDetails>
    </Accordion >
  );
}
