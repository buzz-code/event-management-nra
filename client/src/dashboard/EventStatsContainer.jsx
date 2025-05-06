import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { EventStatsCard } from './EventStatsCard';

export const EventStatsContainer = () => {
  return (
    <Grid item xs={12} mt={3}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
        סטטיסטיקות אירועים
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <EventStatsCard
            title="מתנות פופולריות"
            resource="gift"
            icon={CardGiftcardIcon}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <EventStatsCard
            title="כיתות"
            resource="class"
            icon={LocationOnIcon}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <EventStatsCard
            title="מורות אחראיות"
            resource="teacher"
            icon={PeopleIcon}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}