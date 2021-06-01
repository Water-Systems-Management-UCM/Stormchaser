
context("Model Inputs", function () {
    let inputs = require('..\\..\\fixtures\\model_inputs.json')
    let textBox = 3;
    before(() => {
        cy.visit("/#/make-model-run")
    })

    it("Region Modifications", function () {

        textBox = 0

        //individual events needed to create a click and drag
        //cy.get(".v-slider__thumb-container").first().focus()
        // cy.get(".v-slider--horizontal").first().trigger('mousedown')
        // cy.get(".v-slider--horizontal").first().trigger('mousemove', 100,0)
        // cy.get(".v-slider--horizontal").first().trigger('mousemove', { clientX: 400, clientY: 0 })//a different way to move the slider
        // cy.get(".v-slider--horizontal").first().trigger('mouseup')

        //-----------------------------------
        //clicks, drags, and mouseUp on the sliders

        //rainfall %
        cy.get(".v-slider__thumb-container").first().focus()
        cy.get(".v-slider--horizontal").first().trigger('mousedown').trigger('mousemove', 100, 0).trigger('mouseup')

        //irr avail %
        // cy.get(".v-slider--horizontal").eq(1).trigger('mousedown').trigger('mousemove', 50, 0).trigger('mouseup')
        cy.get('.v-text-field__slot').eq(++textBox).clear().type(75)

        //land avail %
        cy.get(".v-slider--horizontal").eq(++textBox).trigger('mousedown').trigger('mousemove', 50, 0).trigger('mouseup')

        //Regions ----------------------------------------
        cy.get('#region_select_box').click({ force: true })
        //TODO Find scrollable item and scroll to bottom so we can select cards near bottom
        // cy.get('#list-66').scrollTo('bottom', {ensureScrollable: false})
        cy.get('.v-menu__content .v-list-item .v-simple-checkbox').last().click()
        cy.get('.v-menu__content .v-list-item .v-simple-checkbox').last().click()
        cy.get('.v-menu__content .v-list-item .v-simple-checkbox').last().click()
        cy.get('.v-menu__content .v-list-item .v-simple-checkbox').last().click()
        cy.get('.v-menu__content .v-list-item .v-simple-checkbox').first().click()
        // cy.get('.v-menu__content .v-list-item .v-simple-checkbox').eq(13).click()
        // cy.get('.v-menu__content .v-list-item .v-simple-checkbox').eq(17).click()
        // cy.get('.v-menu__content .v-list-item .v-simple-checkbox').eq(22).click()
        // cy.get('.v-menu__content .v-list-item .v-simple-checkbox').eq(51).click()

        // cy.get('#region_select_box').blur()

        //region cards:
        // card one --------------------
        //rainfall%
        // cy.get('#input-272').clear().type(105)//doesnt work
        cy.get('.v-text-field__slot').eq(++textBox).clear().type(inputs.region[3])
        //irr avail using slider
        cy.get(".v-slider--horizontal").eq(++textBox).trigger('mousedown').trigger('mousemove', 50, 0).trigger('mouseup')
        //land avail using '-'
        for (let i = 0; i < 5; i++) {
            cy.get('[title="Decrement Land Availability (%) Value"]').eq(1).click()
        }

        // card two --------------------
        //rainfall%
        for (let i = 0; i < 3; i++) {
            cy.get('[title="Increment Rainfall (%) Value"]').eq(2).click()
        }

        textBox = 7
        for(;textBox < inputs.region.length;textBox++){
            cy.get('.v-text-field__slot').eq(textBox).clear().type(inputs.region[textBox])
        }
        // // cy.get('.v-text-field__slot').eq(textBox++).clear().type(105)
        // cy.get('.v-text-field__slot').eq(textBox).clear().type(inputs.region[textBox++])

        // //land avail using '-'
        // cy.get('.v-text-field__slot').eq(textBox).clear().type(inputs.region[textBox++])

        // //card 3 ----------------
        // //rainfall%
        // cy.get('.v-text-field__slot').eq(textBox).clear().type(inputs.region[textBox++])
        // //irr avail using slider
        // cy.get('.v-text-field__slot').eq(textBox).clear().type(inputs.region[textBox++])
        // //land avail using '-'
        // cy.get('.v-text-field__slot').eq(textBox++).clear().type(75)

        // //card 4 ----------------
        // //rainfall%
        // cy.get('.v-text-field__slot').eq(textBox++).clear().type(80)
        // //irr avail using slider
        // cy.get('.v-text-field__slot').eq(textBox++).clear().type(95)
        // //land avail using '-'
        // cy.get('.v-text-field__slot').eq(textBox++).clear().type(75)
        // // textBox = 15

        // //card 5 ----------------
        // //rainfall%
        // cy.get('.v-text-field__slot').eq(textBox++).clear().type(88)
        // //irr avail using slider
        // cy.get('.v-text-field__slot').eq(textBox++).clear().type(88)
        // //land avail using '-'
        // cy.get('.v-text-field__slot').eq(textBox++).clear().type(88)

        //Clicking 'no production on last 2 cards'
        cy.get('.v-expansion-panel-header').last().click()
        cy.get('.v-expansion-panel-content__wrap').find('button').last().click()
        cy.get('.v-expansion-panel-header').eq(-2).click()
        cy.get('.v-expansion-panel-content__wrap').find('button').eq(-3).click()

    })

    it.skip("Crop Modifications", function () {

        ////////////////////////////////////////////
        //go to crop modification
        cy.get('button[id="continue_step2"]').click()


        //price %
        cy.get('.v-text-field__slot').eq(textBox++).find('input').clear().type(95)
        // cy.wait(400)

        //yield %
        cy.get('.v-text-field__slot').eq(textBox++).find('input').clear().type(107)
        // cy.wait(400)

        //area restric %
        cy.get('.v-text-field__slot').eq(textBox++).find('input').clear().type(15)
        // cy.wait(100)

        // cy.get('#input-53').invoke('val').then(text => cy.log(text))
        // let foo = cy.get('#input-53').invoke('val').then(text) => {
        //     return text
        // })



        // add a card
        // cy.get('#region_select_box').click({ force: true }).type("Soleduc")
        // cy.get('.v-menu__content .v-list-item .v-simple-checkbox').first().click()
        // cy.get('#region_select_box').type("{esc}")

        // cy.wait(2000)
        // cy.get("button.remove_card").click()
        // cy.wait(2000)

        // cy.get('#region_select_box').click({ force: true }).type("Soleduc")
        // cy.get('.v-menu__content .v-list-item .v-simple-checkbox').first().click()
        // cy.get('#region_select_box').type("{esc}")
        // cy.wait(2000)

        // cy.get("button.remove_card").click()

        // cy.wait(2000)

        // // this test always seems to behave correctly even when the applications was actuall buggy, so not sure if it's
        // // valuable - leaving it for now as a demonstration and way to make future tests more quickly.
        // cy.get('#region_select_box').click({ force: true })
        // cy.get('.v-menu__content .v-list-item .v-simple-checkbox').first().click()
        // cy.get('#region_select_box').type("{esc}")
        // cy.wait(2000)

        // cy.get("button.remove_card").click()

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