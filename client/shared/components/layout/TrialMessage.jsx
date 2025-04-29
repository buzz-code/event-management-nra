import { useGetIdentity, usePermissions } from 'react-admin';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { useMemo } from 'react';
import { getTrialAlert } from '@shared/utils/trialUtil';

export const TrialMessage = ({ }) => {
    const { permissions } = usePermissions();
    const { data: identity } = useGetIdentity();
    const trialMessage = useMemo(() => getTrialAlert(permissions, identity), [permissions, identity]);

    if (!trialMessage) {
        return null;
    }

    return (
        <Box paddingY={2}>
            <Alert severity={trialMessage.type} variant="outlined">{trialMessage.message}</Alert>
        </Box>
    );
}
