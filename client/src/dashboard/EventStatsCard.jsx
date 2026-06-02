import { useCreatePath, useGetList } from 'react-admin';
import { Link } from 'react-router-dom';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

const chipLabels = {
    gift: 'מתנה',
    class: 'כיתה',
    teacher: 'מורה אחראית',
};

export const EventStatsCard = ({ title, resource, icon }) => {
    const createPath = useCreatePath();
    const resourcePath = createPath({ resource, type: 'list' });

    const { data, isPending } = useGetList(resource, {
        pagination: { page: 1, perPage: 5 },
        sort: { field: 'id', order: 'DESC' },
    });

    const IconComponent = icon;

    return (
        <Card sx={{ height: '100%' }}>
            <Box
                sx={{
                    padding: 2,
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                }}
            >
                <Box color="primary.main" pr={1}>
                    <IconComponent />
                </Box>
                <Typography variant="h6">{title}</Typography>
            </Box>

            <Box p={2}>
                {isPending || !data ? (
                    <Box display="flex" justifyContent="center" py={2}>
                        <CircularProgress size={24} />
                    </Box>
                ) : data.length > 0 ? (
                    <Stack spacing={1}>
                        {data.map((item) => (
                            <Box key={item.id} display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2">{item.name}</Typography>
                                <Chip
                                    size="small"
                                    label={chipLabels[resource]}
                                    color="primary"
                                    variant="outlined"
                                />
                            </Box>
                        ))}
                    </Stack>
                ) : (
                    <Typography color="textSecondary" align="center">
                        אין נתונים להצגה
                    </Typography>
                )}
            </Box>

            <Box p={1} borderTop="1px solid rgba(0, 0, 0, 0.12)" textAlign="center">
                <Link to={resourcePath} style={{ textDecoration: 'none' }}>
                    <Typography color="primary" variant="body2">
                        צפה בכל ה{title}
                    </Typography>
                </Link>
            </Box>
        </Card>
    );
};
