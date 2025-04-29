import { InputProps, UseUniqueOptions, useUnique as useUniqueBase } from "react-admin"
import { useIsAdmin } from "./permissionsUtil";
import { getDynamicFilter } from '@shared/utils/referenceUtil';

interface CommonUseUniqueOptions {
    dynamicFilter?: Record<string, any>;
}

export const useUnique = (options?: UseUniqueOptions & CommonUseUniqueOptions) => {
    const isAdmin = useIsAdmin();
    const validationFunctionWrapper = useUniqueBase(options);

    return (params: UseUniqueOptions = {}) => {
        return async (value: any, allValues: any, props: InputProps) => {
            params.filter = {
                ...params.filter,
                ...(isAdmin ? { userId: allValues.userId } : {}),
                ...getDynamicFilter(options?.dynamicFilter, allValues),
            };
            return validationFunctionWrapper(params)(value, allValues, props)
        }
    };
}