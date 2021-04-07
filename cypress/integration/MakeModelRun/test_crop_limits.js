context("Testing Crop Modification Limits", function(){
    it("Basic limits", function() {
        cy.visit("/#/make-model-run")

        if (localStorage.getItem("waterspout_token") === null) {

            const username = "dsx"
            const pass = "a"

            cy.get('input[id="username"]').type(username)
            cy.get('input[id="password"]').type(pass)
            cy.get('button[id="log_in_button"]').click()
        }
        cy.get('button[id="continue_step2"]').click()


    })
})