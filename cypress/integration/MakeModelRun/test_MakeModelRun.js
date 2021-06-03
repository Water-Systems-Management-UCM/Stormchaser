
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
        textBox++;

        //irr avail %
        // cy.get(".v-slider--horizontal").eq(1).trigger('mousedown').trigger('mousemove', 50, 0).trigger('mouseup')
        cy.get('.v-text-field__slot').eq(++textBox).clear().type(75)

        //land avail %
        cy.get(".v-slider--horizontal").eq(++textBox).trigger('mousedown').trigger('mousemove', 50, 0).trigger('mouseup')

        //Regions ----------------------------------------

        //TODO Find scrollable item and scroll to bottom so we can select cards near bottom
        // cy.get('#list-66').scrollTo('bottom', {ensureScrollable: false})//DOES NOT WORK

        //Typing in region names:
        for (let i = 1; i < inputs.regions.length; i++) {
            cy.get('#region_select_box').click({ force: true }).clear().type(inputs.regions[i])
            cy.get('.v-menu__content .v-list-item .v-simple-checkbox').first().click()
            // cy.get('#region_select_box').type("{esc}")
        }
        for(let i = 0; i < inputs.removed_regions.length; i++){
            cy.get('#region_select_box').click({ force: true }).clear().type(inputs.removed_regions[i])
            cy.get('.v-menu__content .v-list-item .v-simple-checkbox').first().click()
    
        }


        //Clicking the check boxes
        // cy.get('.v-menu__content .v-list-item .v-simple-checkbox').last().click()
        // cy.get('.v-menu__content .v-list-item .v-simple-checkbox').last().click()
        // cy.get('.v-menu__content .v-list-item .v-simple-checkbox').last().click()
        // cy.get('.v-menu__content .v-list-item .v-simple-checkbox').last().click()
        // cy.get('.v-menu__content .v-list-item .v-simple-checkbox').first().click()
        //clicking the checks by number.
        // cy.get('.v-menu__content .v-list-item .v-simple-checkbox').eq(13).click()
        // cy.get('.v-menu__content .v-list-item .v-simple-checkbox').eq(17).click()
        // cy.get('.v-menu__content .v-list-item .v-simple-checkbox').eq(22).click()
        // cy.get('.v-menu__content .v-list-item .v-simple-checkbox').eq(51).click()
        // cy.get('#region_select_box').blur()

        //region cards:
        // card one --------------------
        //rainfall%
        // cy.get('#input-272').clear().type(105)//doesnt work
        cy.get('.v-text-field__slot').eq(++textBox).clear().type(inputs.region_values[3])
        //irr avail using slider
        cy.get(".v-slider--horizontal").eq(++textBox).trigger('mousedown').trigger('mousemove', 50, 0).trigger('mouseup')
        //land avail
        //decrement with '-'
        for (let i = 0; i < 5; i++) {
            cy.get('[title="Decrement Land Availability (%) Value"]').eq(1).click()
        }

        // card two --------------------
        //rainfall%
        //increment with '+'
        for (let i = 0; i < 3; i++) {
            cy.get('[title="Increment Rainfall (%) Value"]').eq(2).click()
        }

        textBox = 7
        for (; textBox < inputs.region_values.length; textBox++) {
            cy.get('.v-text-field__slot').eq(textBox).clear().type(inputs.region_values[textBox])
        }

        //Clicking 'no production on last 2 cards'
        cy.get('.v-expansion-panel-header').last().click()
        cy.get('.v-expansion-panel-content__wrap').find('button').last().click()
        cy.get('.v-expansion-panel-header').eq(-2).click()
        cy.get('.v-expansion-panel-content__wrap').find('button').eq(-3).click()

        //DELETE THE LAST 2 CARDs
        cy.get("button.remove_card").last().click()
        textBox -= 3
        // cy.get("button.remove_card").last().click()
        // textBox-=3


    })

    it("Crop Modifications", function () {

        ////////////////////////////////////////////
        //go to crop modification
        cy.get('.v-stepper__label').eq(1).click()
        // cy.get('button[id="continue_step2"]').click()

        //set the first 3 boxes for 'All Crops'
        for (let i = 0; i < 3; i++) {
            cy.get('.v-text-field__slot').eq(textBox++).find('input').clear().type(inputs.crops[i])
        }

        cy.get('.Pears.crop .auto_added').should('exist')

        // cy.get('div[role="combobox"]').last().click()
        // cy.get('.v-menu__content .v-list-item .v-simple-checkbox').eq().click()
        // cy.get('.v-menu__content .v-list-item .v-simple-checkbox').eq().click()
        // cy.get('.v-menu__content .v-list-item .v-simple-checkbox').eq().click()
        // // cy.get('.v-menu__content .v-list-item .v-simple-checkbox').eq(5).click()

        // for(let i = 0;i < 18;i++){
        //     cy.get('.v-text-field__slot').eq(textBox+i).clear().type(65)
        // }




        // cy.get('#input-53').invoke('val').then(text => cy.log(text))
        // let foo = cy.get('#input-53').invoke('val').then(text) => {
        //     return text
        // })

    })

    it("Review Inputs Assertions", function () {
        cy.get('.v-stepper__label').eq(2).click()
        cy.get('label').contains('Model Run Name').siblings().type('test')

        //check table entries against inputs.region_values
        let count = 0
        for (let j = 0; j < 4; j++)
            for (let i = -2; i > -5; i--)
                cy.get('td').contains(inputs.regions[j]).siblings().eq(i).should('have.text', inputs.region_values[count++])

        //Make sure removed card does not exist
        cy.get('td').contains(inputs.removed_regions[0]).should('not.exist')

        // cy.get('td').contains('Klickitat').siblings().eq(i).should('have.text',inputs.region_values[count++])
        // cy.get('td').contains('Nespelem').siblings().eq(i).should('have.text',inputs.region_values[count++])
        // cy.get('td').contains('Upper Skagit').siblings().eq(i).should('have.text',inputs.region_values[count++])
        // cy.get('td').contains('Wind - White Salmon').siblings().eq(i).should('have.text',inputs.region_values[count++])

        // }


    })
})