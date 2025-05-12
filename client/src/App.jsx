import { Admin, Resource, CustomRoutes } from 'react-admin';
import { BrowserRouter, Route } from 'react-router-dom';
import { teal, orange } from '@mui/material/colors';

import domainTranslations from 'src/domainTranslations';
import dataProvider from "@shared/providers/dataProvider";
import { getI18nProvider } from "@shared/providers/i18nProvider";
import authProvider from "@shared/providers/authProvider";
import { createTheme } from "@shared/providers/themeProvider";
import RTLStyle from "@shared/components/layout/RTLStyle";
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import roadmapFeatures from 'src/roadmapFeatures';

const appTheme = createTheme({
  primary: teal[700],
  secondary: orange[600],
  isRtl: true
});

import { Dashboard, Layout } from 'src/GeneralLayout';

import { resourceEntityGuesser } from '@shared/components/crudContainers/EntityGuesser';

// Event Management System Entities
import event from "src/entities/event";
import eventType from "src/entities/event-type";
import eventNote from "src/entities/event-note";
import gift from "src/entities/gift";
import eventGift from "src/entities/event-gift";
import classEntity from "src/entities/class";
import levelType from "src/entities/level-type";
import studentClass from './entities/student-class';
import studentByYear from './entities/student-by-year'; // Added import

// Keep required shared entities
import student from "src/entities/student";
import teacher from "src/entities/teacher";

// Common entities and utilities
import text from "@shared/components/common-entities/text";
import textByUser from "@shared/components/common-entities/text-by-user";
import user from "@shared/components/common-entities/user";
import auditLog from '@shared/components/common-entities/audit-log';
import importFile from '@shared/components/common-entities/import-file';
import mailAddress from '@shared/components/common-entities/mail-address';
import recievedMail from '@shared/components/common-entities/recieved-mail';
import page from '@shared/components/common-entities/page';
import image from '@shared/components/common-entities/image';
import paymentTrack from '@shared/components/common-entities/payment-track';
import yemotCall from '@shared/components/common-entities/yemot-call';

import Settings from 'src/settings/Settings';

import { isShowUsersData, isEditPagesData, isEditPaymentTracksData, isAdmin } from "@shared/utils/permissionsUtil";
import YemotSimulator from "@shared/components/views/YemotSimulator";
import { RegisterPage } from '@shared/components/layout/RegisterPage';
import { LoginPage } from '@shared/components/layout/LoginPage';
import Tutorial from '@shared/components/views/Tutorial';
import PageList from '@shared/components/views/PageList';
import Roadmap from '@shared/components/views/Roadmap';

// Icons
import BadgeIcon from '@mui/icons-material/Badge';
import PortraitIcon from '@mui/icons-material/Portrait';
import CategoryIcon from '@mui/icons-material/Category';
import EventIcon from '@mui/icons-material/Event';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import ClassIcon from '@mui/icons-material/Class';
import CommentIcon from '@mui/icons-material/Comment';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import ImageIcon from '@mui/icons-material/Image';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SettingsPhoneIcon from '@mui/icons-material/SettingsPhone';
import EmailIcon from '@mui/icons-material/Email';
import LogoDevIcon from '@mui/icons-material/LogoDev';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import RouteIcon from '@mui/icons-material/Route';

const i18nProvider = getI18nProvider(domainTranslations);

const App = () => (
  <BrowserRouter>
    <RTLStyle>
      <Admin dataProvider={dataProvider} i18nProvider={i18nProvider} authProvider={authProvider}
        theme={appTheme} title='ניהול אירועים'
        dashboard={Dashboard} layout={Layout} loginPage={LoginPage}
        requireAuth>
        {permissions => (
          <>
            {/* Event Management System Resources */}
            <Resource name="event" {...event} options={{ menuGroup: 'events' }} icon={EventIcon} />
            <Resource name="event_type" {...eventType} options={{ menuGroup: 'events' }} icon={CategoryIcon} />
            <Resource name="event_note" {...eventNote} options={{ menuGroup: 'events' }} icon={CommentIcon} />
            <Resource name="gift" {...gift} options={{ menuGroup: 'events' }} icon={CardGiftcardIcon} />
            <Resource name="event_gift" {...eventGift} options={{ menuGroup: 'events' }} icon={EventNoteIcon} />
            <Resource name="class" {...classEntity} options={{ menuGroup: 'data' }} icon={ClassIcon} />
            <Resource name="level_type" {...levelType} options={{ menuGroup: 'data' }} icon={RouteIcon} />
            
            {/* Keep Student and Teacher from original system */}
            <Resource name="student" {...student} options={{ menuGroup: 'data' }} icon={PortraitIcon} />
            <Resource name="student_class" {...studentClass} options={{ menuGroup: 'data' }} icon={BadgeIcon} />
            <Resource name="student_by_year" {...studentByYear} options={{ menuGroup: 'data' }} icon={PortraitIcon} />
            <Resource name="teacher" {...teacher} options={{ menuGroup: 'data' }} icon={BadgeIcon} />

            {/* Common settings and utilities */}
            <Resource name="text_by_user" {...textByUser} options={{ menuGroup: 'settings' }} icon={RateReviewIcon} />
            <Resource name="mail_address" {...mailAddress} options={{ menuGroup: 'settings' }} icon={AlternateEmailIcon} />
            <Resource name="image" {...image} options={{ menuGroup: 'settings' }} icon={ImageIcon} />
            <Resource name="import_file" {...importFile} options={{ menuGroup: 'settings' }} icon={UploadFileIcon} />
            
            {isAdmin(permissions) && <>
              <Resource name="text" {...text} options={{ menuGroup: 'admin' }} />
              <Resource name="yemot_call" {...yemotCall} options={{ menuGroup: 'admin' }} icon={SettingsPhoneIcon} />
              <Resource name="recieved_mail" {...recievedMail} options={{ menuGroup: 'admin' }} icon={EmailIcon} />
              <Resource name="audit_log" {...auditLog} options={{ menuGroup: 'admin' }} icon={LogoDevIcon} />
            </>}

            {isShowUsersData(permissions) && <>
              <Resource name="user" {...user} create={isAdmin(permissions) && user.create} options={{ menuGroup: 'admin' }} icon={AccountBoxIcon} />
            </>}

            {isEditPagesData(permissions) && <>
              <Resource name="page" {...page} options={{ menuGroup: 'admin' }} icon={AutoStoriesIcon} />
            </>}

            {(isEditPaymentTracksData(permissions) || isShowUsersData(permissions)) && <>
              <Resource name="payment_track" {...paymentTrack} list={isEditPaymentTracksData(permissions) ? paymentTrack.list : null} options={{ menuGroup: 'admin' }} icon={MonetizationOnIcon} />
            </>}

            <CustomRoutes>
              <Route path="/yemot-simulator" element={<YemotSimulator />} />
              <Route path="/tutorial" element={<Tutorial />} />
              <Route path="/pages-view" element={<PageList />} />
              <Route path="/roadmap" element={<Roadmap features={roadmapFeatures} />} />
            </CustomRoutes>

            <CustomRoutes noLayout>
              <Route path="/register" element={<RegisterPage />} />
            </CustomRoutes>

            {!isAdmin(permissions) && <CustomRoutes>
              <Route path="/settings" element={<Settings />} />
            </CustomRoutes>}
          </>
        )}
      </Admin>
    </RTLStyle>
  </BrowserRouter>
);

export default App;
