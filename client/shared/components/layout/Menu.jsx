import { useMemo } from 'react';
import { Menu, useHasDashboard, useResourceDefinitions } from 'react-admin';
import SubMenu from './SubMenu';

const CustomMenu = ({ menuGroups, children }) => {
    const resources = useResourceDefinitions();
    const hasDashboard = useHasDashboard();

    const [menuGroupsArr, otherResources] = useMemo(() => {
        const groupsDict = Object.fromEntries(menuGroups.map(item => (
            [item.name, {
                ...item,
                label: 'menu_groups.' + item.name,
                resources: []
            }]
        )));
        const groupsArr = Object.values(groupsDict);
        const otherResources = [];

        for (const resource of Object.values(resources)) {
            const arr = groupsDict[resource.options?.menuGroup].resources ?? otherResources;
            if (resource.hasList) {
                arr.push(resource.name);
            }
        }

        for (const group of groupsArr) {
            group.children = [...group.routes ?? []];
            group.children.unshift(...group.resources.map(name => (
                <Menu.ResourceItem key={name} name={name} />
            )));
        }

        return [
            groupsArr,
            otherResources,
        ];
    }, [resources, menuGroups]);

    return (
        <Menu>
            {hasDashboard && (
                <Menu.DashboardItem key="default-dashboard-menu-item" />
            )}
            {menuGroupsArr.map(group =>
                group.children.length > 0 && (
                    <SubMenu key={group.name} primaryText={group.label} leftIcon={group.icon}>
                        {group.children}
                    </SubMenu>
                )
            )}
            {otherResources}
            {children}
        </Menu>
    );
};

export default CustomMenu;