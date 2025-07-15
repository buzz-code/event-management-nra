# Agent Workflow Instructions

## Overview
Concise instructions for AI agents working on the event-management-nra codebase. React Admin + NestJS application with MySQL database, deployed via Docker.

## Repository Setup

### Initial Clone and Submodules
```bash
git clone <repository-url>
cd event-management-nra
git submodule update --init --recursive
```

### Dependency Installation
```bash
# Install dependencies
cd server && yarn install
cd ../client && yarn install
cd ..
```

### Environment Setup
```bash
cp .env.template .env
cp docker-compose.override.yml.template docker-compose.override.yml
```

## Architecture Overview

### Directory Structure
- `client/` - React Admin frontend (Vite + React 18)
- `server/` - NestJS backend (TypeScript + TypeORM)
- `client/shared/`, `server/shared/` - Git submodules with shared components
- `db/` - Database initialization scripts

### Key Technologies
- Frontend: React Admin, Vite, Material-UI, RTL Hebrew support
- Backend: NestJS, TypeORM, MySQL, JWT authentication
- Testing: Jest, Deployment: Docker Compose

## Development Workflow

### Running the Application
```bash
docker compose up -d                    # Start all services
docker compose logs -f [service]       # Check logs
# Access: Client :30013, API :30014, phpMyAdmin :30015
```

### Development Commands
```bash
# Server
cd server
yarn start:dev          # Hot reload development
yarn build              # Production build
yarn test               # Run tests
yarn lint               # ESLint + Prettier

# Client  
cd client
yarn start              # Development server
yarn build              # Production build
yarn test               # Run tests

# Database (from server/)
yarn typeorm:generate src/migrations/Name  # Create migration
yarn typeorm:run                           # Run migrations
```

## Coding Standards

### Code Style (ESLint + Prettier)
- **Indentation**: 2 spaces, **Line length**: 120 chars
- **Quotes**: Single quotes, **Trailing commas**: Required
- **File naming**: kebab-case files, PascalCase classes
- **Format on save**: Configure editor with Prettier
- Run `yarn lint` before commits (server has stricter rules)

### Example TypeScript Style
```typescript
export class EventService {
  constructor(
    private readonly eventRepository: Repository<Event>,
    private readonly configService: ConfigService,
  ) {}

  async findAll(): Promise<Event[]> {
    return this.eventRepository.find({
      relations: ['participants', 'gifts'],
      order: { createdAt: 'DESC' },
    });
  }
}
```

## Entity Development Pattern

### Backend (TypeORM)
1. Create entity in `server/src/db/entities/`
2. Add module in `server/src/entity-modules/`
3. Register in `server/src/entities.module.ts`
4. Generate migration: `yarn typeorm:generate`

### Frontend (React Admin)
1. Create component in `client/src/entities/`
2. Add resource to `client/src/App.jsx`
3. Update `client/src/domainTranslations.js`

## Testing

### Server Tests (Jest + Supertest)
```typescript
describe('EventService', () => {
  let service: EventService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [EventService, mockRepository],
    }).compile();
    service = module.get<EventService>(EventService);
  });

  it('should return events', async () => {
    // Test implementation
  });
});
```

### Client Tests (Jest + React Testing Library)
- Test component behavior and user interactions
- Mock React Admin dependencies

## Common Tasks

### Adding Features
1. Design database schema changes
2. Create/update TypeORM entities and generate migrations
3. Implement backend API endpoints
4. Create frontend components and update translations
5. Add tests for new functionality

### Debugging
1. Check Docker logs: `docker compose logs -f [service]`
2. Verify database connectivity via phpMyAdmin
3. Test API endpoints with curl/Postman
4. Use browser dev tools for frontend issues

### Quality Checks
```bash
cd server && yarn lint && yarn test
cd ../client && yarn test
```

## Important Notes

### Hebrew/RTL Support
- All UI text must support Hebrew RTL
- Use translations from `domainTranslations.js`

### Git Submodules
- Always update: `git submodule update --recursive`
- Commit submodule changes separately

### Database Migrations
- Never edit existing migration files
- Generate new migrations for schema changes
- Test on clean database before production

### Security
- Validate all inputs, use TypeORM parameter binding
- Implement proper authentication, follow JWT best practices

## Quick Reference

### Essential Commands
```bash
# Full reset
docker compose down -v && docker compose up -d

# Database reset
docker compose exec db mysql -u root -p$MYSQL_ROOT_PASSWORD -e "DROP DATABASE IF EXISTS event_management_nra; CREATE DATABASE event_management_nra;"
docker compose restart server
```

### Key Files
- `server/src/main.ts` - Application entry point
- `client/src/App.jsx` - React Admin configuration  
- `server/shared/config/typeorm.config.ts` - Database config
- `client/src/domainTranslations.js` - UI translations
- `docker-compose.yml` - Service orchestration