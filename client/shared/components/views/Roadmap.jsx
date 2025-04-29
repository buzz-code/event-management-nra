import React from 'react';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { lighten } from '@mui/material/styles';

export default ({ features }) => {
    const colors = {
        primary: '#2196f3',
        success: '#4caf50',
        warning: '#ff9800',
        error: '#f44336',
    };

    return (
        <Container maxWidth="md" mt={4}>
            <Paper>
                <Stack>
                    <Box padding={2}>
                        <Typography variant="h6" component="div">
                            פיתוחים עתידיים
                        </Typography>
                        <Divider />
                        <Stack spacing={2} mt={2}>
                            {features.map((feature, index) => (
                                <Stack key={index} direction="row" alignItems="center" gap={1}>
                                    <Typography variant="body1" component="div">
                                        {feature.html}
                                    </Typography>
                                    <Typography variant="body1" component="div" color={colors[feature.statusColor]}
                                        fontSize={14} px={1} py={0.5}
                                        borderRadius='50vh' bgcolor={lighten(colors[feature.statusColor], 0.875)} >
                                        {feature.status}
                                    </Typography>
                                </Stack>
                            ))}
                        </Stack>
                    </Box>
                </Stack>
            </Paper>
        </Container>
    );
}