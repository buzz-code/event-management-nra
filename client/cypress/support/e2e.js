// cypress/support/e2e.js
import './commands'

// Disable Cypress's default behavior of logging fetch/xhr requests
Cypress.on('window:before:load', (win) => {
  // Stub console methods to reduce noise in test output
  win.console.warn = cy.stub()
  win.console.error = cy.stub()
})

// Handle uncaught exceptions from React-Admin
Cypress.on('uncaught:exception', (err, runnable) => {
  // React-Admin may throw harmless errors during development
  if (err.message.includes('ResizeObserver') || 
      err.message.includes('Non-Error promise rejection captured')) {
    return false
  }
  // Let other errors fail the test
  return true
})