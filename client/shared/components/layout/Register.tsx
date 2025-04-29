import * as React from 'react';
import { HtmlHTMLAttributes, ReactNode, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card, Avatar, SxProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import LockIcon from '@mui/icons-material/Lock';
import { useNavigate } from 'react-router-dom';
import { useCheckAuth, useBasename, removeDoubleSlashes } from 'ra-core';

import { RegisterForm as DefaultRegisterForm } from './RegisterForm';

export const Register = (props: RegisterProps) => {
    const { children, backgroundImage, ...rest } = props;
    const containerRef = useRef<HTMLDivElement>();
    let backgroundImageLoaded = false;
    const basename = useBasename();
    const registerUrl = removeDoubleSlashes(`${basename}/register`);
    const checkAuth = useCheckAuth();
    const navigate = useNavigate();
    useEffect(() => {
        checkAuth({ force: true }, false, registerUrl)
            .then(() => {
                // already authenticated, redirect to the home page
                navigate('/');
            })
            .catch(() => {
                // not authenticated, stay on the register page
            });
    }, [checkAuth, navigate]);

    const updateBackgroundImage = () => {
        if (!backgroundImageLoaded && containerRef.current) {
            containerRef.current.style.backgroundImage = `url(${backgroundImage})`;
            backgroundImageLoaded = true;
        }
    };

    // Load background image asynchronously to speed up time to interactive
    const lazyLoadBackgroundImage = () => {
        if (backgroundImage) {
            const img = new Image();
            img.onload = updateBackgroundImage;
            img.src = backgroundImage;
        }
    };

    useEffect(() => {
        if (!backgroundImageLoaded) {
            lazyLoadBackgroundImage();
        }
    });
    return (
        <Root {...rest} ref={containerRef}>
            <Card className={RegisterClasses.card}>
                <div className={RegisterClasses.avatar}>
                    <Avatar className={RegisterClasses.icon}>
                        <LockIcon />
                    </Avatar>
                </div>
                {children}
            </Card>
        </Root>
    );
};

export interface RegisterProps extends HtmlHTMLAttributes<HTMLDivElement> {
    backgroundImage?: string;
    children?: ReactNode;
    className?: string;
    sx?: SxProps;
}

const PREFIX = 'RaRegister';
export const RegisterClasses = {
    card: `${PREFIX}-card`,
    avatar: `${PREFIX}-avatar`,
    icon: `${PREFIX}-icon`,
};

const Root = styled('div', {
    name: PREFIX,
    overridesResolver: (props, styles) => styles.root,
})(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    height: '1px',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundImage:
        'radial-gradient(circle at 50% 14em, #313264 0%, #00023b 60%, #00023b 100%)',
    overflow: 'auto',

    [`& .${RegisterClasses.card}`]: {
        minWidth: 300,
        marginBlock: '6em',
        overflow: 'initial',
    },
    [`& .${RegisterClasses.avatar}`]: {
        margin: '1em',
        display: 'flex',
        justifyContent: 'center',
    },
    [`& .${RegisterClasses.icon}`]: {
        backgroundColor: theme.palette.secondary[500],
    },
}));

Register.propTypes = {
    backgroundImage: PropTypes.string,
    children: PropTypes.node,
    className: PropTypes.string,
};

Register.defaultProps = {
    children: <DefaultRegisterForm />,
};
