import { handleActionSuccess, handleError } from '@shared/utils/notifyUtil';
import { useDataProvider, useListContext, useNotify } from 'react-admin';
import { useMutation } from '@tanstack/react-query';
import { BulkRequestButton } from './BulkRequestButton';

export const BulkActionButton = ({ label, icon, name, defaultRequestValues, reloadOnEnd = false, children }) => {
    const dataProvider = useDataProvider();
    const { selectedIds, onUnselectItems, resource } = useListContext();
    const notify = useNotify();

    const { mutate, isPending } = useMutation({
        mutationFn: (data) => {
            const params = {
                ...data,
                'extra.ids': selectedIds
            };
            return dataProvider.action(resource, name, params)
                .then(handleActionSuccess(notify))
                .then(() => {
                    onUnselectItems();
                })
                .catch(handleError(notify));
        }
    });

    return <BulkRequestButton label={label} name={name} mutate={mutate} isLoading={isPending} icon={icon}
        defaultRequestValues={defaultRequestValues} reloadOnEnd={reloadOnEnd} children={children} />
}
