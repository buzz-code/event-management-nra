import { fetchUtils } from 'react-admin';

export const fetchJson = (url, options = {}) => {
    options.credentials = 'include';
    return fetchUtils.fetchJson(url, options);
}
