context("Testing Card Removal Doesn't Fail", function(){
    it("Individual Card Removal", function() {
        cy.visit("/#/make-model-run")
        // add a card
        cy.get('#region_select_box').click({force: true}).type("Soleduc")
        cy.get('.v-menu__content .v-list-item .v-simple-checkbox').first().click()
        cy.get('#region_select_box').type("{esc}")

        cy.wait(2000)
        cy.get("button.remove_card").click()
        cy.wait(2000)

        cy.get('#region_select_box').click({force: true}).type("Soleduc")
        cy.get('.v-menu__content .v-list-item .v-simple-checkbox').first().click()
        cy.get('#region_select_box').type("{esc}")
        cy.wait(2000)

        cy.get("button.remove_card").click()

        cy.wait(2000)

        // this test always seems to behave correctly even when the applications was actuall buggy, so not sure if it's
        // valuable - leaving it for now as a demonstration and way to make future tests more quickly.
        cy.get('#region_select_box').click({force: true})
        cy.get('.v-menu__content .v-list-item .v-simple-checkbox').first().click()
        cy.get('#region_select_box').type("{esc}")
        cy.wait(2000)

        cy.get("button.remove_card").click()

        /*
        // now let's reduce the all_crops sliders
        cy.get('.crop_params .stormcard_slider input:visible').first().clear().type("80").blur()

        // that will have created cards - check for the Beans card and the auto_added flag
        cy.get('.Beans.crop .auto_added').should('exist')

        // adjust the beans card's values
        cy.get('.Beans.crop .stormcard_slider input:visible').first().clear().type("95").blur()
        // which should make the auto_added flag disappear
        cy.get('.Beans.crop .auto_added').should('not.exist')

         */
    })
})