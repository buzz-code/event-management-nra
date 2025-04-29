import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { apiUrl } from '@shared/providers/constantsProvider';

export default ({ }) => {
    return (
        <Container maxWidth="sm" mt={1}>
            <Paper>
                <Stack>
                    <Box padding={2}>
                        <Typography variant='h5'>
                            חיבור למערכת טלפונית של ימות המשיח
                        </Typography>
                        <Typography variant='body1'>
                            הכנסו לאתר של ימות המשיח&nbsp;
                            <a href='https://www.call2all.co.il/yemot-admin-g1/#/IVR?filter={%22path%22:%22/%22}' target='_blank'>
                                כאן
                            </a>
                            .
                            <br />
                            השתמשו במספר הטלפון והסיסמא של המערכת הטלפונית שתרצו לחבר.
                            <br />
                            הכנסו לתפריט של "השלוחות במערכת".
                            <br />
                            אתרו את הקובץ שנקרא "ext.ini" ולחצו עליו.
                            <br />
                            הדביקו בחלון שנפתח את הטקסט שמופיע למטה, ושמרו את הקובץ.
                            <br />
                            <pre dir='ltr'>
                                type=api
                                {'\r\n'}
                                api_link={apiUrl}/yemot/handle-call
                                {'\r\n'}
                                api_url_post=yes
                                {'\r\n'}
                                api_hangup_send=yes
                                {'\r\n'}
                                tts_voice=Sivan
                            </pre>
                        </Typography>
                    </Box>
                </Stack>
            </Paper>
        </Container>
    )
}