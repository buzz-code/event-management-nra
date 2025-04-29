# React Admin NestJS Project Index

## 1. Project Structure

### Root Directory
- `/docker-compose.yml` - Defines services for frontend, backend, MySQL database, and phpMyAdmin
- `/docker-compose.override.yml` - Environment-specific Docker override configuration
- `/react-admin-nestjs.code-workspace` - VS Code workspace configuration

### Key Directories
- `/client` - React Admin frontend application
- `/server` - NestJS backend application
- `/db` - MySQL database configuration and initial data

### Nested Git Repositories
- `/client/shared/` - Shared client components and utilities (Git origin: https://github.com/buzz-code/nra-client)
- `/server/shared/` - Shared server modules and utilities (Git origin: https://github.com/buzz-code/nra-server)

## 2. Client Side (React Admin Frontend)

### Main Configuration Files
- `/client/package.json` - Frontend dependencies and scripts (React 18, React Admin 5.3, Vite 2.7)
- `/client/vite.config.js` - Vite build configuration
- `/client/babel.config.js` - Babel configuration for JavaScript transpilation
- `/client/jest.config.js` - Jest configuration for frontend testing

### Core Application Files
- `/client/src/index.jsx` - Frontend application entry point
- `/client/src/App.jsx` - Main React Admin application configuration with resource definitions
- `/client/src/GeneralLayout.jsx` - Custom layout components (Dashboard and Layout)
- `/client/src/domainTranslations.js` - Domain-specific translation strings

### Entity Definitions (Resources)
- `/client/src/entities/att-report.jsx` - Attendance report entity configuration
- `/client/src/entities/att-report-with-report-month.jsx` - Attendance report with report month entity
- `/client/src/entities/grade.jsx` - Grade entity configuration
- `/client/src/entities/klass.jsx` - Class entity configuration
- `/client/src/entities/klass-type.jsx` - Class type entity configuration
- `/client/src/entities/lesson.jsx` - Lesson entity configuration
- `/client/src/entities/student.jsx` - Student entity configuration
- `/client/src/entities/student-klass.jsx` - Student class association entity
- `/client/src/entities/student-klasses-report.jsx` - Student classes report entity
- `/client/src/entities/teacher.jsx` - Teacher entity configuration
- `/client/src/entities/report-month.jsx` - Report month entity configuration
- `/client/src/entities/teacher-report-status.jsx` - Teacher report status entity
- `/client/src/entities/teacher-grade-report-status.jsx` - Teacher grade report status entity
- `/client/src/entities/known-absence.jsx` - Known absence entity configuration
- `/client/src/entities/student-percent-report.jsx` - Student percentage report entity
- `/client/src/entities/att-grade-effect.jsx` - Attendance grade effect entity

### Providers
- `/client/shared/providers/dataProvider.js` - Data provider for React Admin API communication
- `/client/shared/providers/i18nProvider.js` - Internationalization provider with Hebrew support
- `/client/shared/providers/authProvider.js` - Authentication provider
- `/client/shared/providers/themeProvider.js` - Custom theme configuration
- `/client/shared/providers/constantsProvider.js` - Application constants
- `/client/shared/providers/baseDataProvider.ts` - Base data provider functionality

### Components
- `/client/shared/components/layout/` - Layout components (Menu, Login, Register, RTLStyle)
- `/client/shared/components/crudContainers/` - Reusable CRUD components
- `/client/shared/components/fields/` - Custom field components
- `/client/shared/components/common-entities/` - Common entity components
- `/client/shared/components/views/` - Custom view components
- `/client/shared/components/in-lesson-report/` - In-lesson reporting components
- `/client/shared/components/import/` - Import functionality components

### Utilities
- `/client/shared/utils/permissionsUtil.js` - Permission handling utilities
- `/client/shared/utils/fileUtil.ts` - File handling utilities
- `/client/shared/utils/notifyUtil.js` - Notification utilities
- `/client/shared/utils/deepMerge.js` - Deep object merging utility
- `/client/shared/utils/settingsUtil.js` - Settings management utilities
- `/client/shared/utils/yearFilter.js` - Year filtering utility
- `/client/shared/utils/filtersUtil.js` - General filtering utilities
- `/client/shared/utils/numericUtil.ts` - Numeric operation utilities
- `/client/shared/utils/httpUtil.js` - HTTP request utilities

### Settings & Reports
- `/client/src/settings/Settings.jsx` - Settings management component
- `/client/src/settings/ReportStylesInput.jsx` - Report styles configuration
- `/client/src/reports/studentReportCardReactButton.jsx` - Student report card functionality

## 3. Server Side (NestJS Backend)

### Main Configuration Files
- `/server/package.json` - Backend dependencies and scripts (NestJS 9, TypeORM)
- `/server/nest-cli.json` - NestJS CLI configuration
- `/server/tsconfig.json` - TypeScript configuration
- `/server/jest.config.js` - Jest configuration for backend testing

### Core Application Files
- `/server/src/main.ts` - Backend application entry point
- `/server/src/app.module.ts` - Main application module with imports
- `/server/src/app.controller.ts` - Main application controller
- `/server/src/app.service.ts` - Main application service
- `/server/src/entities.module.ts` - Module for registering all entities

### Entity Modules
- `/server/src/entity-modules/att-report.config.ts` - Attendance report entity configuration
- `/server/src/entity-modules/grade.config.ts` - Grade entity configuration
- `/server/src/entity-modules/klass.config.ts` - Class entity configuration
- `/server/src/entity-modules/klass-type.config.ts` - Class type entity configuration
- `/server/src/entity-modules/lesson.config.ts` - Lesson entity configuration
- `/server/src/entity-modules/student.config.ts` - Student entity configuration
- `/server/src/entity-modules/student-klass.config.ts` - Student class association configuration
- `/server/src/entity-modules/teacher.config.ts` - Teacher entity configuration
- `/server/src/entity-modules/user.config.ts` - User entity configuration
- `/server/src/entity-modules/known-absence.config.ts` - Known absence entity configuration
- `/server/src/entity-modules/student-klass-report.config.ts` - Student class report configuration
- `/server/src/entity-modules/teacher-report-status.config.ts` - Teacher report status configuration
- `/server/src/entity-modules/teacher-grade-report-status.config.ts` - Teacher grade report status config
- `/server/src/entity-modules/page.config.ts` - Page entity configuration
- `/server/src/entity-modules/teacher-salary-report.config.ts` - Teacher salary report configuration
- `/server/src/entity-modules/student-percent-report.config.ts` - Student percentage report configuration
- `/server/src/entity-modules/payment-track.config.ts` - Payment track entity configuration
- `/server/src/entity-modules/import-file.config.ts` - Import file configuration

### Database Entities
- `/server/src/db/entities/` - Core database entity definitions
- `/server/src/db/view-entities/` - Database view entity definitions
- `/server/shared/entities/` - Shared entity definitions
- `/server/shared/view-entities/` - Shared view entity definitions

### Auth & Security
- `/server/shared/auth/auth.module.ts` - Authentication module
- `/server/src/app.module.ts` - Contains ThrottlerModule for rate limiting

### Reports
- `/server/src/reports/reportGenerator.ts` - Report generation functionality
- `/server/src/reports/studentReportCard.ts` - Student report card generation
- `/server/src/reports/studentReportCardReact.tsx` - React version of student report cards
- `/server/src/reports/teacherReportFile.ts` - Teacher report file generation
- `/server/src/reports/michlolPopulatedFile.ts` - Michlol populated file generation

### Yemot Integration (Phone System)
- `/server/src/yemot/yemot.chain.ts` - Main Yemot chain configuration
- `/server/src/yemot/attReport.chain.ts` - Attendance report chain for Yemot
- `/server/src/yemot/teacherByPhone.chain.ts` - Teacher lookup by phone
- `/server/src/yemot/reportType.chain.ts` - Report type chain
- `/server/src/yemot/resourceWithConfirmation.chain.ts` - Resource confirmation chain

### Utilities & Helpers
- `/server/helpers/clean-migrations.js` - Migration cleaning helper
- `/server/helpers/db-reference-fix.ts` - Database reference fixing utility
- `/server/shared/utils/mail/mail-send.module.ts` - Email sending functionality

## 4. Database
- `/db/data.sql` - Initial database data
- `/db/Dockerfile` - Database Docker configuration

This project appears to be an educational management system with features for tracking student attendance, grading, teacher reporting, and administrative functions. The system is built with a React Admin frontend that provides a comprehensive UI for administrators and teachers, connected to a NestJS backend that handles data persistence and business logic.