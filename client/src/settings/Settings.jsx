import React from 'react';
import { Card, CardContent } from '@mui/material';
import { SimpleForm, Title, useNotify, useGetIdentity, useDataProvider, SaveButton, Toolbar, useAuthProvider, ResourceContextProvider } from 'react-admin';
import { useNavigate } from 'react-router-dom';
import { getDefaultPageSize } from '@shared/utils/settingsUtil';
import { getDashboardItems, getMaintainanceMessage } from './settingsUtil';
import { DashboardItemsInput } from './DashboardItemsInput';
import { GeneralSettingsInput } from './GeneralSettingsInput';

const SettingsToolbar = () => (
    <Toolbar>
        <SaveButton alwaysEnable />
    </Toolbar>
);

export default function Settings() {
    const notify = useNotify();
    const navigate = useNavigate();
    const { identity } = useGetIdentity();
    const dataProvider = useDataProvider();
    const authProvider = useAuthProvider();

    const defaultValues = {
        defaultPageSize: getDefaultPageSize(identity),
        dashboardItems: getDashboardItems(identity),
        maintainanceMessage: getMaintainanceMessage(identity),
    };

    const handleSave = async (values) => {
        try {
            await dataProvider.updateSettings({ data: values });
            await authProvider.getIdentity(true);
            notify('ההגדרות נשמרו בהצלחה', { type: 'info' });
            navigate('/');
            window.location.reload();
        } catch (e) {
            notify('שמירה נכשלה', { type: 'error' });
        }
    };

    return (
        <Card>
            <Title title="הגדרות" />
            <CardContent>
                <ResourceContextProvider value="settings">
                    <SimpleForm
                        onSubmit={handleSave}
                        defaultValues={defaultValues}
                        toolbar={<SettingsToolbar />}
                    >
                        <GeneralSettingsInput />
                        <DashboardItemsInput />
                    </SimpleForm>
                </ResourceContextProvider>
            </CardContent>
        </Card>
    );
}