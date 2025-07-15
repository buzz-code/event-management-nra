// cypress/e2e/events/create-event.cy.js
describe('Event Management - Creation', () => {
  beforeEach(() => {
    cy.login(Cypress.env('testUser').username, Cypress.env('testUser').password)
    cy.visit('/events')
    cy.waitForReactAdmin()
  })

  afterEach(() => {
    cy.cleanupTestData()
  })

  it('should display events list page', () => {
    cy.contains('Events').should('be.visible')
    cy.get('[data-testid="create-button"]', { timeout: 10000 }).should('be.visible')
    
    // Should show events table or empty state
    cy.get('[role="table"]').should('exist')
  })

  it('should create a new event successfully', () => {
    // Click create button
    cy.get('[data-testid="create-button"]').click()
    
    // Fill form
    cy.get('[name="title"]').type('Cypress Test Event')
    cy.get('[name="date"]').type('2024-06-15')
    cy.get('[name="description"]').type('Created via Cypress E2E test')
    
    // Submit form
    cy.get('[type="submit"]').click()
    
    // Should show success message and redirect
    cy.contains('Event created successfully', { timeout: 10000 }).should('be.visible')
    cy.url().should('include', '/events/')
    
    // Verify event details are displayed
    cy.contains('Cypress Test Event').should('be.visible')
    cy.contains('Created via Cypress E2E test').should('be.visible')
  })

  it('should validate required fields', () => {
    cy.get('[data-testid="create-button"]').click()
    
    // Try to submit empty form
    cy.get('[type="submit"]').click()
    
    // Should show validation errors
    cy.contains('Title is required').should('be.visible')
    cy.contains('Date is required').should('be.visible')
  })

  it('should validate date format', () => {
    cy.get('[data-testid="create-button"]').click()
    
    cy.get('[name="title"]').type('Test Event')
    cy.get('[name="date"]').type('invalid-date')
    cy.get('[type="submit"]').click()
    
    cy.contains('Invalid date format').should('be.visible')
  })

  it('should cancel event creation', () => {
    cy.get('[data-testid="create-button"]').click()
    
    // Fill some data
    cy.get('[name="title"]').type('Test Event')
    
    // Click cancel
    cy.contains('Cancel').click()
    
    // Should return to events list
    cy.url().should('match', /\/events$/)
    cy.contains('Events').should('be.visible')
  })

  it('should handle server errors gracefully', () => {
    // Intercept API call to simulate error
    cy.intercept('POST', '/events', {
      statusCode: 500,
      body: { message: 'Internal server error' }
    }).as('createEventError')
    
    cy.get('[data-testid="create-button"]').click()
    cy.get('[name="title"]').type('Test Event')
    cy.get('[name="date"]').type('2024-06-15')
    cy.get('[type="submit"]').click()
    
    cy.wait('@createEventError')
    cy.contains('Error creating event').should('be.visible')
  })
})