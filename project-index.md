# Event Management NRA Project Index

## Executive Summary

The Event Management NRA system is a comprehensive platform designed to track and manage events, participants, gifts, and event-related activities. Built with a React Admin frontend and NestJS backend, the system enables organizations to create and organize events, manage attendee registration, track gift distribution, and generate reports. The application features robust entity relationships centered around events, with support for RTL Hebrew text, customizable settings, and integration with the Yemot telephony system. This dockerized application uses MySQL for data persistence and follows a modular architecture with shared components for extensibility and code reuse.

## Table of Contents
- [1. Project Overview](#1-project-overview)
- [2. Project Structure](#2-project-structure)
- [3. Client Side (React Admin Frontend)](#3-client-side-react-admin-frontend)
- [4. Server Side (NestJS Backend)](#4-server-side-nestjs-backend)
- [5. Database](#5-database)
- [6. Yemot Integration](#6-yemot-integration)
- [7. Development Workflow](#7-development-workflow)

## Key Concepts

1. **Event-Centered Data Model** - Events are the primary entity around which the entire system revolves. All other entities (participants, gifts, notes) connect to events either directly or indirectly.

2. **Modular Architecture** - Both frontend and backend use a modular approach with shared components/modules stored in separate Git submodule repositories, enabling code reuse across multiple projects.

3. **Entity Configuration** - Each domain entity has a dedicated configuration file that defines its properties, relationships, validation rules, and UI representation, following a convention-over-configuration approach.

4. **Multi-tenancy** - The system supports multiple organizations with data separation through tenant IDs, allowing each organization to have its own isolated data while sharing the same infrastructure.

5. **i18n and RTL Support** - Full internationalization with Hebrew language and right-to-left text support throughout the application, managed through dedicated translation providers.

6. **Dockerized Deployment** - The entire stack runs in Docker containers orchestrated with Docker Compose, with configurations for development, production, and Docker Swarm multi-node deployments.

7. **Telephony Integration** - Yemot integration enables phone-based interaction with the system, allowing automated calls and information collection through an interactive voice response system.

## 1. Project Overview

### Project Purpose
This is an event management system designed to track and manage events, participants, gifts, and event-related activities. The system focuses on creating and organizing events, managing attendees, and tracking gift distribution.

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

### Language Support
The application fully supports Right-to-Left (RTL) Hebrew text. UI labels and messages are defined in the domainTranslations.js file and managed through the i18nProvider.

### Configuration System
The application includes a comprehensive settings system that allows customization of various aspects:
- Report formatting and styles
- System-wide general settings 
- Dashboard configuration
- User permissions and access control

### Monitoring and Logging
The application integrates with OpenObserve for comprehensive browser-based logging and Real User Monitoring (RUM). This provides:
- Client-side error tracking and performance metrics
- User interaction monitoring
- Detailed browser diagnostics for troubleshooting
- Runtime performance analysis

## 2. Project Structure

### Root Directory
- `/docker-compose.yml` - Defines services for frontend, backend, MySQL database, and phpMyAdmin
- `/docker-compose.override.yml` - Environment-specific Docker override configuration
- `/event-management-nra.code-workspace` - VS Code workspace configuration
- `/.env` - Environment variables for Docker services including database credentials, JWT secrets, SMTP settings, and domain configuration

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

### External Networks
The project uses several external Docker networks for infrastructure integration:
- `caddy` - For reverse proxy and HTTPS termination
- `elknet` - For connectivity to the ELK stack (Elasticsearch, Logstash, Kibana) monitoring

## 3. Client Side (React Admin Frontend)

### Architecture Overview
The client side uses React Admin as the foundation for the administrative interface, with customizations for event management. The architecture follows a component-based structure with resource definitions for entities, reusable UI components, and service providers.

### Key Configuration Files
- `/client/package.json` - Frontend dependencies and scripts (React 18.2, React Admin 5.3.3)
- `/client/vite.config.js` - Vite build configuration with WebSocket HMR
- `/client/src/openopserve.config.ts` - Browser monitoring configuration

### Core Application Files
- `/client/src/index.jsx` - Frontend application entry point
- `/client/src/App.jsx` - Main React Admin application configuration
- `/client/src/domainTranslations.js` - Domain-specific translation strings

### Essential Entity Definitions
- `/client/src/entities/event.jsx` - Core entity for event management
- `/client/src/entities/event-gift.jsx` - Connects events with gifts
- `/client/src/entities/student.jsx` - Event participants
- `/client/src/entities/teacher.jsx` - Event organizers

### Critical Providers
- `/client/shared/providers/dataProvider.js` - API communication
- `/client/shared/providers/i18nProvider.js` - Hebrew RTL support
- `/client/shared/providers/authProvider.js` - Authentication

### Key Components
- `/client/shared/components/layout/` - Layout components with RTL support
- `/client/src/dashboard/UpcomingEvents.jsx` - Main dashboard component 
- `/client/src/settings/Settings.jsx` - System configuration

## 4. Server Side (NestJS Backend)

### Architecture Overview
The server side is built with NestJS, providing a modular and scalable backend architecture. It follows domain-driven design principles with clearly separated entity modules, data persistence through TypeORM, and a comprehensive authentication system.

### Key Configuration Files
- `/server/package.json` - Backend dependencies (NestJS 9, TypeORM)
- `/server/nest-cli.json` - NestJS CLI configuration

### Core Application Files
- `/server/src/main.ts` - Backend application entry point
- `/server/src/app.module.ts` - Main application module with imports
- `/server/src/entities.module.ts` - Entity registration

### Primary Entity Modules
- `/server/src/entity-modules/event.config.ts` - Primary event entity
- `/server/src/entity-modules/student.config.ts` - Participant management
- `/server/src/entity-modules/teacher.config.ts` - Organizer management
- `/server/src/entity-modules/gift.config.ts` - Gift tracking
- `/server/src/entity-modules/user.config.ts` - User authentication

### Critical Infrastructure
- `/server/shared/auth/auth.module.ts` - Authentication system
- `/server/shared/utils/mail/mail-send.module.ts` - Email notifications
- `/server/src/yemot-handler.ts` - Telephony integration

## 5. Database
- `/db/data.sql` - Initial database data
- `/db/Dockerfile` - Database Docker configuration

## 6. Yemot Integration

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

## 7. Development Workflow

### Setting Up the Development Environment

#### Prerequisites
- Docker and Docker Compose
- Git

#### Initial Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/event-management-nra.git
   git submodule update --init --recursive
   ```

2. Install npm dependencies locally (needed for Docker build):
   ```bash
   cd client && yarn install
   cd ../server && yarn install
   cd ..
   ```

3. Configure environment files:
   ```bash
   cp .env.template .env
   # Edit .env with your database credentials, JWT secret, and other settings
   
   cp docker-compose.override.yml.template docker-compose.override.yml
   # Edit docker-compose.override.yml with your local settings if needed
   ```

4. Start the Docker environment:
   ```bash
   docker compose up -d
   ```

5. Access the application:
   - Frontend: http://localhost:30013
   - Backend API: http://localhost:30014
   - phpMyAdmin: http://localhost:30015

### Development Process

The entire development environment runs in Docker containers. Local npm modules are mapped into the containers for better IDE integration and faster rebuilds.

#### Making Changes
1. Edit files locally using your preferred IDE
2. Changes to the client will automatically be detected and hot-reloaded
3. Changes to the server may require restarting the container:
   ```bash
   docker compose restart server
   ```

### Testing

#### Running Tests
Tests should be run inside the Docker containers:

```bash
# Client tests
docker compose exec client yarn test

# Server tests
docker compose exec server yarn test

# E2E tests
docker compose exec server yarn test:e2e
```

#### Test Coverage
The project aims to maintain test coverage above 80%. Test coverage reports are available at:
- Client: `/client/coverage/lcov-report/index.html`
- Server: `/server/coverage/lcov-report/index.html`

### Database Migrations

Database migrations must be run inside the Docker container:

1. First, dry-run the migration to verify it's correct:
   ```bash
   docker compose exec server yarn typeorm:generate src/migrations/MigrationName --dryrun --pretty
   ```

2. Generate a migration after verifying the changes:
   ```bash
   docker compose exec server yarn typeorm:generate src/migrations/MigrationName --pretty
   ```

3. Run migrations:
   ```bash
   docker compose exec server yarn typeorm:run
   ```

### Deployment

#### Docker Swarm Deployment
For multi-node deployments, use the Docker Swarm configuration:
```bash
docker stack deploy -c docker-compose-swarm.yml event-management
```