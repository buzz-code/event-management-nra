import * as React from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { Button, CardContent, Grid, CircularProgress, Typography } from '@mui/material';
import {
    Form,
    required,
    email,
    useTranslate,
    useNotify,
    useSafeSetState,
} from 'ra-core';
import { TextInput } from 'react-admin';

import useRegister from '../../utils/useRegister';

const confirmValue = (field) => (value, allValues) =>
    value === allValues[field]
        ? undefined
        : 'ra.validation.valueConfirm';

const passwordConfirmValidation = [required(), confirmValue('password')];

export const RegisterForm = (props: RegisterFormProps) => {
    const { redirectTo, className } = props;
    const [loading, setLoading] = useSafeSetState(false);
    const register = useRegister();
    const translate = useTranslate();
    const notify = useNotify();

    const submit = (values: FormData) => {
        setLoading(true);
        register(values, redirectTo)
            .then(() => {
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                notify(
                    typeof error === 'string'
                        ? error
                        : typeof error === 'undefined' || !error.message
                            ? 'ra.auth.sign_in_error'
                            : error.message,
                    {
                        type: 'error',
                        messageArgs: {
                            _:
                                typeof error === 'string'
                                    ? error
                                    : error && error.message
                                        ? error.message
                                        : undefined,
                        },
                    }
                );
            });
    };

    return (
        <StyledForm
            onSubmit={submit}
            mode="onChange"
            noValidate
            className={className}
        >
            <CardContent className={RegisterFormClasses.content}>
                <TextInput
                    autoFocus
                    source="username"
                    label={translate('ra.auth.username')}
                    validate={[required(), email()]}
                    fullWidth
                />
                <TextInput
                    source="password"
                    label={translate('ra.auth.password')}
                    type="password"
                    autoComplete="current-password"
                    validate={required()}
                    fullWidth
                />
                <TextInput
                    source="passwordConfirm"
                    label={translate('ra.auth.password_confirm')}
                    type="password"
                    validate={passwordConfirmValidation}
                    fullWidth
                />

                <Typography>{translate('ra.auth.user_info_header')}</Typography>
                <Grid container columnSpacing={2}>
                    <Grid item xs={6}>
                        <TextInput
                            source="userInfo.name"
                            label={translate('ra.auth.name')}
                            validate={[required()]}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextInput
                            source="userInfo.role"
                            label={translate('ra.auth.role')}
                            validate={[required()]}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextInput
                            source="userInfo.phone"
                            label={translate('ra.auth.phone')}
                            validate={[required()]}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextInput
                            source="userInfo.email"
                            label={translate('ra.auth.email')}
                            validate={[required()]}
                            fullWidth
                        />
                    </Grid>
                </Grid>

                <Typography>{translate('ra.auth.user_organization_info_header')}</Typography>
                <Grid container columnSpacing={2}>
                    <Grid item xs={6}>
                        <TextInput
                            source="userInfo.organizationName"
                            label={translate('ra.auth.organization_name')}
                            validate={[required()]}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextInput
                            source="userInfo.organizationAddress"
                            label={translate('ra.auth.organization_address')}
                            validate={[required()]}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextInput
                            source="userInfo.organizationPhone"
                            label={translate('ra.auth.organization_phone')}
                            validate={[]}
                            fullWidth
                        />
                    </Grid>
                </Grid>

                <Button
                    variant="contained"
                    type="submit"
                    color="primary"
                    disabled={loading}
                    fullWidth
                    className={RegisterFormClasses.button}
                >
                    {loading ? (
                        <CircularProgress
                            className={RegisterFormClasses.icon}
                            size={19}
                            thickness={3}
                        />
                    ) : (
                        translate('ra.auth.sign_up')
                    )}
                </Button>
            </CardContent>
        </StyledForm>
    );
};

const PREFIX = 'RaRegisterForm';

export const RegisterFormClasses = {
    content: `${PREFIX}-content`,
    button: `${PREFIX}-button`,
    icon: `${PREFIX}-icon`,
};

const StyledForm = styled(Form, {
    name: PREFIX,
    overridesResolver: (props, styles) => styles.root,
})(({ theme }) => ({
    [`& .${RegisterFormClasses.content}`]: {
        width: 500,
    },
    [`& .${RegisterFormClasses.button}`]: {
        marginTop: theme.spacing(2),
    },
    [`& .${RegisterFormClasses.icon}`]: {
        margin: theme.spacing(0.3),
    },
}));

export interface RegisterFormProps {
    redirectTo?: string;
    className?: string;
}

interface FormData {
    username: string;
    password: string;
    userInfo: {
        name: string;
        role: string;
        phone: string;
        email: string;
        organizationName: string;
        organizationAddress: string;
        organizationPhone: string;
    }
}
RegisterForm.propTypes = {
    redirectTo: PropTypes.string,
};
