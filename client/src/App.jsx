import { teal, orange } from '@mui/material/colors';

import domainTranslations from 'src/domainTranslations';
import roadmapFeatures from 'src/roadmapFeatures';
import AdminAppShell from '@shared/components/app/AdminAppShell';
import CommonRoutes from '@shared/components/app/CommonRoutes';
import CommonAdminResources from '@shared/components/app/CommonAdminResources';
import CommonSettingsResources from '@shared/components/app/CommonSettingsResources';
import { buildResources } from '@shared/components/app/buildResources';

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

const resources = [
  { name: 'event',                     config: event,                   icon: EventIcon,           menuGroup: 'events' },
  { name: 'event_type',                config: eventType,               icon: CategoryIcon,        menuGroup: 'events' },
  { name: 'event_note',                config: eventNote,               icon: CommentIcon,         menuGroup: 'events' },
  { name: 'gift',                      config: gift,                    icon: CardGiftcardIcon,    menuGroup: 'events' },
  { name: 'event_gift',                config: eventGift,               icon: EventNoteIcon,       menuGroup: 'events' },
  p => isAdmin(p) && { name: 'unreported_event',          config: unreportedEvent,         icon: EventNoteIcon,       menuGroup: 'events' },
  { name: 'class',                     config: classEntity,             icon: ClassIcon,           menuGroup: 'data' },
  { name: 'level_type',                config: levelType,               icon: RouteIcon,           menuGroup: 'data' },
  { name: 'family_status_type',        config: familyStatusType,        icon: FavoriteIcon,        menuGroup: 'data' },
  { name: 'student',                   config: student,                 icon: PortraitIcon,        menuGroup: 'data' },
  { name: 'student_class',             config: studentClass,            icon: BadgeIcon,           menuGroup: 'data' },
  { name: 'student_by_year',           config: studentByYear,           icon: PortraitIcon,        menuGroup: 'data' },
  { name: 'family',                    config: family,                  icon: PeopleIcon,          menuGroup: 'data' },
  { name: 'tatnikit',                  config: tatnikit,                icon: BadgeIcon,           menuGroup: 'data' },
  { name: 'teacher',                   config: teacher,                 icon: BadgeIcon,           menuGroup: 'data' },
  { name: 'teacher_assignment_rule',   config: teacherAssignmentRule,   icon: AssignmentIcon,      menuGroup: 'data' },
  { name: 'family_teacher_assignment', config: familyTeacherAssignment, icon: FamilyRestroomIcon,  menuGroup: 'data' },
];

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
        {buildResources(resources, permissions)}
        {CommonSettingsResources()}
        {CommonAdminResources({ permissions })}
        {CommonRoutes({ permissions, roadmapFeatures, settingsPage: <Settings /> })}
      </>
    )}
  </AdminAppShell>
);

export default App;
