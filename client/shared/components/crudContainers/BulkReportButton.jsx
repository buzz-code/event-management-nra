import { handleError } from '@shared/utils/notifyUtil';
import { useDataProvider, useListContext, useNotify } from 'react-admin';
import { useMutation } from '@tanstack/react-query';
import { BulkRequestButton } from './BulkRequestButton';

export const BulkReportButton = ({ label, icon, name, filename, defaultRequestValues = {}, requestValues = {}, reloadOnEnd = false, children }) => {
    const dataProvider = useDataProvider();
    const { selectedIds, onUnselectItems, resource } = useListContext();
    const notify = useNotify();

    const { mutate, isPending } = useMutation({
        mutationFn: (data) => {
            const params = new URLSearchParams({
                ...data,
                'extra.report': name,
                'extra.ids': selectedIds
            });

            return dataProvider.execAndDownload(resource, 'report?' + params, {}, filename)
                .then(() => {
                    notify('ra.message.report_generation_success');
                    onUnselectItems();
                })
                .catch(handleError(notify));
        }
    });

    return <BulkRequestButton label={label} name={name} mutate={mutate} isLoading={isPending} icon={icon}
                defaultRequestValues={defaultRequestValues} requestValues={requestValues}
                reloadOnEnd={reloadOnEnd} children={children} />
}
