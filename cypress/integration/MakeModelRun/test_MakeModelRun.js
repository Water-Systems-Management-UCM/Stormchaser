
context("Model Inputs", function () {
    let inputs = require('..\\..\\fixtures\\model_inputs.json')

    //if we skip region mod then textBox should be equal to three
    let textBox = 3;

    before(() => {
        cy.visit("/#/make-model-run")
    })

    it("Region Modifications", function () {
        //the current textbox the test is inputting values
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
        cy.get('.v-text-field__slot').eq(textBox++).clear().type(75)

        //land avail %
        cy.get(".v-slider--horizontal").eq(textBox++).trigger('mousedown').trigger('mousemove', 50, 0).trigger('mouseup')

        //Regions ----------------------------------------

        //TODO Find scrollable item and scroll to bottom so we can select cards near bottom
        // cy.get('#list-66').scrollTo('bottom', {ensureScrollable: false})//DOES NOT WORK

        //Typing in region names:
        for (let i = 1; i < inputs.regions.length; i++) {
            cy.get('#region_select_box').click({ force: true }).clear().type(inputs.regions[i])
            cy.get('.v-menu__content .v-list-item .v-simple-checkbox').first().click()
            // cy.get('#region_select_box').type("{esc}")
        }
        for (let i = 0; i < inputs.removed_regions.length; i++) {
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
        cy.get('.v-text-field__slot').eq(textBox).clear().type(inputs.region_values[textBox++])
        //irr avail using slider
        cy.get(".v-slider--horizontal").eq(textBox++).trigger('mousedown').trigger('mousemove', 50, 0).trigger('mouseup')
        //land avail
        //decrement with '-'
        for (let i = 100; i > inputs.region_values[textBox]; i--) {
            cy.get('[title="Decrement Land Availability (%) Value"]').eq(1).click()
        }
        textBox++;
        // card two --------------------
        //rainfall%
        //increment with '+'
        for (let i = 100; i < inputs.region_values[textBox]; i++) {
            cy.get('[title="Increment Rainfall (%) Value"]').eq(2).click()
        }
        textBox++;

        //Should be 7 at this point
        // cy.log('tb= ' + textBox)

        for (; textBox < inputs.region_values.length; textBox++) {
            cy.get('.v-text-field__slot').eq(textBox).clear().type(inputs.region_values[textBox])
        }

        //Clicking 'no production' on last 2 cards
        cy.get('.v-expansion-panel-header').last().click()
        cy.get('.v-expansion-panel-content__wrap').find('button').last().click()
        cy.get('.v-expansion-panel-header').eq(-2).click()
        cy.get('.v-expansion-panel-content__wrap').find('button').eq(-3).click()

        //DELETE THE LAST CARDs
        for (let i = 0; i < inputs.removed_regions.length; i++) {
            cy.get("button.remove_card").last().click()
            textBox -= 3
        }

    })

    it("Crop Modifications", function () {

        ////////////////////////////////////////////
        //go to crop modification
        cy.get('.v-stepper__label').eq(1).click()
        // cy.get('button[id="continue_step2"]').click()

        //set the first 3 boxes for 'All Crops'
        for (let i = 0; i < 3; i++) {
            cy.get('.v-text-field__slot').eq(textBox++).find('input').clear().type(inputs.crop_values[i])
        }

        //Make sure "auto added" tag exists on pears
        cy.get('.Pears.crop .auto_added').should('exist')

        //Adding Crop cards names:
        for (let i = 0; i < inputs.added_crops.length; i++) {
            cy.get('div[role="combobox"]').find('span').last().type('{rightarrow}' + inputs.added_crops[i] + '{enter}{esc}')

            //FOR Some reason I tried about 20 different combinations of commands and only the above one worked with no errors
            // cy.get('.v-menu__content .v-list-item .v-simple-checkbox').first().click()
            // cy.get('div[role="combobox"]').last().click().type("{esc}")
        }

        //adding the crops that will be removed
        for (let i = 0; i < inputs.removed_crops.length; i++) {
            cy.get('div[role="combobox"]').find('span').last().type('{rightarrow}' + inputs.removed_crops[i] + '{enter}{esc}')

        }

        //setting the crop card values. start at 3 because the first 3 values were for all crops
        for (let i = 3; i < inputs.crop_values.length; i++) {
            cy.get('.v-text-field__slot').eq(textBox++).find('input').clear().type(inputs.crop_values[i])
        }

        //Make sure the auto added tag disappeared
        cy.get('.Pears.crop .auto_added').should('not.exist')

        //adding upper limits to last three cards
        cy.get('.v-input__append-outer').last().click()
        cy.get('.v-input__append-outer').eq(-4).click()
        cy.get('.v-input__append-outer').eq(-7).click()

        //====Change upper limit for last three crops============
        for (let j = 0; j < inputs.crop_values_upperlimit.length; j++) {
            for (let i = 200; i > inputs.crop_values_upperlimit[j]; i -= 2) {
                cy.get('button[title="Decrement Upper Value for Crop Area Restrictions (% of Calibrated)"]').eq(-(j + 1)).dblclick()
            }
        }

        //remove upper limit on second to last card
        cy.get('button[title="Remove Upper Limit for Crop Area Restrictions (% of Calibrated)"]').eq(-2).click()

        //remove last card
        cy.get('.remove_card').eq(-1).click()


        //TODO: 
        // Right now I have an input array for the values that get 
        // put into crop cards, and then I use this same input array 
        // to check if the results match, I am thinking about changing 
        // it so the input and outputs are two separate arrays. to clean 
        // up the code. Right now the tests work, but if a value is changed 
        // in "model_inputs.json" then everything would presumably stop working

    })

    it("Review Inputs for Region", function () {

        //move to model details pane 
        cy.get('.v-stepper__label').eq(2).click()

        //set model run name
        cy.get('label').contains('Model Run Name').siblings().type('test')

        //check table entries against inputs.region_values
        let count = 0
        for (let j = 0; j < inputs.regions.length; j++) {
            if (j == inputs.regions.length - 1) {
                //Check that last card is set to No Production:
                cy.get('td').contains(inputs.regions[inputs.regions.length - 1]).siblings().eq(-1).should('have.text', 'No Production')

            } else {
                cy.get('td').contains(inputs.regions[j]).siblings().eq(-1).should('have.text', 'Modeled')
            }
            for (let i = -2; i > -5; i--) {
                cy.get('td').contains(inputs.regions[j]).siblings().eq(i).should('have.text', inputs.region_values[count++])
            }
        }

        //Make sure removed card does not exist
        cy.get('td').contains(inputs.removed_regions[0]).should('not.exist')

    })

    it("Review Inputs for Crops", function () {

        //move to model details pane 
        cy.get('.v-stepper__label').eq(2).click()

        //set model run name
        cy.get('label').contains('Model Run Name').siblings().type('test')
        // cy.get('span').contains('Crop').click({ force: true })

        //Make sure removed crop is not in table
        cy.get('td').contains(inputs.removed_crops[0]).should('not.exist')

        //combine the prepopulated_crops and added_crops then alphabatize them
        let crops = inputs.prepopulated_crops.concat(inputs.added_crops)
        crops.sort()

        // check table entries against inputs.crop_values
        let count = 0
        for (let j = 0; j < crops.length; j++) {
            for (let i = 0; i < 3; i++) {
                cy.get('td').contains(crops[j]).siblings().eq(i).should('have.text', inputs.crop_values[count++])
            }

            //Make sure upper limits are set to "No limit on all cards except the second to last one
            if (j == crops.length - 2) {
                cy.get('td').contains(crops[j]).siblings().eq(3).should('have.text', inputs.crop_values_upperlimit[inputs.crop_values_upperlimit.length - 1])
            } else {
                cy.get('td').contains(crops[j]).siblings().eq(3).should('have.text', 'No Limit')
            }
        }
    })

    //only run this test is all previous tests have been run
    it("Check Model Run Inputs", function () {

        //For testing the test: this line takes us straight to the already built model for faster testing. Only use 
        //if the test model is already built. otherwise, run the code block after the next line.
        // cy.visit("/#/model-run/21")

        cy.get('.v-stepper__label').eq(2).click()
        cy.get('label').contains('Model Run Name').siblings().type('test')
        cy.get('.v-btn__content').contains("Run Model").click()
        cy.get('.v-btn__content').contains("Go to Model Run").click()




        //region checks==========================
        let count = 0
        for (let j = 0; j < inputs.regions.length; j++) {
            if (j == inputs.regions.length - 1) {
                //Check that last card is set to No Production:
                cy.get('span.region_name').contains(inputs.regions[inputs.regions.length - 1]).parent().siblings().eq(-1).should('have.text', 'No Production')

            } else {
                cy.get('span.region_name').contains(inputs.regions[j]).parent().siblings().eq(-1).should('have.text', 'Modeled')
            }
            for (let i = 0; i < 3; i++) {
                cy.get('span.region_name').contains(inputs.regions[j]).parent().siblings().eq(i).should('have.text', (inputs.region_values[count++]/100))
                // cy.get('span.region_name').contains(inputs.regions[j]).parent().siblings().eq(i).should('have.text', (inputs.region_values[count++]*.01))
                // cy.get('span.region_name').contains(inputs.regions[j]).parent().siblings().eq(i).should('have.text', (inputs.region_values[count++]*.01).toFixed(2))
            }
        }
        //Make sure removed region does not exist
        cy.get('span.region_name').contains(inputs.removed_regions[0]).should('not.exist')

        //Crop checks====================================
        //Make sure removed crop is not in table
        cy.get('span.crop_name').contains(inputs.removed_crops[0]).should('not.exist')

        //combine the prepopulated_crops and added_crops then alphabatize them
        let crops = inputs.prepopulated_crops.concat(inputs.added_crops)
        crops.sort()
        count = 0
        for (let j = 0; j < crops.length; j++) {
            for (let i = 0; i < 3; i++) {
                cy.get('span.crop_name').contains(crops[j]).parent().siblings().eq(i).should('have.text', (inputs.crop_values[count++])/100)
            }

            //Make sure upper limits are set to "No limit on all cards except the second to last one
            if (j == crops.length - 2) {
                cy.get('span.crop_name').contains(crops[j]).parent().siblings().eq(3).should('have.text', (inputs.crop_values_upperlimit[inputs.crop_values_upperlimit.length - 1])/100)
            } else {
                cy.get('span.crop_name').contains(crops[j]).parent().siblings().eq(3).should('have.text', 'No Limit')
            }
        }
    })

    //it.skip this last test if you do not want the test models deleted
    it("Delete Model Run", function () {
        cy.wait(1000)
        cy.get('span[id="sc_delete_placeholder"]').click()
        cy.wait(1000)
        cy.get('span[id="sc_delete_placeholder"]').click()
    })
})