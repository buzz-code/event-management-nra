import { useEffect } from 'react';
import { useCreatePath, useDataProvider } from "react-admin";
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

export const EventStatsCard = ({ title, resource, icon }) => {
  const dataProvider = useDataProvider();
  const createPath = useCreatePath();
  const resourcePath = createPath({ resource, type: 'list' });
  
  const { mutate, isPending, data } = useMutation({
    mutationFn: () => dataProvider.getList(resource, {
      pagination: { page: 1, perPage: 5 },
      sort: { field: 'id', order: 'DESC' }
    }),
  });

  useEffect(() => {
      mutate();
  }, [resource]);
  
  const IconComponent = icon;
  
  return (
      <Card sx={{ height: '100%' }}>
          <Box
              sx={{
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
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
                      {data.map(item => (
                          <Box key={item.id} display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2">{item.name}</Typography>
                              <Chip 
                                  size="small" 
                                  label={resource === 'gift' ? 'מתנה' : 
                                         resource === 'class' ? 'מיקום' : 'מארגן'} 
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
