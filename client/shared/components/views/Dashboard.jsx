import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { createElement, useCallback, useEffect } from 'react';
import { Form, Title, useDataProvider, useGetResourceLabel, useCreatePath } from 'react-admin';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import CommonAutocompleteInput from '../fields/CommonAutocompleteInput';
import { defaultYearFilter, updateDefaultYear, yearChoices } from '@shared/utils/yearFilter';
import { useDashboardItems } from '@shared/utils/settingsUtil';
import ListIcon from '@mui/icons-material/List';
import PersonIcon from '@mui/icons-material/Person';

const iconMap = {
    List: ListIcon,
    Person: PersonIcon,
    // Add more icons as needed
};

export default () => {
    const items = useDashboardItems();
    const handleYearChange = useCallback((value) => {
        updateDefaultYear(value);
        window.location.reload();
    }, []);

    return <Grid container spacing={2} mt={1}>
        <Grid item xs={12}>
            <Title title={"לוח המחוונים"} />
        </Grid>
        <Grid item xs={3}>
            <Form>
                <CommonAutocompleteInput source="year" label="שנה" choices={yearChoices} defaultValue={defaultYearFilter.year} onChange={handleYearChange} disableClearable />
            </Form>
        </Grid>
        <Grid item xs={12}>
            <Divider />
        </Grid>
        {items.map((item, index) => (
            <Grid item xs={6} md={3} key={index}>
                <DashboardItem {...item} />
            </Grid>
        ))}
    </Grid>
}

const DashboardItem = ({ resource, icon = 'List', title, filter = {}, yearFilterType = 'year' }) => {
    const getResourceLabel = useGetResourceLabel();
    const dataProvider = useDataProvider();
    const createPath = useCreatePath();
    const resourcePath = createPath({ resource, type: 'list' });

    const mergedFilter = {
        ...filter,
        ...(yearFilterType === 'year' && { year: defaultYearFilter.year }),
        ...(yearFilterType === 'year:$cont' && { 'year:$cont': defaultYearFilter.year })
    };

    const { mutate, isPending, data } = useMutation({
        mutationFn: () => dataProvider.getCount(resource, { filter: mergedFilter })
    });

    useEffect(() => {
        mutate();
    }, []);

    const IconComponent = iconMap[icon] || iconMap.List;

    return (
        <CardWithIcon
            to={{ pathname: resourcePath, search: 'filter=' + JSON.stringify(mergedFilter) }}
            icon={IconComponent}
            title={title || getResourceLabel(resource)}
            subtitle={isPending ? <Loading /> : data}
        />
    )
}

const Loading = () => (
    <Box height='2rem' display='flex' alignItems='center' justifyContent='center'>
        <CircularProgress size='1.5rem' />
    </Box>
)

const CardWithIcon = ({ icon, title, subtitle, to, children }) => {
    return (
        <Card
            sx={{
                minHeight: 52,
                display: 'flex',
                flexDirection: 'column',
                flex: '1',
                '& a': {
                    textDecoration: 'none',
                    color: 'inherit',
                },
            }}
        >
            <Link to={to}>
                <Box
                    sx={{
                        overflow: 'inherit',
                        padding: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        '& .icon': {
                            color: theme =>
                                theme.palette.mode === 'dark'
                                    ? 'inherit'
                                    : '#dc2440',
                        },
                    }}
                >
                    <Box width="3em" className="icon">
                        {createElement(icon, { fontSize: 'large' })}
                    </Box>
                    <Box textAlign="right">
                        <Typography color="textSecondary">{title}</Typography>
                        <Typography variant="h5" component="h2">
                            {subtitle ?? ' '}
                        </Typography>
                    </Box>
                </Box>
            </Link>
            {children && <Divider />}
            {children}
        </Card>
    );
};
