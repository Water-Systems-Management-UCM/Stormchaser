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
beforeEach(() => {
    cy.visit("/#")
    if (sessionStorage.getItem("waterspout_token") === null) {
        cy.fixture('login.json').then((user) => {
            cy.get('input[id="username"]').type(user.username)
            cy.get('input[id="password"]').type(user.pass)
        })
        cy.get('button[id="log_in_button"]').click()
    }

    cy.wait(3000)
})