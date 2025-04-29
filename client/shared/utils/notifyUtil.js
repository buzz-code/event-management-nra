export const handleError = (notify) => (error) => {
    notify(
        typeof error === 'string'
            ? error
            : error.message ?? error.body?.message ?? 'ra.notification.http_error',
        {
            type: 'error',
            messageArgs: {
                _: typeof error === 'string'
                    ? error
                    : error && error.message
                        ? error.message
                        : undefined
            }
        }
    );
};

export const handleActionSuccess = (notify) => (response) => {
    console.log('handleActionSuccess', response);
    notify(
        typeof response.body === 'string'
            ? response.body
            : response.body?.message ?? 'ra.message.action_success',
        {
            type: 'info',
            messageArgs: {
                _: typeof response === 'string'
                    ? response
                    : response && response.message
                        ? response.message
                        : undefined
            }
        }
    );
}
