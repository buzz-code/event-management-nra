import { MenuItemLink } from 'react-admin';
import SummarizeIcon from '@mui/icons-material/Summarize';
import HelpIcon from '@mui/icons-material/Help';
import ImportContactsIcon from '@mui/icons-material/ImportContacts';
import CallIcon from '@mui/icons-material/Call';
import SettingsIcon from '@mui/icons-material/Settings';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import DatasetIcon from '@mui/icons-material/Dataset';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MapIcon from '@mui/icons-material/Map';
import ContentPasteSearchIcon from '@mui/icons-material/ContentPasteSearch';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PercentIcon from '@mui/icons-material/Percent';

import BaseLayout from "@shared/components/layout/Layout";
import BaseDashboard from '@shared/components/views/Dashboard';
import { isInLessonReport, isScannerUpload } from '../shared/utils/permissionsUtil';

const customMenuItems = [
    <MenuItemLink key="tutorial" to="/tutorial" primaryText="מדריך למשתמש" leftIcon={<HelpIcon />} />,
    <MenuItemLink key="pages-view" to="/pages-view" primaryText="הסברים נוספים" leftIcon={<ImportContactsIcon />} />,
    ({ isAdmin }) => isAdmin && <MenuItemLink key="yemot-simulator" to="/yemot-simulator" primaryText="סימולטור" leftIcon={<CallIcon />} />,
    ({ permissions }) => isScannerUpload(permissions) && <MenuItemLink key="scanner-upload" to="/scanner-upload" primaryText="העלאת קבצי סורק" leftIcon={<DocumentScannerIcon />} />,
    ({ permissions }) => isInLessonReport(permissions) && <MenuItemLink key="in-lesson-report-att" to="/in-lesson-report-att" primaryText="טופס נוכחות" leftIcon={<EventAvailableIcon />} />,
    ({ permissions }) => isInLessonReport(permissions) && <MenuItemLink key="in-lesson-report-grade" to="/in-lesson-report-grade" primaryText="טופס ציונים" leftIcon={<EditCalendarIcon />} />,
    <MenuItemLink key="roadmap" to="/roadmap" primaryText="פיתוחים עתידיים" leftIcon={<MapIcon />} />,
    <MenuItemLink key="michlol-file-helper" to="/michlol-file-helper" primaryText="עדכון קבצי מכלול" leftIcon={<ContentPasteSearchIcon />} />,
    <MenuItemLink key="settings" to="/settings" primaryText="הגדרות משתמש" leftIcon={<SettingsIcon />} />,
    // <MenuItemLink key="profile" to="/profile" primaryText="פרופיל" leftIcon={<PersonIcon />} />,
];

const menuGroups = [
    { name: 'data', icon: <DatasetIcon /> },
    {
        name: 'report', icon: <AnalyticsIcon />, routes: [
            <MenuItemLink key="student-attendance" to="/student/student-attendance" primaryText="דוח נוכחות (פיבוט)" leftIcon={<SummarizeIcon />} />,
            <MenuItemLink key="percent-report-with-dates" to="/percent-report-with-dates" primaryText="דוח אחוזים לתלמידה" leftIcon={<PercentIcon />} />,
        ]
    },
    { name: 'settings', icon: <SettingsIcon /> },
    { name: 'admin', icon: <AdminPanelSettingsIcon /> },
];

export const Layout = ({ children }) => (
    <BaseLayout customMenuItems={customMenuItems} menuGroups={menuGroups}>
        {children}
    </BaseLayout>
);

export const Dashboard = () => (
    <BaseDashboard />
);
