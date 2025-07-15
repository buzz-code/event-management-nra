// cypress/e2e/auth/login.cy.js
describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display login form for unauthenticated users', () => {
    cy.url().should('include', '/login')
    cy.get('[name="username"]').should('be.visible')
    cy.get('[name="password"]').should('be.visible')
    cy.get('[type="submit"]').should('be.visible')
  })

  it('should login successfully with valid credentials', () => {
    cy.get('[name="username"]').type(Cypress.env('testUser').username)
    cy.get('[name="password"]').type(Cypress.env('testUser').password)
    cy.get('[type="submit"]').click()

    // Should redirect to dashboard
    cy.url().should('not.include', '/login')
    cy.waitForReactAdmin()
    cy.contains('Dashboard').should('be.visible')
  })

  it('should show error for invalid credentials', () => {
    cy.get('[name="username"]').type('invalid@example.com')
    cy.get('[name="password"]').type('wrongpassword')
    cy.get('[type="submit"]').click()

    // Should show error message
    cy.contains('Invalid credentials').should('be.visible')
    cy.url().should('include', '/login')
  })

  it('should validate required fields', () => {
    cy.get('[type="submit"]').click()
    
    // Should show validation errors
    cy.contains('Username is required').should('be.visible')
    cy.contains('Password is required').should('be.visible')
  })

  it('should logout successfully', () => {
    // Login first
    cy.login(Cypress.env('testUser').username, Cypress.env('testUser').password)
    cy.visit('/')
    cy.waitForReactAdmin()

    // Find and click logout button
    cy.get('[data-testid="logout-button"]', { timeout: 10000 })
      .should('be.visible')
      .click()

    // Should redirect to login
    cy.url().should('include', '/login')
  })
})