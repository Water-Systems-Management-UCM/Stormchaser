context("Testing Crop Modification Limits", function(){
    it("Login/Logout", function() {
        cy.get('button[id="nav_drawer_toggle"]').click()
        cy.wait(300)
        
        // click logout
        cy.get('.v-navigation-drawer__content .v-list-item__content').eq(6).click()
        cy.wait(200)

    })
})