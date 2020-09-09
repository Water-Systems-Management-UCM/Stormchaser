import Vue from 'vue'
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        regions: [],
        model_runs: {},
        user_information: {},
        // values that will come from Django in some way
        user_api_token: null,
        api_server_url: "//" + window.location.host,  // Need to change this when we move to the web - CSV download wasn't appropriately getting proxied because it linked out of the current page
        api_url_login: "//" + window.location.host + "/api-token-auth/",
        api_url_variables: "//" + window.location.host + "/application-variables/",  // this will need to change later too
        api_url_model_runs: null,
        api_url_regions: null,
        organization_id: 1,
        calibration_set_id: 1
    },
    getters: {
        basic_auth_headers: (state) => {
            let headers = new Headers();
            headers.append("Authorization", `Token ${state.user_api_token}`);
            headers.append('Content-Type', 'application/json');
            return headers;
        }
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
            state.model_runs[payload.id] = payload;
        },
        set_application_variables (state, payload){
            console.log(payload)
            state.user_api_token = payload.user_api_token;
            state.api_url_model_runs = payload.api_url_model_runs;
            state.api_url_regions = payload.api_url_regions;
            console.log(state.user_api_token)
        },
        set_user_information(state, payload){
            state.user_information = payload;
        },
        set_api_token(state, payload){
            state.user_api_token = payload;
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
            fetch(context.state.api_url_model_runs, {
                headers: context.getters.basic_auth_headers
            })
                .then(response => response.json())
                .then(data => context.dispatch("set_model_runs", data));
        },
        update_model_run: async function(context, model_run_id){ // get the model run and any associated results
            console.log(`Updating model run and results for model run ${model_run_id}`);
            await fetch(context.state.api_url_model_runs + model_run_id, {
                headers: context.getters.basic_auth_headers
            })
                .then(response => response.json())
                .then(data => context.commit("set_single_model_run", data));
            return context.state.model_runs[model_run_id];
        },
        get_model_run_with_results: async function(context, model_run_id){ // gets the model run and assures we have results if they exist
            const sleep = (milliseconds) => {
                return new Promise(resolve => setTimeout(resolve, milliseconds))
            }
            let model_run = undefined;
            let check_iterations = 0;
            while (model_run === undefined){ // we might execute this function before model runs are loaded. If so, make this
                // thread sleep a little for a while until that data has been loaded into the application.
                model_run = context.state.model_runs[model_run_id];
                if (model_run === null || model_run === undefined) {
                    await sleep(100);
                }
                check_iterations += 1;
                if (check_iterations > 150){
                    // if we try for more than 15 seconds, break and log an error
                    console.log("Failed to wait for model runs to be initialized - couldn't retrieve model run with ID " + model_run_id + " from application state");
                    break;
                }
            }

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
            fetch(context.state.api_url_regions, {
                    headers: context.getters.basic_auth_headers
                })
                .then(response => response.json())
                .then(data => context.dispatch("set_regions", data));
        },
        application_setup: function(context){
            context.dispatch("fetch_variables");
        },
        fetch_variables: function(context){
            let headers = {};
            if(context.state.user_api_token){ // if we have a token, use the token headers instead - checking this should let cookie auth for admins bypass login too
                headers = context.getters.basic_auth_headers;
            }
            fetch(context.state.api_url_variables, {
                headers: headers
            })
                .then(response => response.json())
                .then(data => context.commit("set_application_variables", data), () => {console.log("Failed during loading application variables")})
                .then(() => {context.dispatch("fetch_regions").catch(console.log("Failed to load regions"))})
                .then(() => {context.dispatch("fetch_model_runs").catch(console.log("Failed to load model runs"))})
                .catch(() => {console.log("Failed during loading")})
        },
        do_login: function(context, data){
            // This login workflow could be reduced to fewer requests and should be tested across the wire - it needs
            // two to three sets of synchronous requests to get everything set up right now, but could probably be
            // collapsed to one or two - we could have a login paramter to return all the application data optionally if
            // we wanted to skip the roundtrips. Not a priority at the moment
            let username = data.username;
            let password = data.password;

            let login_data = `
                {
                "username": "${username}",
                "password": "${password}"
                }
            `;

            let headers = {
                "Content-type": "application/json"
            };

            // in here, we mostly just handle success and basic failure modes - we don't notify the user that anything failed
            // - that should be handled by the caller, but we return the promise so they can add things onto the promise chain
            // we'll set or clear the token based on whether this call succeeds though, and then reload application variables
            // if the login was successful
            return fetch(context.state.api_url_login, {
                method: 'POST',
                headers: headers,
                body: login_data,
                credentials: 'omit' // we want this because otherwise, if they logged into the admin interface, it'll send an invalid CSRF token and Django will choke on it
            })
                .then((response) => {
                    return response.json().then(
                        function(login_data){
                            if("token" in login_data){
                                context.commit("set_api_token", login_data.token)
                                context.dispatch("fetch_variables");  // get the application data then - currently will fill in the token *again*
                                context.commit("user_information", login_data);
                            }
                            return login_data;
                        }
                    );
                })
                .catch(() => {
                    // context.commit("set_api_token", null);  // if we have any kind of error, null the token
                    console.error("Login or application setup failed for unknown reason");
                });
        }
    }
});