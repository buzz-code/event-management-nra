import { Resource } from 'react-admin';
import { teal, orange } from '@mui/material/colors';

import domainTranslations from 'src/domainTranslations';
import roadmapFeatures from 'src/roadmapFeatures';
import AdminAppShell from '@shared/components/app/AdminAppShell';
import CommonRoutes from '@shared/components/app/CommonRoutes';
import CommonAdminResources from '@shared/components/app/CommonAdminResources';
import CommonSettingsResources from '@shared/components/app/CommonSettingsResources';

import { Dashboard, Layout } from 'src/GeneralLayout';

// Event Management System Entities
import event from "src/entities/event";
import eventType from "src/entities/event-type";
import eventNote from "src/entities/event-note";
import gift from "src/entities/gift";
import eventGift from "src/entities/event-gift";
import classEntity from "src/entities/class";
import levelType from "src/entities/level-type";
import familyStatusType from "src/entities/family-status-type";
import studentClass from './entities/student-class';
import studentByYear from './entities/student-by-year';
import family from './entities/family';
import tatnikit from './entities/tatnikit';
import unreportedEvent from './entities/unreported-event';
import teacherAssignmentRule from './entities/teacher-assignment-rule';
import familyTeacherAssignment from './entities/family-teacher-assignment';

import student from "src/entities/student";
import teacher from "src/entities/teacher";

import Settings from 'src/settings/Settings';
import { isAdmin } from "@shared/utils/permissionsUtil";

// Icons
import BadgeIcon from '@mui/icons-material/Badge';
import PortraitIcon from '@mui/icons-material/Portrait';
import CategoryIcon from '@mui/icons-material/Category';
import EventIcon from '@mui/icons-material/Event';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import ClassIcon from '@mui/icons-material/Class';
import CommentIcon from '@mui/icons-material/Comment';
import RouteIcon from '@mui/icons-material/Route';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';

const themeOptions = { primary: teal[700], secondary: orange[600] };

const App = () => (
  <AdminAppShell
    title='ניהול אירועים'
    themeOptions={themeOptions}
    domainTranslations={domainTranslations}
    dashboard={Dashboard}
    layout={Layout}
  >
    {permissions => (
      <>
        <Resource name="event" {...event} options={{ menuGroup: 'events' }} icon={EventIcon} />
        <Resource name="event_type" {...eventType} options={{ menuGroup: 'events' }} icon={CategoryIcon} />
        <Resource name="event_note" {...eventNote} options={{ menuGroup: 'events' }} icon={CommentIcon} />
        <Resource name="gift" {...gift} options={{ menuGroup: 'events' }} icon={CardGiftcardIcon} />
        <Resource name="event_gift" {...eventGift} options={{ menuGroup: 'events' }} icon={EventNoteIcon} />
        {isAdmin(permissions) && <Resource name="unreported_event" {...unreportedEvent} options={{ menuGroup: 'events' }} icon={EventNoteIcon} />}
        <Resource name="class" {...classEntity} options={{ menuGroup: 'data' }} icon={ClassIcon} />
        <Resource name="level_type" {...levelType} options={{ menuGroup: 'data' }} icon={RouteIcon} />
        <Resource name="family_status_type" {...familyStatusType} options={{ menuGroup: 'data' }} icon={FavoriteIcon} />
        <Resource name="student" {...student} options={{ menuGroup: 'data' }} icon={PortraitIcon} />
        <Resource name="student_class" {...studentClass} options={{ menuGroup: 'data' }} icon={BadgeIcon} />
        <Resource name="student_by_year" {...studentByYear} options={{ menuGroup: 'data' }} icon={PortraitIcon} />
        <Resource name="family" {...family} options={{ menuGroup: 'data' }} icon={PeopleIcon} />
        <Resource name="tatnikit" {...tatnikit} options={{ menuGroup: 'data' }} icon={BadgeIcon} />
        <Resource name="teacher" {...teacher} options={{ menuGroup: 'data' }} icon={BadgeIcon} />
        <Resource name="teacher_assignment_rule" {...teacherAssignmentRule} options={{ menuGroup: 'data' }} icon={AssignmentIcon} />
        <Resource name="family_teacher_assignment" {...familyTeacherAssignment} options={{ menuGroup: 'data' }} icon={FamilyRestroomIcon} />
        {CommonSettingsResources()}
        {CommonAdminResources({ permissions })}
        {CommonRoutes({ permissions, roadmapFeatures, settingsPage: <Settings /> })}
      </>
    )}
  </AdminAppShell>
);

export default App;
