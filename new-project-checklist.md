# LLM Guide: Creating a New Project Based on event-management-nra

This checklist serves as a comprehensive guide for an LLM to create a new project based on the event-management-nra architecture. Follow these steps sequentially to set up a complete, customized project.

## Initial Project Setup

### 1. Determine Project Purpose and Name
- [ ] Ask the user about the purpose of the new project
- [ ] Ask the user to choose a name for the new project (e.g., `new-project-name`)
- [ ] Ask the user where to clone the repository to

### 2. Repository Setup
- [ ] Clone the event-management-nra repository to the specified location:
  ```bash
  git clone https://github.com/your-organization/event-management-nra.git new-project-name
  cd new-project-name
  ```
- [ ] Delete the existing git history and initialize a new repository:
  ```bash
  rm -rf .git
  git init
  ```
- [ ] Ask the user for the new git repository URL and update the origin:
  ```bash
  git remote add origin [NEW_REPOSITORY_URL]
  ```
- [ ] Clone the required git submodules:
  ```bash
  git submodule add https://github.com/buzz-code/nra-client.git client/shared
  git submodule add https://github.com/buzz-code/nra-server.git server/shared
  git submodule update --init --recursive
  ```

### 3. Project Name Replacement
- [ ] Perform a global search and replace to update project naming:
  ```bash
  find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/coverage/*" -exec sed -i 's/event-management-nra/new-project-name/g' {} \;
  ```
- [ ] Rename VS Code workspace file:
  ```bash
  mv event-management-nra.code-workspace new-project-name.code-workspace
  ```
- [ ] Update package.json files in client and server directories:
  ```bash
  sed -i 's/"name": "event-management-nra-client"/"name": "new-project-name-client"/' client/package.json
  sed -i 's/"name": "event-management-nra-server"/"name": "new-project-name-server"/' server/package.json
  ```
- [ ] Update docker-compose.yml and related files with new service names:
  ```bash
  sed -i 's/event_management_nra/new_project_name/g' docker-compose.yml
  sed -i 's/event_management_nra/new_project_name/g' docker-compose.override.yml.template
  ```

## Configuration Setup

### 4. Environment Configuration
- [ ] Create necessary environment files:
  ```bash
  cp .env.template .env
  cp docker-compose.override.yml.template docker-compose.override.yml
  ```
- [ ] Ask the user for required environment variables and update the .env file:
  ```
  MYSQL_HOST=db
  MYSQL_USER=[Ask for username]
  MYSQL_PASSWORD=[Ask for password]
  MYSQL_DATABASE=new_project_name
  MYSQL_ROOT_PASSWORD=[Ask for root password]
  JWT_SECRET=[Generate a random string or ask user]
  ADMIN_USER=[Ask for admin username]
  ADMIN_PASSWORD=[Ask for admin password]
  SMTP_USER=[Ask for SMTP username]
  SMTP_PASSWORD=[Ask for SMTP password]
  DOMAIN_NAME=[Ask for domain name]
  ```
### 5. VS Code Configuration
- [ ] Update VS Code workspace settings:
  ```bash
  mkdir -p .vscode
  echo '{
    "files.exclude": {
      "**/.git": true,
      "**/node_modules": true
    },
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true
    }
  }' > .vscode/settings.json
  ```

## Development Environment Setup

### 6. Install Dependencies and Start Docker
- [ ] Install npm dependencies:
  ```bash
  cd client && yarn install
  cd ../server && yarn install
  cd ..
  ```
- [ ] Build and start the Docker environment:
  ```bash
  docker compose build
  docker compose up -d
  ```
- [ ] Verify the containers are running correctly:
  ```bash
  docker compose ps
  ```
- [ ] Check application logs for any errors:
  ```bash
  docker compose logs client
  docker compose logs server
  docker compose logs db
  ```
- [ ] Validate application access:
  - Client: http://localhost:30013
  - Server: http://localhost:30014
  - phpMyAdmin: http://localhost:30015
  - Verify successful connection with a curl command:
    ```bash
    curl -I http://localhost:30014/api
    ```

## Application Customization

### 7. UI Theme Customization
- [ ] Ask the user for primary, secondary, and accent colors for the theme
- [ ] Update the theme configuration in client/src/App.jsx:
  ```javascript
  // Look for the createTheme function call and update with user's color choices
  const customTheme = createTheme({
    primary: '[PRIMARY_COLOR]',
    secondary: '[SECONDARY_COLOR]',
    // Other theme options
  });
  ```
