# E2E Testing Implementation Guide

## Quick Start (5 Minutes)

### 1. Install Cypress (Skip Puppeteer)
```bash
cd client
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install --save-dev cypress @testing-library/cypress
```

### 2. Initialize Cypress
```bash
npx cypress open
# This creates the cypress folder structure automatically
```

### 3. Run Your First Test
```bash
# Start your application first
npm run start  # Client on :3000
cd ../server && npm run start:dev  # Server on :3001

# Run Cypress tests
cd ../client
npm run cypress:open  # Interactive mode
# OR
npm run cypress:run   # Headless mode
```

## File Structure (Already Created)
```
client/
├── cypress.config.js           ✅ Configuration
├── cypress/
│   ├── e2e/
│   │   ├── auth/
│   │   │   └── login.cy.js     ✅ Authentication tests
│   │   └── events/
│   │       └── create-event.cy.js ✅ Event creation tests
│   ├── support/
│   │   ├── e2e.js              ✅ Global setup
│   │   └── commands.js         ✅ Custom commands
│   └── fixtures/
│       └── testData.json       ✅ Test data
```

## Package.json Scripts (Already Added)
```json
{
  "scripts": {
    "cypress:open": "cypress open",
    "cypress:run": "cypress run",
    "test:e2e": "cypress run",
    "test:e2e:dev": "cypress open"
  }
}
```

## Next Steps

### Phase 1: Immediate (This Week)
1. **Install Dependencies**
   ```bash
   cd client
   PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install --save-dev cypress
   ```

2. **Configure Test User**
   - Create test user in your database
   - Update `cypress.config.js` with real credentials

3. **Run Basic Tests**
   ```bash
   npm run cypress:open
   ```

### Phase 2: Expand Coverage (Next Week)
1. **Add More Test Scenarios**
   - Student management workflows
   - Report generation
   - File upload/download

2. **Data Management**
   - Set up test data seeding
   - Implement cleanup strategies

### Phase 3: CI/CD Integration (Week 3)
1. **GitHub Actions**
   - Use provided `github-actions-e2e-example.yml`
   - Configure secrets for database

2. **Performance Monitoring**
   - Add Lighthouse audits
   - Monitor test execution time

## Custom Commands Available

```javascript
// Login helper
cy.login('admin@test.com', 'password')

// API calls
cy.apiRequest('POST', '/events', eventData)

// Test data management
cy.createTestEvent({ title: 'My Event' })
cy.cleanupTestData()

// React-Admin specific
cy.waitForReactAdmin()
```

## Test Data Strategy

### Option 1: API-Based (Recommended)
```javascript
beforeEach(() => {
  cy.createTestEvent().then((event) => {
    cy.wrap(event.body.id).as('eventId')
  })
})

afterEach(() => {
  cy.cleanupTestData()
})
```

### Option 2: Database Seeding
```javascript
// Create seed script in server
beforeEach(() => {
  cy.task('seedDatabase')
})

afterEach(() => {
  cy.task('clearDatabase')
})
```

## Debugging Tips

### 1. Visual Debugging
```javascript
// Add screenshots and waits for debugging
cy.screenshot('before-action')
cy.get('[data-testid="button"]').click()
cy.wait(1000)  // Only for debugging
cy.screenshot('after-action')
```

### 2. Network Debugging
```javascript
// Intercept API calls
cy.intercept('GET', '/events').as('getEvents')
cy.visit('/events')
cy.wait('@getEvents').then((interception) => {
  expect(interception.response.statusCode).to.eq(200)
})
```

### 3. React-Admin Specific
```javascript
// Wait for loading states
cy.get('.ra-loading').should('not.exist')
cy.get('[role="main"]').should('be.visible')

// Handle notifications
cy.get('.ra-notification').should('contain', 'Success')
```

## Performance Considerations

### Test Execution Time
- **Target**: < 10 minutes for full suite
- **Strategy**: Run in parallel where possible
- **Optimization**: Use `cy.session()` for login state

### Resource Usage
- **Browser**: Chrome headless for CI
- **Database**: Use test database with clean state
- **Network**: Mock external APIs when possible

## Maintenance Guidelines

### 1. Stable Selectors
```javascript
// ✅ Good - stable selectors
cy.get('[data-testid="create-button"]')
cy.get('[role="button"]')

// ❌ Avoid - fragile selectors
cy.get('.css-xyz123')
cy.contains('Click here')  // Text can change
```

### 2. Test Independence
```javascript
// ✅ Each test is independent
describe('Events', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/events')
  })
  
  it('should create event', () => {
    // Test creates its own data
  })
})
```

### 3. Error Handling
```javascript
// Handle expected errors gracefully
cy.on('uncaught:exception', (err) => {
  if (err.message.includes('ResizeObserver')) {
    return false  // Ignore React-Admin quirks
  }
})
```

## Success Metrics

### Week 1 Goals
- [ ] Cypress installed and configured
- [ ] Authentication tests passing
- [ ] Basic event creation test working

### Week 2 Goals
- [ ] 5+ critical workflows covered
- [ ] Test data management working
- [ ] CI/CD pipeline basic setup

### Week 4 Goals
- [ ] 15+ test scenarios
- [ ] < 5% flaky test rate
- [ ] Automated reporting

## Integration with Existing Tests

### Unit Tests (Keep)
- Server: 78% coverage ✅
- Client utilities: High coverage ✅

### E2E Tests (New)
- User workflows ✅
- Integration scenarios ✅
- Visual validation ✅

### Test Pyramid
```
     /\
    /E2E\      ← Small number, high value
   /------\
  /Integration\ ← Medium number, medium value  
 /----------\
/Unit Tests  \ ← Large number, fast execution
/____________\
```

This approach provides **maximum coverage** with **minimum maintenance** effort while being **cost-effective** for your development team.