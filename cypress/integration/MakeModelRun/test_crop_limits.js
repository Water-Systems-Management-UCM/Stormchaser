context("Testing Crop Modification Limits", function(){
    it("Basic limits", function() {
        cy.visit('/#/make-model-run')
        cy.get('button[id="continue_step2"]').click()

        // now let's reduce the all_crops sliders
        cy.get('.crop_params .stormcard_slider input:visible').first().clear().type("80").blur()

        // that will have created cards - check for the Beans card and the auto_added flag
        cy.get('.Beans.crop .auto_added').should('exist')

        // adjust the beans card's values
        cy.get('.Beans.crop .stormcard_slider input:visible').first().clear().type("95").blur()
        // which should make the auto_added flag disappear
        cy.get('.Beans.crop .auto_added').should('not.exist')
    })
})