- [ ] Ask the user if they want to update the favicon and logo files
- [ ] If yes, guide them to replace the files in client/public/

### 8. Entity Definition and Modeling
- [ ] Work with the user to define entities for their domain:
  - Ask: "What are the main entities in your system?" (e.g., Event, Participant, Product)
  - For each entity, ask: "What properties/fields should this entity have?"
  - Ask about relationships: "How do these entities relate to each other?"
- [ ] Create the necessary TypeORM entity files in server/src/db/entities/
- [ ] Create entity modules in server/src/entity-modules/ following existing patterns
- [ ] Update server/src/entities.module.ts to register the new entities
- [ ] Create corresponding React Admin entity files in client/src/entities/
- [ ] Update client/src/App.jsx to include the new resources with appropriate icons
- [ ] Update translations in client/src/domainTranslations.js for new entities

### 9. Clean Up Unnecessary Files
- [ ] Identify entity files not needed for the new domain
- [ ] Create a reference directory to store valuable implementation examples:
  ```bash
  mkdir -p reference
  ```
- [ ] Move or remove unnecessary entity files from the active codebase

## Database Setup

### 10. Database Configuration
- [ ] Configure the database connection in server/shared/config/typeorm.config.ts
- [ ] Restart the server to apply configuration changes:
  ```bash
  docker compose restart server
  ```
- [ ] Generate a database migration:
  ```bash
  docker compose exec server yarn typeorm:generate src/migrations/InitialSchema --pretty
  ```
- [ ] Run the migration to create the database schema:
  ```bash
  docker compose exec server yarn typeorm:run
  ```
- [ ] Update db/data.sql with initial seed data for the new entities
- [ ] Import the seed data:
  ```bash
  docker compose exec db bash -c "mysql -u root -p\$MYSQL_ROOT_PASSWORD \$MYSQL_DATABASE < /docker-entrypoint-initdb.d/data.sql"
  ```

## Testing and Validation

### 11. Run Tests
- [ ] Run server-side tests:
  ```bash
  docker compose exec server yarn test
  ```
- [ ] Run client-side tests:
  ```bash
  docker compose exec client yarn test
  ```
- [ ] Fix any failing tests relevant to the new project

## Additional Customization

### 12. Reports and Dashboards
- [ ] Work with the user to identify necessary reports
- [ ] Create server-side report generators in server/src/reports/
- [ ] Create corresponding client-side report components in client/src/reports/
- [ ] Point the LLM to existing reports directory structure for examples:
  ```
  client/src/reports/ - Frontend report components
  server/src/reports/ - Backend report generators
  ```

### 13. Authentication and Authorization
- [ ] Configure user roles in server/shared/auth/
- [ ] Update permission checks in client/src/App.jsx

### 14. Yemot Integration (if needed)
- [ ] Ask if Yemot telephony integration is required
- [ ] If yes, configure settings in server/src/yemot/yemot-handler.ts
- [ ] Design a custom call flow based on project requirements
- [ ] Implement handler classes for each step of the telephony interaction
- [ ] Structure the call flow in the main execute() function
- [ ] Configure voice prompts and response processing
- [ ] Implement data persistence logic for captured information
- [ ] Test the call flow using yemot simulator on the frontend
- [ ] Set up post-call processors for any additional actions after call completion

## Documentation

### 15. Project Documentation
- [ ] Create a new project-index.md file with project details
- [ ] Update README files with specific project information
- [ ] Document API endpoints with Swagger in server/src/main.ts

## Final Steps

### 16. Initial Git Commit
- [ ] Add all files to git:
  ```bash
  git add .
  ```
- [ ] Create initial commit:
  ```bash
  git commit -m "Initial commit for new-project-name"
  ```
- [ ] Push to the remote repository:
  ```bash
  git push -u origin main
  ```

### 17. Final Verification Checklist
- [ ] Verify database connectivity using phpMyAdmin
- [ ] Confirm login functionality
- [ ] Test CRUD operations for each entity
- [ ] Validate reports and dashboard functionality
- [ ] Check email functionality if configured
- [ ] Verify Yemot integration if implemented
- [ ] Check for any remaining references to the original project name