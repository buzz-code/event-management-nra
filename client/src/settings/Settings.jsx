import React from 'react';
import { Card, CardContent } from '@mui/material';
import { SimpleForm, Title, useNotify, useGetIdentity, useDataProvider, SaveButton, Toolbar, useAuthProvider, ResourceContextProvider } from 'react-admin';
import { useNavigate } from 'react-router-dom';
import { getDefaultPageSize, getLateValue, getDashboardItems, getReportStyles, getReportCardSettings } from '@shared/utils/settingsUtil';
import { DashboardItemsInput } from './DashboardItemsInput';
import { ReportStylesInput } from './ReportStylesInput';
import { GeneralSettingsInput } from './GeneralSettingsInput';
import { ReportCardSettingsInput } from './ReportCardSettingsInput';

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
        lateValue: getLateValue(identity),
        dashboardItems: getDashboardItems(identity),
        reportStyles: getReportStyles(identity),
        reportCardSettings: getReportCardSettings(identity),
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
                        <ReportStylesInput />
                        <ReportCardSettingsInput />
                    </SimpleForm>
                </ResourceContextProvider>
            </CardContent>
        </Card>
    );
}