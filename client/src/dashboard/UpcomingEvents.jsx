import { useCreatePath, useGetList } from 'react-admin';
import { Link } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import EventIcon from '@mui/icons-material/Event';

export const UpcomingEvents = () => {
    const createPath = useCreatePath();
    const todayStr = new Date().toISOString().split('T')[0];
    const { data, isPending } = useGetList('event', {
        pagination: { page: 1, perPage: 5 },
        sort: { field: 'eventDate', order: 'ASC' },
        filter: { 'eventDate:$gte': todayStr },
    });
    const resource = 'event';

    return (
        <Grid item xs={12} mt={3}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                אירועים קרובים
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {isPending || !data ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                    <CircularProgress />
                </Box>
            ) : data.length > 0 ? (
                <TableContainer component={Paper}>
                    <Table aria-label="upcoming events table">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'primary.main' }}>
                                <TableCell sx={{ color: 'white' }}>שם האירוע</TableCell>
                                <TableCell align="right" sx={{ color: 'white' }}>
                                    תאריך
                                </TableCell>
                                <TableCell align="right" sx={{ color: 'white' }}>
                                    תאריך עברי
                                </TableCell>
                                <TableCell align="right" sx={{ color: 'white' }}>
                                    מורה
                                </TableCell>
                                <TableCell align="right" sx={{ color: 'white' }}>
                                    ציון
                                </TableCell>
                                <TableCell align="right" sx={{ color: 'white' }}>
                                    כיתה
                                </TableCell>
                                <TableCell align="right" sx={{ color: 'white' }}>
                                    פעולות
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((event) => (
                                <TableRow key={event.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell component="th" scope="row">
                                        <Typography fontWeight="bold">{event.name}</Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        {new Date(event.eventDate).toLocaleDateString('he-IL')}
                                    </TableCell>
                                    <TableCell align="right">{event.eventHebrewDate || '—'}</TableCell>
                                    <TableCell align="right">{event.teacher?.name || '—'}</TableCell>
                                    <TableCell align="right">{event.grade ?? '—'}</TableCell>
                                    <TableCell align="right">{event.studentClass?.name || '—'}</TableCell>
                                    <TableCell align="right">
                                        <Link to={createPath({ resource, type: 'show', id: event.id })}>
                                            <Chip label="צפה בפרטים" size="small" color="secondary" clickable />
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Box p={4} textAlign="center">
                    <Typography variant="h6" color="textSecondary">
                        אין אירועים קרובים מתוכננים
                    </Typography>
                    <Box mt={2}>
                        <Link to={createPath({ resource })}>
                            <Chip label="יצירת אירוע חדש" color="primary" icon={<EventIcon />} clickable />
                        </Link>
                    </Box>
                </Box>
            )}
        </Grid>
    );
};
