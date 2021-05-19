context("Testing Settings Saved", function () {
    it("Does 'Settings Saved' Appear?", function () {

        //go directly to settings
        cy.visit('/#/settings')
        
        //check that the 'save settings' button is not displayed before we toggle a setting
        cy.get('.v-snack__wrapper').should('not.be.visible')

        //toggle first setting
        cy.get('.v-input--switch .v-input--selection-controls__input').first().click()

        //closes 'settings saved' popup
        //this line will fail if the 'settings save' does not appear
        cy.get('.v-snack__action').first().click()

        //repeats with all toggles
        cy.get('.v-snack__wrapper').should('not.be.visible')
        //toggle second element
        cy.get('.v-input--switch .v-input--selection-controls__input').eq(1).click()
        cy.get('.v-snack__action').first().click()


        cy.get('.v-snack__wrapper').should('not.be.visible')
        cy.get('.v-input--switch .v-input--selection-controls__input').first().click()
        cy.get('.v-snack__action').first().click()


        cy.get('.v-snack__wrapper').should('not.be.visible')
        cy.get('.v-input--switch .v-input--selection-controls__input').eq(1).click()
        cy.get('.v-snack__action').first().click()
        
        cy.get('.v-snack__wrapper').should('have.css','display','none')
    })
    
    //The test below performs the same test in a different way
    /*
    it("Does 'Settings Saved' Appear?", function () {

        //click nav bar
        cy.get('button[id="nav_drawer_toggle"]').click()

        //click settings
        cy.get('.v-navigation-drawer__content .v-list-item__content').eq(4).click()

        //check that the 'save settings' button is not displayed before we toggle a setting
        //the two lines below do the same thing
        cy.get('.v-snack__wrapper').should('have.css','display','none')
        cy.get('.v-snack__wrapper').should('not.be.visible')

        //toggle first setting
        cy.get('.v-input--switch .v-input--selection-controls__input').first().click()

        //checks if "settings saved" is visible
        cy.get('.v-snack__wrapper').should('not.have.css','display','none')


        cy.wait(100)

        //closes 'settings saved'
        //this line will fail if the 'settings save' does not appear, so we could have just used this to test
        cy.get('.v-snack__action').first().click()

        //repeats with all toggles
        cy.get('.v-snack__wrapper').should('have.css','display','none')
        cy.get('.v-input--switch .v-input--selection-controls__input').eq(1).click()
        cy.get('.v-snack__wrapper').should('not.have.css','display','none')

        cy.wait(100)
        cy.get('.v-snack__action').first().click()

        cy.get('.v-snack__wrapper').should('have.css','display','none')
        cy.get('.v-input--switch .v-input--selection-controls__input').first().click()
        cy.get('.v-snack__wrapper').should('not.have.css','display','none')

        cy.wait(100)
        cy.get('.v-snack__action').first().click()

        cy.get('.v-snack__wrapper').should('have.css','display','none')
        cy.get('.v-input--switch .v-input--selection-controls__input').eq(1).click()
        cy.get('.v-snack__wrapper').should('not.have.css','display','none')

        cy.wait(100)
        cy.get('.v-snack__action').first().click()
        cy.get('.v-snack__wrapper').should('have.css','display','none')
    })
    */
})