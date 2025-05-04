# Event Management NRA Project Index

## 1. Project Structure

### Root Directory
- `/docker-compose.yml` - Defines services for frontend, backend, MySQL database, and phpMyAdmin
- `/docker-compose.override.yml` - Environment-specific Docker override configuration
- `/event-management-nra.code-workspace` - VS Code workspace configuration

### Key Directories
- `/client` - React Admin frontend application
- `/server` - NestJS backend application
- `/db` - MySQL database configuration and initial data

### Nested Git Repositories
- `/client/shared/` - Shared client components and utilities (Git origin: https://github.com/buzz-code/nra-client)
  - This is a submodule that contains reusable React components used across multiple projects
  - Changes to this repository should be coordinated with other projects that use it
- `/server/shared/` - Shared server modules and utilities (Git origin: https://github.com/buzz-code/nra-server)
  - This is a submodule that contains reusable NestJS modules used across multiple projects
  - Contains critical authentication, entity management, and utility functions

## 2. Client Side (React Admin Frontend)

### Main Configuration Files
- `/client/package.json` - Frontend dependencies and scripts (React 18.2, React Admin 5.3.3, Vite with modern HMR support)
- `/client/vite.config.js` - Vite build configuration with WebSocket HMR and module alias support
- `/client/babel.config.js` - Babel configuration for JavaScript transpilation
- `/client/jest.config.js` - Jest configuration for frontend testing

### Core Application Files
- `/client/src/index.jsx` - Frontend application entry point
- `/client/src/App.jsx` - Main React Admin application configuration with resource definitions
- `/client/src/GeneralLayout.jsx` - Custom layout components (Dashboard and Layout)
- `/client/src/domainTranslations.js` - Domain-specific translation strings

### Entity Definitions (Resources)
- `/client/src/entities/event.jsx` - Event entity configuration (core entity for event management)
- `/client/src/entities/event-type.jsx` - Event type entity configuration (categorizes events)
- `/client/src/entities/event-note.jsx` - Event note entity configuration (notes/comments attached to events)
- `/client/src/entities/event-gift.jsx` - Event gift association entity (connects events with gifts)
- `/client/src/entities/gift.jsx` - Gift entity configuration (items given at events)
- `/client/src/entities/student.jsx` - Student entity configuration (event participants)
- `/client/src/entities/teacher.jsx` - Teacher entity configuration (event organizers)
- `/client/src/entities/class.jsx` - Class entity configuration (event venues/locations)
- `/client/src/entities/klass-type.jsx` - Class type entity configuration (categorizes venues)

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
- `/client/shared/components/import/` - Import functionality components

### Dashboard Components
- `/client/src/dashboard/UpcomingEvents.jsx` - Displays upcoming events with details and filtering
- `/client/src/dashboard/EventStatsCard.jsx` - Shows statistics for various event entities
- `/client/src/dashboard/EventStatsContainer.jsx` - Container for event statistics cards

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
- `/server/src/entity-modules/event.config.ts` - Event entity configuration (primary event management entity)
- `/server/src/entity-modules/event-type.config.ts` - Event type entity configuration (categorizes events)
- `/server/src/entity-modules/event-note.config.ts` - Event note entity configuration (comments/notes for events)
- `/server/src/entity-modules/event-gift.config.ts` - Event gift entity configuration (tracking gifts at events)
- `/server/src/entity-modules/gift.config.ts` - Gift entity configuration (items distributed at events)
- `/server/src/entity-modules/class.config.ts` - Class entity configuration (venues/locations for events)
- `/server/src/entity-modules/student.config.ts` - Student entity configuration (event participants)
- `/server/src/entity-modules/teacher.config.ts` - Teacher entity configuration (event organizers)
- `/server/src/entity-modules/user.config.ts` - User entity configuration (system users and authentication)
- `/server/src/entity-modules/page.config.ts` - Page entity configuration (content pages for the system)
- `/server/src/entity-modules/payment-track.config.ts` - Payment track entity configuration (payment options)
- `/server/src/entity-modules/import-file.config.ts` - Import file configuration (bulk data import)
- `/server/src/entity-modules/audit-log.config.ts` - Audit log configuration (system activity tracking)
- `/server/src/entity-modules/text.config.ts` - Text entity configuration (system-wide text content)

### Database Entities
- `/server/src/db/entities/` - Core database entity definitions
- `/server/src/db/view-entities/` - Database view entity definitions
- `/server/shared/entities/` - Shared entity definitions
- `/server/shared/view-entities/` - Shared view entity definitions

### Auth & Security
- `/server/shared/auth/auth.module.ts` - Authentication module
- `/server/src/app.module.ts` - Contains ThrottlerModule for rate limiting

### Utilities & Helpers
- `/server/helpers/clean-migrations.js` - Migration cleaning helper
- `/server/helpers/db-reference-fix.ts` - Database reference fixing utility
- `/server/shared/utils/mail/mail-send.module.ts` - Email sending functionality

## 4. Database
- `/db/data.sql` - Initial database data
- `/db/Dockerfile` - Database Docker configuration

## 5. Yemot Integration

The system integrates with the Yemot telephony system to handle phone calls:

- `/server/src/yemot-handler.ts` - Main handler for Yemot telephony system integration
- `/server/src/main.ts` - Sets up Yemot router with the handler and processor
- `/server/shared/utils/yemot/yemot-router.ts` - Shared utility for Yemot call routing
- `/client/shared/components/views/YemotSimulator.jsx` - Frontend simulator for testing Yemot flows

### Call Flow Implementation
The system implements a structured call flow that:
1. Greets the caller with voice instructions
2. Collects user information through keypad or voice input
3. Records address information
4. Provides confirmation messages
5. Processes the collected information for event management

### Call Processing
The `yemotProcessor` function handles post-call tasks such as:
- Data validation and storage
- Notification generation
- Event participant management updates

### Testing and Simulation
The YemotSimulator component allows testing call flows without requiring actual phone connections.

## 6. Project Clarifications

### Entity Relationships
The system is built around these core relationships:
- **Events** are the central entity that everything connects to
- **Event Types** categorize different kinds of events
- **Event Notes** provide additional information for specific events
- **Gifts** can be attached to events through the **Event Gift** junction entity
- **Students** are the participants who attend events
- **Teachers** organize and manage events
- **Classes** represent physical locations or venues where events take place

These relationships allow for tracking of which participants attended which events, what gifts were distributed, and collecting notes and feedback about events.

### Project Purpose
This is an event management system designed to track and manage events, participants, gifts, and event-related activities. The system focuses on creating and organizing events, managing attendees, and tracking gift distribution.

### Language Support
The application fully supports Right-to-Left (RTL) Hebrew text. UI labels and messages are defined in the domainTranslations.js file and managed through the i18nProvider.

### Configuration System
The application includes a comprehensive settings system that allows customization of various aspects:
- Report formatting and styles
- System-wide general settings 
- Dashboard configuration
- User permissions and access control

This project is an event management system with features for creating and managing events, tracking participants, managing gifts, and administrative functions. The system is built with a React Admin frontend that provides a comprehensive UI for administrators and event managers, connected to a NestJS backend that handles data persistence and business logic.