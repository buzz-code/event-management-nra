import { useCallback } from 'react';
import { removeDoubleSlashes, useAuthProvider, useBasename, useNotificationContext } from 'react-admin';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Get a callback for calling the authProvider.register() method
 * and redirect to the previous authenticated page (or the home page) on success.
 *
 * @see useAuthProvider
 *
 * @returns {Function} register callback
 *
 * @example
 *
 * import { useRegister } from 'react-admin';
 *
 * const RegisterButton = () => {
 *     const [loading, setLoading] = useState(false);
 *     const register = useRegister();
 *     const handleClick = {
 *         setLoading(true);
 *         register({ username: 'john', password: 'p@ssw0rd' }, '/posts')
 *             .then(() => setLoading(false));
 *     }
 *     return <button onClick={handleClick}>Register</button>;
 * }
 */
const useRegister = (): Register => {
    const authProvider = useAuthProvider();
    const location = useLocation();
    const locationState = location.state as any;
    const navigate = useNavigate();
    const basename = useBasename();
    const { resetNotifications } = useNotificationContext();
    const nextPathName = locationState && locationState.nextPathname;
    const nextSearch = locationState && locationState.nextSearch;
    const afterLoginUrl = removeDoubleSlashes(`${basename}/`);

    const register = useCallback(
        (params: any = {}, pathName) =>
            authProvider.register(params).then(ret => {
                resetNotifications();
                if (ret && ret.hasOwnProperty('redirectTo')) {
                    if (ret) {
                        navigate(ret.redirectTo);
                    }
                } else {
                    const redirectUrl = pathName
                        ? pathName
                        : nextPathName + nextSearch || afterLoginUrl;
                    navigate(redirectUrl);
                }
                return ret;
            }),
        [
            authProvider,
            navigate,
            nextPathName,
            nextSearch,
            resetNotifications,
            afterLoginUrl,
        ]
    );

    const registerWithoutProvider = useCallback(
        (_, __) => {
            resetNotifications();
            navigate(afterLoginUrl);
            return Promise.resolve();
        },
        [navigate, resetNotifications, afterLoginUrl]
    );

    return authProvider ? register : registerWithoutProvider;
};

/**
 * Log a user in by calling the authProvider.register() method
 *
 * @param {Object} params register parameters to pass to the authProvider. May contain username/email, password, etc
 * @param {string} pathName The path to redirect to after register. By default, redirects to the home page, or to the last page visited after disconnection.
 *
 * @return {Promise} The authProvider response
 */
type Register = (params: any, pathName?: string) => Promise<any>;

export default useRegister;
