import Vue from 'vue'
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        regions: [],
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

        set_regions: function(context, data){
            // sets defaults for the application for each region
            data.results.forEach(function(region, index){
                data.results[index].active = false;
                data.results[index].water_proportion = 100;
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
                .then(() => {context.dispatch("fetch_regions")}, console.log("Failed to load regions"))
                .catch(() => {console.log("Failed during loading")})
        },
    }
});