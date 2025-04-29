# Checklist for Creating a New Project Based on react-admin-nestjs

## 1. Project Setup & Structure

- [ ] Clone the existing repository as a starting point
- [ ] Rename the project directory to your new project name
- [ ] Update projects names in both `package.json` files (client and server)
- [ ] Update `docker-compose.yml` and related files with new service names
- [ ] Update VS Code workspace file name and content
- [ ] Create a new Git repository for your project 
- [ ] Keep existing structure for shared components as Git submodules:
  - [ ] `/client/shared/` (from https://github.com/buzz-code/nra-client)
  - [ ] `/server/shared/` (from https://github.com/buzz-code/nra-server)

## 1.5. Creating Necessary Configuration Files

- [ ] Create environment files (not included in git):
  - [ ] Root `.env` file with project-wide environment variables
  - [ ] `docker-compose.override.yml` based on the provided template
  - [ ] Client-side environment files if needed (`.env.local`, `.env.development.local`)
- [ ] Update environment variables for:
  - [ ] Database connection details (MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE)
  - [ ] JWT_SECRET for authentication
  - [ ] ADMIN_USER credentials
  - [ ] SMTP_USER and SMTP_PASSWORD for email functionality
  - [ ] DOMAIN_NAME settings for deployments
- [ ] Configure Nginx settings if needed in `/client/nginx/nginx.conf` 
- [ ] Set up IDE/editor specific configurations:
  - [ ] VS Code settings (`.vscode/settings.json`, `.vscode/launch.json`)
  - [ ] Any other editor-specific configurations
- [ ] Update any OpenObserve configurations in `src/openopserve.config.ts` if using monitoring
- [ ] Check and update manifest.json and other public assets in `/client/public/`

## 2. UI/Theme Customization

- [ ] Create a custom theme using the `createTheme` function with Material-UI colors:
  ```jsx
  // In your App.jsx
  import { blue, purple, green, orange } from '@mui/material/colors';
  import { createTheme } from '@shared/providers/themeProvider';
  
  const customTheme = createTheme({
    primary: blue[700],     // Using MUI color palette with shade
    secondary: purple[500], // Using MUI color palette with shade
    // Other options as needed
  });
  ```
- [ ] Review the Material-UI color palette options:
  - Available colors: amber, blue, blueGrey, brown, common, cyan, deepOrange, deepPurple, green, grey, indigo, lightBlue, lightGreen, lime, orange, pink, purple, red, teal, yellow
  - Each color has shades from 50-900 (e.g., blue[50], blue[100], ..., blue[900])
  - Reference: https://mui.com/material-ui/customization/color/
- [ ] Update application title in `/client/src/App.jsx`
- [ ] Update favicon and logo files in `/client/public/`
- [ ] Review the theme customization guide in `/client/theme-customization-guide.md` for additional options

## 3. Entity Setup

- [ ] Define your domain entities (both database and UI representations)
- [ ] Create TypeORM entities in `/server/src/db/entities/`
- [ ] Create entity modules in `/server/src/entity-modules/` following existing patterns
- [ ] Update `server/src/entities.module.ts` to register your new entities
- [ ] Create React Admin entity definitions in `/client/src/entities/`
- [ ] Update `client/src/App.jsx` to register new resources with icons and menu groups

## 3.5. Cleanup of Unnecessary Files

- [ ] Identify entity files not needed for your domain (both client and server)
- [ ] Create a `/reference` directory to store valuable implementation examples
- [ ] Move or remove unnecessary entity files from active codebase:
  - [ ] Server-side entity files in `/server/src/db/entities/`
  - [ ] Server-side entity modules in `/server/src/entity-modules/`
  - [ ] Client-side entity definitions in `/client/src/entities/`
- [ ] Clean up imports and registrations of removed entities
- [ ] Remove or adapt specialized reports and views that are domain-specific
- [ ] Clean up unnecessary translations from `domainTranslations.js`

## 4. Database Configuration

- [ ] Update database name in environment variables
- [ ] Configure TypeORM connection in `/server/shared/config/typeorm.config.ts`
- [ ] Create initial migration or SQL script for database schema
- [ ] Update `/db/data.sql` with initial seed data for your entities

## 5. Authentication & Access Control

- [ ] Review and update user roles in permission utilities
- [ ] Update permission checks in `App.jsx` if needed
- [ ] Configure authentication provider as needed

## 6. Localization

- [ ] Update translations in `client/src/domainTranslations.js`
- [ ] Keep or change the Hebrew language support based on your needs

## 7. Reports & Custom Views

- [ ] Define custom reports based on your entities
- [ ] Create report generators in `/server/src/reports/`
- [ ] Define corresponding UI components in `/client/src/reports/`

## 8. API & Integration Points

- [ ] Review and update API configurations in NestJS
- [ ] Maintain or update external system integrations (like Yemot)
- [ ] Update environment variables for integrations

## 9. Testing & Documentation

- [ ] Update test files to match your new entities
- [ ] Create new project documentation
- [ ] Update swagger configuration in `server/src/main.ts`

## 10. Deployment Configuration

- [ ] Update environment variables in `docker-compose.override.yml.template`
- [ ] Review and update nginx configuration if needed
- [ ] Create deployment scripts or CI/CD pipelines for your environment

## 11. Finishing Touches

- [ ] Update README files with your project details
- [ ] Validate all features work with your new entities
- [ ] Create project index document similar to existing one