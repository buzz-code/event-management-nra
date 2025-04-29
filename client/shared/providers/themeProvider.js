import { defaultTheme } from 'react-admin';

/**
 * Creates a theme with customizable colors
 * @param {Object} options - Theme customization options
 * @param {string} options.primary - Primary color (default: undefined - uses React Admin default)
 * @param {string} options.secondary - Secondary color (default: undefined - uses React Admin default)
 * @param {string} options.error - Error color (default: undefined - uses React Admin default)
 * @param {string} options.info - Info color (default: undefined - uses React Admin default)
 * @param {string} options.success - Success color (default: undefined - uses React Admin default)
 * @param {string} options.warning - Warning color (default: undefined - uses React Admin default)
 * @param {boolean} options.isRtl - Whether the theme is RTL (default: true)
 * @returns {Object} Customized theme object
 */
export const createTheme = (options = {}) => {
    const {
        primary,
        secondary,
        error,
        info,
        success,
        warning,
        isRtl = true
    } = options;

    return {
        ...defaultTheme,
        direction: isRtl ? 'rtl' : 'ltr',
        isRtl,
        palette: {
            type: "light",
            mode: "light",
            ...(primary && { primary: { main: primary } }),
            ...(secondary && { secondary: { main: secondary } }),
            ...(error && { error: { main: error } }),
            ...(info && { info: { main: info } }),
            ...(success && { success: { main: success } }),
            ...(warning && { warning: { main: warning } }),
        },
        // components: {
        //     ...defaultTheme.components,
        //     RaLayout: {
        //         styleOverrides: {
        //             root: {
        //                 "& .RaLayout-appFrame": {
        //                     maxWidth: '100vw',
        //                     overflow: 'auto',
        //                 },
        //             }
        //         }
        //     }
        // }
    };
};

// Default theme for backward compatibility
const theme = createTheme();

export default theme;