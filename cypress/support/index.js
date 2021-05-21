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
import { after } from 'lodash'
import './commands'
// import user from '../fixtures/local_settings.json'
// Alternatively you can use CommonJS syntax:
// require('./commands')
before(() => {
    cy.visit("/#")
    if (sessionStorage.getItem("waterspout_token") === null) {
        cy.fixture('local_settings.json').then((localSettings) => {
            cy.get('input[id="username"]').type(localSettings.username)
            cy.get('input[id="password"]').type(localSettings.pass)
            cy.get('button[id="log_in_button"]').click()
            cy.wait(localSettings.login_wait_time)
        })
    }
})

// after(() => {
//     cy.get('.v-navigation-drawer__content .v-list-item__content').eq(6).click()
//     cy.wait(200)
// })
