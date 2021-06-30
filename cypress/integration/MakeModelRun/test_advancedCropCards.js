const { each } = require('lodash');

context("Model Inputs", function () {
    let inputs = require('../../fixtures/advancedCropCards_inputs.json')

    //if we skip region mod then textBox should be equal to three
    let textBox = 3;

    before(() => {
        cy.visit("/#/make-model-run")
    })

    it("Crop Modifications", function () {

        ////////////////////////////////////////////
        //go to crop modification
        cy.wait(1000)
        cy.get('.v-stepper__label').eq(1).click()
        // cy.get('button[id="continue_step2"]').click()

        //set the first 3 boxes for 'All Crops'
        for (let i = 0; i < 3; i++) {
            cy.get('.v-text-field__slot').eq(textBox++).find('input').clear().type(inputs.crop_values[i])
        }

        //Make sure "auto added" tag exists on pears
        cy.get('.Pears.crop .auto_added').should('exist')


        //Check that crop card is not auto added, add crop cards, then add
        // region. OR: seperate auto added

        for(let t of inputs.added_crops){
            // for (let i = 0; i < inputs.added_crops1.length; i++) {
            if(t.includes('-')){
                let crop = t.split(' ')[0]
                let region = t.split(' ')[2]
                cy.log(crop, region)
                if(inputs.prepopulated_crops.includes(crop)){
                    
                }else{
                    // cy.get('div[role="combobox"]').find('input').type(crop + '{enter}{esc}')
                    // cy.get('div[role="combobox"]').find('span').last().type('{rightarrow}' + crop + '{enter}{esc}')
                    cy.get('div[role="combobox"]').find('span').last().type('{rightarrow}' + crop)
                    cy.get('div[role=listbox]').find('div.v-list-item__title').contains(crop).click()
                }

                cy.get('div[title='+crop+']').find('button').contains("Advanced").click()
                cy.get('div[title='+crop+']').find('div[role=combobox]').click().type(region)
                cy.get('span.v-list-item__mask').contains(region).last().click()
            }else{
                let crop = t
                cy.get('div[role="combobox"]').find('span').last().type('{rightarrow}' + crop)
                cy.get('div[role=listbox]').find('div.v-list-item__title').contains(crop).click()
                cy.get('div[role="combobox"]').find('input').eq(-2).type('{esc}')
                
            }

        }

    })

    it("Review Inputs for Crops", function () {

        //move to model details pane 
        cy.get('.v-stepper__label').eq(2).click()

        //set model run name
        cy.get('label').contains('Model Run Name').siblings().type('Avanced Crop Card Test')
        // cy.get('span').contains('Crop').click({ force: true })

        //Make sure removed crop is not in table
        // cy.get('td').contains(inputs.removed_crops[0]).should('not.exist')

        //sort crops in table:
        cy.get('th[aria-label="Crop: Not sorted. Activate to sort ascending."]').click()

        //combine the prepopulated_crops and added_crops then alphabatize them
        let crops = inputs.prepopulated_crops.concat(inputs.added_crops)
        crops.sort()

        for (let j = 0; j < crops.length; j++) {
            //check the crops out of order
            cy.get('td').contains(new RegExp('^'+crops[j] + '$', "g"))

            //Check the crops in alphabetical order
            cy.get('tr').eq(j+3).find('td').first().should('have.text', crops[j])
            if(crops[j].includes('-')){
                cy.get('tr').eq(j+3).find('td').eq(1).should('have.text', crops[j].split(' ')[2])
            }else{
                cy.get('tr').eq(j+3).find('td').eq(1).should('have.text', '')
            }
        }


        // check table entries against inputs.crop_values
        // let count = 0
        // for (let j = 0; j < crops.length; j++) {
        //     for (let i = 1; i < 4; i++) {
        //         cy.get('td').contains(crops[j]).siblings().eq(i).should('have.text', inputs.crop_values[count++])
        //     }

        //     //Make sure upper limits are set to "No limit on all cards except the second to last one
        //     if (j == crops.length - 2) {
        //         cy.get('td').contains(crops[j]).siblings().eq(4).should('have.text', inputs.crop_values_upperlimit[inputs.crop_values_upperlimit.length - 1])
        //     } else {
        //         cy.get('td').contains(crops[j]).siblings().eq(4).should('have.text', 'No Limit')
        //     }
        // }
    })

    //only run this test is all previous tests have been run
    it.skip("Check Model Run Inputs", function () {

        //For testing the test: this line takes us straight to the already built model for faster testing. Only use 
        //if the test model is already built. otherwise, run the code block after the next line.
        // cy.visit("/#/model-run/21")

        cy.get('.v-stepper__label').eq(2).click()
        cy.get('label').contains('Model Run Name').siblings().type('test')
        cy.get('.v-btn__content').contains("Run Model").click()
        cy.get('.v-btn__content').contains("Go to Model Run").click()


        //Crop checks====================================
        //Make sure removed crop is not in table
        cy.get('span.crop_name').contains(inputs.removed_crops[0]).should('not.exist')

        //combine the prepopulated_crops and added_crops then alphabatize them
        let crops = inputs.prepopulated_crops.concat(inputs.added_crops)
        crops.sort()
        count = 0
        for (let j = 0; j < crops.length; j++) {
            for (let i = 1; i < 4; i++) {
                cy.get('span.crop_name').contains(crops[j]).parent().siblings().eq(i).should('have.text', (inputs.crop_values[count++])/100)
            }

            //Make sure upper limits are set to "No limit on all cards except the second to last one
            if (j == crops.length - 2) {
                cy.get('span.crop_name').contains(crops[j]).parent().siblings().eq(4).should('have.text', (inputs.crop_values_upperlimit[inputs.crop_values_upperlimit.length - 1])/100)
            } else {
                cy.get('span.crop_name').contains(crops[j]).parent().siblings().eq(4).should('have.text', 'No Limit')
            }
        }
    })

    //it.skip this last test if you do not want the test models deleted
    it.skip("Delete Model Run", function () {
        cy.wait(1000)
        cy.get('span[id="sc_delete_placeholder"]').click()
        cy.wait(1000)
        cy.get('span[id="sc_delete_placeholder"]').click()
    })
})