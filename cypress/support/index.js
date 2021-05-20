// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
// import user from '../fixtures/login.json'
// Alternatively you can use CommonJS syntax:
// require('./commands')
before(() => {
    cy.visit("/#")
    cy.fixture('local_settings.json').then((localSettings) => {
        if (sessionStorage.getItem("waterspout_token") === null) {
            cy.get('input[id="username"]').type(localSettings.username)
            cy.get('input[id="password"]').type(localSettings.pass)
            cy.get('button[id="log_in_button"]').click()
            cy.wait(localSettings.login_wait_time)
        }
    })
})