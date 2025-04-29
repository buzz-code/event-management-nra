import { SortPayload } from 'react-admin';

export const defaultSortBy: SortPayload = { field: 'name', order: 'ASC' };

export const getDynamicFilter = (dynamicFilter: Record<string, any>, fullValues: Record<string, any>) => {
    const res = {};
    if (dynamicFilter) {
        for (const key in dynamicFilter) {
            if (Object.hasOwnProperty.call(dynamicFilter, key)) {
                const value = fullValues[key];
                if (value) {
                    res[key] = value;
                } else {
                    delete res[key];
                }
            }
        }
    }
    return res;
}