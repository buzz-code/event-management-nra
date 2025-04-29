import { useMemo, useContext } from 'react';
import { CreateButton, TopToolbar, FilterButton, useListContext, useResourceContext, useResourceDefinition, FilterContext, SelectColumnsButton } from 'react-admin';
import { ResourceImportButton } from '@shared/components/crudContainers/ResourceImportButton';
import { ResourceExportButton } from './ResourceExportButton';

export const CommonListActions = ({ importer, configurable, ...props }) => {
    const {
        sort,
        filterValues,
        exporter,
        total,
        refetch,
    } = useListContext(props);
    const resource = useResourceContext(props);
    const { hasCreate } = useResourceDefinition(props);
    const filters = useContext(FilterContext);
    const { hasCreate: _, ...restProps } = props;

    return useMemo(
        () => (
            <TopToolbar {...restProps}>
                {filters && <FilterButton />}
                {hasCreate && <CreateButton />}
                {configurable && <SelectColumnsButton />}
                {exporter !== false && (
                    <ResourceExportButton
                        disabled={total === 0}
                        resource={resource}
                        sort={sort}
                        filterValues={filterValues}
                    />
                )}
                {importer !== null && (
                    <ResourceImportButton
                        resource={resource}
                        refetch={refetch}
                        fields={importer.fields}
                        datagrid={importer.datagrid}
                    />
                )}
            </TopToolbar>
        ),
        /* eslint-disable react-hooks/exhaustive-deps */
        [
            resource,
            filterValues,
            filters,
            total,
            sort,
            exporter,
            hasCreate,
        ]
    );
}
