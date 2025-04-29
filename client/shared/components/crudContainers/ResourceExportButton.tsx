import * as React from 'react';
import { useCallback } from 'react';
import PropTypes from 'prop-types';
import DownloadIcon from '@mui/icons-material/GetApp';
import DownloadingIcon from '@mui/icons-material/Downloading';
import {
    useDataProvider,
    useNotify,
    useListContext,
    SortPayload,
    FilterPayload,
    useResourceContext,
    useGetResourceLabel,
    useTranslate,
} from 'ra-core';
import { Button, ButtonProps } from 'react-admin';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useIsAdmin } from '@shared/utils/permissionsUtil';
import { handleError } from '@shared/utils/notifyUtil';

export const ResourceExportButton = (props: ExportButtonProps) => {
    const {
        maxResults = 20000,
        onClick,
        label = 'ra.action.export',
        icon = defaultIcon,
        ...rest
    } = props;
    const {
        filter,
        filterValues,
        sort,
        total,
    } = useListContext(props);
    const resource = useResourceContext(props);
    const dataProvider = useDataProvider();
    const translate = useTranslate()
    const getResourceLabel = useGetResourceLabel();
    const notify = useNotify();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [isLoading, setIsLoading] = React.useState<Boolean>(false);
    const open = Boolean(anchorEl);
    const isAdmin = useIsAdmin();
    const handleExport = useCallback(
        format => {
            setIsLoading(true);
            dataProvider
                .export(resource,
                    {
                        sort,
                        filter: filter
                            ? { ...filterValues, ...filter }
                            : filterValues,
                        pagination: { page: 1, perPage: maxResults },
                    },
                    format,
                    getResourceLabel(resource))
                .catch(handleError(notify))
                .finally(() => {
                    setIsLoading(false);
                });
        },
        [
            dataProvider,
            filter,
            filterValues,
            maxResults,
            getResourceLabel,
            notify,
            resource,
            sort,
        ]
    );

    const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    }, [setAnchorEl]);
    const handleClose = useCallback(() => setAnchorEl(null), [setAnchorEl]);
    const handleExportExcel = useCallback(() => (handleClose(), handleExport('excel')), [handleClose, handleExport]);
    const handleExportPdf = useCallback(() => (handleClose(), handleExport('pdf')), [handleClose, handleExport]);
    const handleExportJson = useCallback(() => (handleClose(), handleExport('json')), [handleClose, handleExport]);

    return <>
        <Button
            onClick={handleClick}
            label={label}
            disabled={total === 0}
            {...sanitizeRestProps(rest)}
        >
            {isLoading ? loader : icon}
        </Button>
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
        >
            <MenuItem onClick={handleExportExcel}>{translate('ra.action.export_excel')}</MenuItem>
            <MenuItem onClick={handleExportPdf}>{translate('ra.action.export_pdf')}</MenuItem>
            {isAdmin && <MenuItem onClick={handleExportJson}>{translate('ra.action.export_json')}</MenuItem>}
        </Menu>
    </>;
};

const defaultIcon = <DownloadIcon />;
const loader = <DownloadingIcon />;

const sanitizeRestProps = ({
    filterValues,
    resource,
    ...rest
}: Omit<ExportButtonProps, 'sort' | 'maxResults' | 'label'>) =>
    rest;

interface Props {
    filterValues?: FilterPayload;
    icon?: JSX.Element;
    label?: string;
    maxResults?: number;
    onClick?: (e: Event) => void;
    resource?: string;
    sort?: SortPayload;
}

export type ExportButtonProps = Props & ButtonProps;

ResourceExportButton.propTypes = {
    filterValues: PropTypes.object,
    label: PropTypes.string,
    maxResults: PropTypes.number,
    resource: PropTypes.string,
    sort: PropTypes.exact({
        field: PropTypes.string,
        order: PropTypes.string,
    }),
    icon: PropTypes.element,
};
