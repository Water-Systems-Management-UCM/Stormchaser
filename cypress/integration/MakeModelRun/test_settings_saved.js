context("Testing Settings Saved", function () {
    it("Does Settings Saved Appear?", function () {
        cy.visit("/#")

        if (sessionStorage.getItem("waterspout_token") === null) {

            const username = "shivn"
            const pass = "test"

            cy.get('input[id="username"]').type(username)
            cy.get('input[id="password"]').type(pass)
            cy.get('button[id="log_in_button"]').click()
        }

        cy.wait(3000)

        //click nav bar
        cy.get('button[id="nav_drawer_toggle"]').click()

        //click settings
        cy.get('.v-navigation-drawer__content .v-list-item__content').eq(4).click()

        //toggle first setting
        cy.get('.v-input--switch .v-input--selection-controls__input').first().click()

        //checks if "settings saved" exists or not
        cy.get('.v-snack__action').should('exist')

        cy.wait(100)

        //closes dialouge
        cy.get('.v-snack__action').first().click()

        //repeats with all toggles
        cy.get('.v-input--switch .v-input--selection-controls__input').eq(1).click()
        cy.get('.v-snack__action').should('exist')
        cy.wait(100)
        cy.get('.v-snack__action').first().click()

        cy.get('.v-input--switch .v-input--selection-controls__input').first().click()
        cy.get('.v-snack__action').should('exist')
        cy.wait(100)
        cy.get('.v-snack__action').first().click()

        cy.get('.v-input--switch .v-input--selection-controls__input').eq(1).click()
        cy.get('.v-snack__action').should('exist')
        cy.wait(100)
        cy.get('.v-snack__action').first().click()
    })

})