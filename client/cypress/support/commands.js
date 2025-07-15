// cypress/support/commands.js

// Custom command for login
Cypress.Commands.add('login', (username, password) => {
  cy.session([username, password], () => {
    cy.visit('/login')
    cy.get('[name="username"]').type(username)
    cy.get('[name="password"]').type(password)
    cy.get('[type="submit"]').click()
    
    // Wait for successful login
    cy.url().should('not.include', '/login')
    cy.contains('Dashboard', { timeout: 10000 }).should('be.visible')
  })
})

// Custom command for API calls
Cypress.Commands.add('apiRequest', (method, url, body = null) => {
  return cy.request({
    method,
    url: `${Cypress.env('apiUrl')}${url}`,
    body,
    headers: {
      'Content-Type': 'application/json',
    },
    failOnStatusCode: false
  })
})

// Custom command for creating test data
Cypress.Commands.add('createTestEvent', (eventData = {}) => {
  const defaultEvent = {
    title: `Test Event ${Date.now()}`,
    date: '2024-06-15',
    description: 'Cypress E2E test event',
    ...eventData
  }
  
  return cy.apiRequest('POST', '/events', defaultEvent)
})

// Custom command for cleanup
Cypress.Commands.add('cleanupTestData', () => {
  // Clean up test events created during tests
  cy.apiRequest('GET', '/events?filter=title||$cont||Test Event')
    .then((response) => {
      if (response.body?.data) {
        response.body.data.forEach(event => {
          cy.apiRequest('DELETE', `/events/${event.id}`)
        })
      }
    })
})

// Custom command for waiting for React-Admin to load
Cypress.Commands.add('waitForReactAdmin', () => {
  cy.get('[role="main"]', { timeout: 15000 }).should('be.visible')
  cy.get('.ra-loading', { timeout: 10000 }).should('not.exist')
})