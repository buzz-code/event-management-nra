import { openobserveRum } from '@openobserve/browser-rum';
import { openobserveLogs } from '@openobserve/browser-logs';

export const connectToOpenobserve = (options) => {
    openobserveRum.init({
        applicationId: options.applicationId, // required, any string identifying your application
        clientToken: options.clientToken,
        site: options.site,
        organizationIdentifier: options.organizationIdentifier,
        service: options.service,
        env: options.env,
        version: options.version,
        trackResources: true,
        trackLongTasks: true,
        trackUserInteractions: true,
        apiVersion: options.apiVersion,
        insecureHTTP: options.insecureHTTP,
        defaultPrivacyLevel: 'allow' // 'allow' or 'mask-user-input' or 'mask'. Use one of the 3 values.
    });

    openobserveLogs.init({
        clientToken: options.clientToken,
        site: options.site,
        organizationIdentifier: options.organizationIdentifier,
        service: options.service,
        env: options.env,
        version: options.version,
        forwardErrorsToLogs: true,
        insecureHTTP: options.insecureHTTP,
        apiVersion: options.apiVersion,
    });

    openobserveRum.startSessionReplayRecording();
}

export const setRumUser = (identity) => {
    openobserveRum.setUser({
        id: identity.id,
        name: identity.fullName,
        email: identity.username,
        userInfo: identity,
    });
}
