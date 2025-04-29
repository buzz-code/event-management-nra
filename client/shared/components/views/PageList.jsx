import { List, RichTextField, useListContext } from "react-admin";
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


export default (props) => {
    return (
        <List resource="page" sort={{ field: 'order', order: 'ASC' }} emptyWhileLoading
            exporter={false} pagination={false} {...props}>
            <PagesData />
        </List>
    );
}

const PagesData = ({ ...props }) => {
    const { data } = useListContext();
    return (
        <Stack spacing={2} sx={{ padding: 2 }}>
            {data.map(page => (
                <Accordion key={page.id}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`${page.id}-content`} id={`${page.id}-header`}                    >
                        <Typography>{page.description}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography>
                            <RichTextField record={page} source='value' />
                        </Typography>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Stack>
    );
}
