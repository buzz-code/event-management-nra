import { Link, Login, LoginForm, useTranslate } from 'react-admin';
import Box from '@mui/material/Box';

export const LoginPage = (props) => {
    const translate = useTranslate();

    return (
        <Login {...props}>
            <LoginForm {...props} />

            <Box height='2rem' display='flex' alignItems='center' justifyContent='center' paddingY='16px'>
                <Link to='/register'>
                    {translate('ra.auth.sign_up_invitation')}
                </Link>
            </Box>
        </Login>
    );
}
