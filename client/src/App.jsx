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
import attReport from "src/entities/att-report";
import attReportWithReportMonth from './entities/att-report-with-report-month';
import grade from "src/entities/grade";
import klass from "src/entities/klass";
import klassType from "src/entities/klass-type";
import knownAbsence from "src/entities/known-absence";
import lesson from "src/entities/lesson";
import studentKlass from "src/entities/student-klass";
import student from "src/entities/student";
import teacher from "src/entities/teacher";
import studentKlassesReport from "src/entities/student-klasses-report";
import reportMonth from "src/entities/report-month";
import teacherReportStatus from "src/entities/teacher-report-status";
import teacherGradeReportStatus from "src/entities/teacher-grade-report-status";
import teacherSalaryReport from "src/entities/teacher-salary-report";
import studentPercentReport from "src/entities/student-percent-report";
import gradeName from "src/entities/grade-name";
import attGradeEffect from './entities/att-grade-effect';
import Settings from 'src/settings/Settings';

import StudentAttendanceList from 'src/pivots/StudentAttendanceList';
import PercentReportWithDatesList from 'src/pivots/PercentReportWithDatesList';

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

import { isShowUsersData, isEditPagesData, isEditPaymentTracksData, isAdmin } from "@shared/utils/permissionsUtil";
import YemotSimulator from "@shared/components/views/YemotSimulator";
import { RegisterPage } from '@shared/components/layout/RegisterPage';
import { LoginPage } from '@shared/components/layout/LoginPage';
import Tutorial from '@shared/components/views/Tutorial';
import PageList from '@shared/components/views/PageList';
import ScannerUpload from '@shared/components/views/ScannerUpload';
import InLessonReport from '@shared/components/views/InLessonReport';
import Roadmap from '@shared/components/views/Roadmap';
import MichlolFileHelper from '@shared/components/views/MichlolFileHelper';

import BadgeIcon from '@mui/icons-material/Badge';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import SchoolIcon from '@mui/icons-material/School';
import PortraitIcon from '@mui/icons-material/Portrait';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import ViewListIcon from '@mui/icons-material/ViewList';
import GradingIcon from '@mui/icons-material/Grading';
import PlaylistRemoveIcon from '@mui/icons-material/PlaylistRemove';
import RuleIcon from '@mui/icons-material/Rule';
import SummarizeIcon from '@mui/icons-material/Summarize';
import CategoryIcon from '@mui/icons-material/Category';
import DateRangeIcon from '@mui/icons-material/DateRange';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import ImageIcon from '@mui/icons-material/Image';
import LabelIcon from '@mui/icons-material/Label';
import CalculateIcon from '@mui/icons-material/Calculate';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SettingsPhoneIcon from '@mui/icons-material/SettingsPhone';
import EmailIcon from '@mui/icons-material/Email';
import LogoDevIcon from '@mui/icons-material/LogoDev';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import PermContactCalendarIcon from '@mui/icons-material/PermContactCalendar';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

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
            <Resource name="teacher" {...teacher} options={{ menuGroup: 'data' }} icon={BadgeIcon} />
            <Resource name="klass_type" {...klassType} options={{ menuGroup: 'data' }} icon={CategoryIcon} />
            <Resource name="klass" {...klass} options={{ menuGroup: 'data' }} icon={SupervisedUserCircleIcon} />
            <Resource name="lesson" {...lesson} options={{ menuGroup: 'data' }} icon={SchoolIcon} />
            <Resource name="student" {...student} options={{ menuGroup: 'data' }} icon={PortraitIcon}>
              <Route path="student-attendance" element={<StudentAttendanceList />} />
            </Resource>
            <Resource name="student_klass" {...studentKlass} options={{ menuGroup: 'data' }} icon={WorkspacesIcon} />
            <Resource name="att_report_with_report_month" {...attReportWithReportMonth} options={{ menuGroup: 'data' }} icon={ViewListIcon} />
            <Resource name="grade" {...grade} options={{ menuGroup: 'data' }} icon={GradingIcon} />
            <Resource name="known_absence" {...knownAbsence} options={{ menuGroup: 'data' }} icon={PlaylistRemoveIcon} />

            <Resource name="student_klass_report" {...studentKlassesReport} options={{ menuGroup: 'report' }} icon={GroupWorkIcon} />
            <Resource name="teacher_report_status" {...teacherReportStatus} options={{ menuGroup: 'report' }} icon={RuleIcon} />
            <Resource name="teacher_grade_report_status" {...teacherGradeReportStatus} options={{ menuGroup: 'report' }} icon={RuleIcon} />
            <Resource name="teacher_salary_report" {...teacherSalaryReport} options={{ menuGroup: 'report' }} icon={LocalAtmIcon} />

            <Resource name="report_month" {...reportMonth} options={{ menuGroup: 'settings' }} icon={DateRangeIcon} />
            <Resource name="text_by_user" {...textByUser} options={{ menuGroup: 'settings' }} icon={RateReviewIcon} />
            <Resource name="mail_address" {...mailAddress} options={{ menuGroup: 'settings' }} icon={AlternateEmailIcon} />
            <Resource name="image" {...image} options={{ menuGroup: 'settings' }} icon={ImageIcon} />
            <Resource name="import_file" {...importFile} options={{ menuGroup: 'settings' }} icon={UploadFileIcon} />
            <Resource name="att_report" {...attReport} options={{ menuGroup: 'settings' }} icon={ViewListIcon} />
            <Resource name="grade_name" {...gradeName} options={{ menuGroup: 'settings' }} icon={LabelIcon} />
            <Resource name="att_grade_effect" {...attGradeEffect} options={{ menuGroup: 'settings' }} icon={CalculateIcon} />
            <Resource name="student_by_year" {...(isAdmin(permissions) ? resourceEntityGuesser : {})} recordRepresentation={CommonRepresentation} options={{ menuGroup: 'admin' }} icon={PermContactCalendarIcon} />
            <Resource name="grade_effect_by_user" {...(isAdmin(permissions) ? resourceEntityGuesser : {})} recordRepresentation={'effect'} options={{ menuGroup: 'admin' }} icon={AdminPanelSettingsIcon} />
            <Resource name="abs_count_effect_by_user" {...(isAdmin(permissions) ? resourceEntityGuesser : {})} recordRepresentation={'effect'} options={{ menuGroup: 'admin' }} icon={AdminPanelSettingsIcon} />

            
            {isAdmin(permissions) && <>
              <Resource name="student_percent_report" {...studentPercentReport} options={{ menuGroup: 'report' }} icon={SummarizeIcon} />
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
              <Route path="/percent-report-with-dates" element={<PercentReportWithDatesList />} />
              <Route path="/yemot-simulator" element={<YemotSimulator />} />
              <Route path="/tutorial" element={<Tutorial />} />
              <Route path="/pages-view" element={<PageList />} />
              <Route path="/scanner-upload" element={<ScannerUpload />} />
              <Route path="/in-lesson-report-att/*" element={<InLessonReport />} />
              <Route path="/in-lesson-report-grade/*" element={<InLessonReport gradeMode />} />
              <Route path="/roadmap" element={<Roadmap features={roadmapFeatures} />} />
              <Route path="/michlol-file-helper" element={<MichlolFileHelper />} />
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
