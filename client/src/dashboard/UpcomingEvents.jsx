import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useDataProvider, useCreatePath, useGetPathForRecordCallback } from 'react-admin';
import { Link } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import EventIcon from '@mui/icons-material/Event';

export const UpcomingEvents = () => {
  const dataProvider = useDataProvider();
  const { mutate, isPending, data } = useMutation({
    mutationFn: () => dataProvider.getList('event', {
      pagination: { page: 1, perPage: 5 },
      sort: { field: 'eventDate', order: 'ASC' },
      filter: { 'eventDate:$gte': new Date().toISOString().split('T')[0] }
    }),
  });
  const createPath = useCreatePath();
  const getPathForRecord = useGetPathForRecordCallback();
  const resource = 'event';

  useEffect(() => {
    mutate();
  }, []);

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
                <TableCell align="right" sx={{ color: 'white' }}>תאריך</TableCell>
                <TableCell align="right" sx={{ color: 'white' }}>מיקום</TableCell>
                <TableCell align="right" sx={{ color: 'white' }}>סוג אירוע</TableCell>
                <TableCell align="right" sx={{ color: 'white' }}>משתתפים צפויים</TableCell>
                <TableCell align="right" sx={{ color: 'white' }}>פעולות</TableCell>
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
                  <TableCell align="right">{event.location}</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={event.eventTypeName || 'כללי'}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">{event.expectedParticipants || 'לא צוין'}</TableCell>
                  <TableCell align="right">
                    <Link to={getPathForRecord({ resource, record: event })}>
                      <Chip
                        label="צפה בפרטים"
                        size="small"
                        color="secondary"
                        clickable
                      />
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
              <Chip
                label="יצירת אירוע חדש"
                color="primary"
                icon={<EventIcon />}
                clickable
              />
            </Link>
          </Box>
        </Box>
      )}
    </Grid>
  );
}