import { Link, useTranslate } from 'react-admin';
import Box from '@mui/material/Box';
import { Register } from './Register';
import { RegisterForm } from './RegisterForm';

export const RegisterPage = (props) => {
    const translate = useTranslate();

    return (
        <Register {...props}>
            <RegisterForm {...props} />

            <Box height='2rem' display='flex' alignItems='center' justifyContent='center' paddingY='16px'>
                <Link to='/login'>
                    {translate('ra.auth.sign_in_invitation')}
                </Link>
            </Box>
        </Register>
    );
}
