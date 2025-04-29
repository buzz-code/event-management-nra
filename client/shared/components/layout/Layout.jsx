import { Layout, useGetIdentity, usePermissions } from 'react-admin';
import { useEffect } from 'react';
import CustomMenu from '@shared/components/layout/Menu';
import { useIsAdmin } from '@shared/utils/permissionsUtil';
import { filterArrayByParams } from '@shared/utils/filtersUtil';
import { TrialMessage } from './TrialMessage';
import { setRumUser } from '@shared/utils/openobserveRumUtil';

const CustomLayout = ({ customMenuItems, menuGroups, children }) => {
    const isAdmin = useIsAdmin();
    const { permissions } = usePermissions();
    const { data: identity } = useGetIdentity();
    const customMenuItemsArr = filterArrayByParams(customMenuItems, { isAdmin, permissions });

    useEffect(() => {
        if (identity) {
            setRumUser(identity);
        }
    }, [identity]);

    const Menu = () => (
        <CustomMenu menuGroups={menuGroups}>
            {customMenuItemsArr}
        </CustomMenu>
    );

    return (
        <Layout menu={Menu}>
            <TrialMessage />

            {children}
        </Layout>
    )
}

export default CustomLayout;