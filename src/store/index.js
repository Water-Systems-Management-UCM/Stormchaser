import Vue from 'vue'
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        regions: [],
        model_runs: [],
        // values that will come from Django in some way
        user_api_token: null,
        api_server_url: "http://localhost:8000",  // Need to change this when we move to the web - CSV download wasn't appropriately getting proxied because it linked out of the current page
        api_url_variables: "http://localhost:8080/application-variables",  // this will need to change later too
        api_url_model_runs: null,
        api_url_regions: null,
        organization_id: 1,
        calibration_set_id: 1
    },
    getters: {
    },
    mutations: {
        set_regions (state, payload){
            console.log(payload)
            state.regions = payload
        },
        set_model_runs (state, payload){
            console.log(payload)
            state.model_runs = payload
        },
        set_single_model_run(state, payload){
            console.log("Updating data for model run " + payload.id);
            state.model_runs[payload.id] = payload;
        },
        append_model_run(state, payload){
            console.log("Appending Model Run")
            state.model_runs.push(payload);
        },
        set_application_variables (state, payload){
            console.log("Yo")
            console.log(payload)
            state.user_api_token = payload.user_api_token;
            state.api_url_model_runs = payload.api_url_model_runs;
            state.api_url_regions = payload.api_url_regions;
            console.log(state.user_api_token)
        }
    },
    actions: {
        set_model_runs: function(context, data){
            // sets defaults for the application for each model_runs
            let model_runs_by_id = {};
            data.results.forEach(function(model_run){
               model_runs_by_id[model_run.id] = model_run
            });

            context.commit("set_model_runs", model_runs_by_id);
        },
        fetch_model_runs: function(context){
            console.log("Fetching Model Runs")
            console.log(context.state.api_url_model_runs)
            fetch(context.state.api_url_model_runs)
                .then(response => response.json())
                .then(data => context.dispatch("set_model_runs", data));
        },
        update_model_run: async function(context, model_run_id){ // get the model run and any associated results
            console.log(`Updating model run and results for model run ${model_run_id}`);
            await fetch(context.state.api_url_model_runs + "/" + model_run_id)
                .then(response => response.json())
                .then(data => context.commit("set_single_model_run", data));
            return context.state.model_runs[model_run_id];
        },
        get_model_run_with_results: async function(context, model_run_id){ // gets the model run and assures we have results if they exist
           let model_run = context.state.model_runs[model_run_id];
            if (model_run.results === null || model_run.results === undefined){
                console.log("Fetching model run update and any results");
                model_run = await context.dispatch("update_model_run", model_run.id);
            }
            return model_run;
         },
        set_regions: function(context, data){
            // sets defaults for the application for each region
            data.results.forEach(function(region, index){
                data.results[index].active = false;
                data.results[index].water_proportion = 100;
                data.results[index].land_proportion = 100;
            })
            context.commit("set_regions", data.results);
        },
        fetch_regions: function(context){
            console.log("Fetching Regions")
            console.log(context.state.api_url_regions)
            fetch(context.state.api_url_regions)
                .then(response => response.json())
                .then(data => context.dispatch("set_regions", data));
        },
        fetch_variables: function(context){
            fetch(context.state.api_url_variables)
                .then(response => response.json())
                .then(data => context.commit("set_application_variables", data), () => {console.log("Failed during loading application variables")})
                .then(() => {context.dispatch("fetch_regions").catch(console.log("Failed to load regions"))})
                .then(() => {context.dispatch("fetch_model_runs").catch(console.log("Failed to load model runs"))})
                .catch(() => {console.log("Failed during loading")})
        },
    }
});