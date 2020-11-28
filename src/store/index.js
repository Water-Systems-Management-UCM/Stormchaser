import Vue from 'vue'
import Vuex from "vuex";

Vue.use(Vuex);

const variable_defaults = {
    // this is mostly defunct as we've moved this functionality into the MakeModelRun code - leaving this object for now
    // - it can be removed gracefully at some point if we decide we don't have a need to attach information to global
    // objects on application load

        // set defaults for modification values on items we'll pull from the API - defining them here will let us reset things
    // after making a model run too. Adding a new variable currently requires a consistent name across the API URL name
    // here in the application, the defaults key in this object, and the state array (eg, they all use "crops"). Then,
    // need to make sure that the application variables setup includes setting the URL, and that the application loading
    // code triggers something like context.dispatch("fetch_application_data", {variable: "crops"})
    regions: {
    },
    crops: {
    },
    users: {}
}

const getDefaultModelAreaState = () => {
    return {
        calibration_data: [],

        regions: {},  // regions by ID
        region_set: [],  // regions as a list from the API

        crops: {},  // crops by ID
        crop_set: [],  // crops as a list from the API

        model_runs: {},
        base_model_run: {},

        map_center_latitude: 0,
        map_center_longitude: 0,
        map_default_zoom: 9,
        name: "",
        description: "",
    }
}

const getDefaultState = () => {
    // we set this here instead of below so that we can use this to clear the state on logout
    return {
        model_areas: {},

        // these items are in the process of moving into model areas - they're here so I can get my ducks in a row first
        model_runs: {},
        base_model_run: {},

        user_information: {},
        users: {}, // Other user accounts, keyed by ID

        // values that will come from Django in some way
        user_api_token: "",
        api_server_url: "//" + window.location.host,  // Need to change this when we move to the web - CSV download wasn't appropriately getting proxied because it linked out of the current page
        api_url_login: "//" + window.location.host + "/api-token-auth/",
        api_url_variables: "//" + window.location.host + "/application-variables/",  // this will need to change later too
        api_url_model_areas: null,
        api_url_model_runs: null,
        api_url_users: null,
        api_url_regions: null,
        organization_id: null,
        model_area_id: null,
        calibration_set_id: null,
    }
}



export default new Vuex.Store({
    state: getDefaultState(),
    getters: {
        basic_auth_headers: state => {
            let headers = new Headers();
            headers.append("Authorization", `Token ${state.user_api_token}`);
            headers.append('Content-Type', 'application/json');
            return headers;
        },
        current_model_area: state => {
            return state.model_areas[state.model_area_id]
        },
        get_region_name_by_id: (state, getters) => (id) => {
            if (id === null){
                return "All Regions";
            }
            return getters.current_model_area.regions[id].name
        },
        get_crop_name_by_id:  (state, getters) => (id) => { // I pulled a copy of this code from the ModelRun code - it should be a getter in the Vuex store instead
            if (id === null){
                return "All Crops";
            }
            return getters.current_model_area.crops[id].name
        },
        app_is_loaded: (state) => {
            let current_model_area = state.model_areas[state.model_area_id]
            // check if the current model area has been defined, if it has a regions array, and if that regions array has items in it as a proxy for loading core data
            return current_model_area !== undefined && "region_set" in current_model_area && "crop_set" in current_model_area && current_model_area.region_set.length > 0 && current_model_area.crop_set.length > 0

        }
    },
    mutations: {
        set_model_runs (state, payload){
            Vue.set(state.model_areas[payload.area_id], "model_runs", payload.model_runs);
        },
        set_model_areas (state, payload){
            for(let i=0; i < payload.length; i++){
                Object.assign(payload[i], getDefaultModelAreaState());  // merge in the default model area info
                Vue.set(state.model_areas, payload[i].id, payload[i])  // then store as an object indexed by model area ID using Vue's setter so the value is updated reactively
            }
        },
        set_full_model_area(state, payload){

            Object.keys(payload.data).forEach(function(key){
                Vue.set(state.model_areas[payload.area_id], key, payload.data[key]);
            });
            //Object.assign(, payload.data)

            // Now index the regions and crops into objects by their IDs
            state.model_areas[payload.area_id].crop_set.forEach(function(crop){
                Vue.set(state.model_areas[payload.area_id].crops, crop.id, crop);
            })
            state.model_areas[payload.area_id].region_set.forEach(function(region){
                Vue.set(state.model_areas[payload.area_id].regions, region.id, region);
            })

        },
        set_base_model_run(state, payload){
            Vue.set(state.model_areas[payload.area_id], "base_model_run", payload.model_run);
        },
        set_single_model_run(state, payload){
            console.log("Updating data for model run " + payload.run.id);
            Vue.set(state.model_areas[payload.area_id].model_runs, payload.run.id, payload.run);
        },
        set_application_variables (state, payload){
            console.log(payload)
            // copy the main API urls into the application so we know where to find everything, but the back end can tell
            // us about it when the API changes. We should probably do this a better way
            state.user_api_token = payload.user_api_token;
            state.api_url_model_runs = payload.api_url_model_runs;
            state.api_url_regions = payload.api_url_regions;
            state.api_url_crops = payload.api_url_crops;
            state.api_url_users = payload.api_url_users;
            state.api_url_model_areas = payload.api_url_model_areas;
            state.model_area_id = payload.model_area_id;
            state.organization_id = payload.organization_id;
            state.calibration_set_id = payload.calibration_set_id;
            console.log(state.user_api_token)
        },
        set_user_information(state, payload){
            state.user_information = payload;
        },
        set_users(state, payload){
            state.users = payload
        },
        set_api_token(state, payload){
            state.user_api_token = payload;
            let session_data = window.sessionStorage;
            session_data.setItem("waterspout_token", payload);  // set it into session storage
        },
        reset_state: function(state){
            // See https://stackoverflow.com/questions/42295340/how-to-clear-state-in-vuex-store
            // We assign it this way so that the values get merged and listeners get updated instead of overwriting everything
            Object.assign(state, getDefaultState())
        },
    },
    actions: {
        delete_model_run: function(context, data){
            // attempts to delete the model run and returns the promise - up to the caller to handle error display
            let url = `${context.state.api_url_model_runs}${data.id}/`;
            return fetch(url, {
                headers: context.getters.basic_auth_headers,
                method: "DELETE"
            })
                .then(response => {
                    if (response.ok){
                        console.log("Success, removing")
                        delete context.state.model_runs[data.id];  // remove the item from the list of model runs we have
                    }
                    return response;
                })
        },
        set_model_runs: function(context, data){
            // sets defaults for the application for each model_runs
            let model_runs_by_id = {};
            // .results is because it comes back from the server as an array keyed as "results" in the object
            data.model_runs.results.forEach(function(model_run){
                model_runs_by_id[model_run.id] = model_run
                if (model_run.is_base === true){  // if we find the base model run
                    context.commit("set_base_model_run", {
                        area_id: context.getters.current_model_area.id,
                        model_run: model_run
                    })  // then set it
                    context.dispatch("update_model_run", model_run.id);  // force a detail view load of this model run so we get base results
                }
            });

            context.commit("set_model_runs", {
                area_id: context.getters.current_model_area.id,
                model_runs: model_runs_by_id
            });
        },
        fetch_model_runs: function(context){

            console.log("Fetching Model Runs")
            console.log(context.state.api_url_model_runs)
            fetch(context.state.api_url_model_runs, {
                headers: context.getters.basic_auth_headers
            })
                .then(response => response.json())
                .then(data => context.dispatch("set_model_runs", {
                    area_id: context.getters.current_model_area.id,
                    model_runs: data
                }));
        },
        update_model_run: async function(context, model_run_id){ // get the model run and any associated results
            console.log(`Updating model run and results for model run ${model_run_id}`);
            await fetch(`${context.state.api_url_model_runs}${model_run_id}/`, {
                headers: context.getters.basic_auth_headers
            })
                .then(response => response.json())
                .then(data => context.commit("set_single_model_run", {
                    area_id: context.getters.current_model_area.id,
                    run: data
                }));
            return context.getters.current_model_area.model_runs[model_run_id];
        },
        get_model_run_with_results: async function(context, model_run_id){ // gets the model run and assures we have results if they exist
            const sleep = (milliseconds) => {
                return new Promise(resolve => setTimeout(resolve, milliseconds))
            }
            let model_run = undefined;
            let check_iterations = 0;

            while(!context.getters.app_is_loaded){ // if the app isn't loaded don't fuss with everything below yet
                await sleep(100);
            }

            while (model_run === undefined){ // we might execute this function before model runs are loaded. If so, make this
                // thread sleep a little for a while until that data has been loaded into the application.
                model_run = context.getters.current_model_area.model_runs[model_run_id];
                if (model_run === null || model_run === undefined) {
                    await sleep(100);
                }
                check_iterations += 1;
                if (check_iterations > 100){
                    // if we try for more than 10 seconds, break and log an error
                    console.log("Failed to wait for model runs to be initialized - couldn't retrieve model run with ID " + model_run_id + " from application state");
                    break;
                }
            }

           if (!("results" in model_run) || model_run.results === null || model_run.results === undefined){
                console.log("Fetching model run update and any results");
                model_run = await context.dispatch("update_model_run", model_run.id);
            }
            return model_run;
         },
        fetch_application_data: function(context, data){
            console.log("Fetching " + data.variable)
            let api_url = context.state["api_url_" + data.variable];
            console.log(api_url)
            fetch(api_url, {
                headers: context.getters.basic_auth_headers
            })
                .then(response => response.json())
                .then((result_data) => {
                    result_data.variable = data.variable // make sure we know which item we're working on
                    result_data.lookup_table = data.lookup_table // pass the flag indicating whether it should be a list or a lookup
                    context.dispatch("set_application_data", result_data)
                });
        },
        set_application_data: function(context, data){
            let defaults = variable_defaults[data.variable];

            // sets defaults for the application for each item - there's probably a better way to do this than a nested
            // forEach (a map?), but whatever - this is fine for now
            data.results.forEach(function(item, index){ // for every resulting item
                Object.keys(defaults).forEach(function(name){ // set every single default on it configured for this variable
                    data.results[index][name] = defaults[name];  // look up the default value by name and apply it here with the same name
                })
            })

            if (data.lookup_table === true) { // if we should convert it to a lookup table
                let lookup = {}
                data.results.forEach(function(item){
                    lookup[item.id] = item
                })
                data.results = lookup
            }
            context.commit("set_" + data.variable, data.results);
        },
        application_setup: function(context){
            context.dispatch("fetch_variables");
        },
        fetch_model_areas: function(context){

            fetch(context.state.api_url_model_areas, {
                headers: context.getters.basic_auth_headers
            })
                .then(response => response.json())
                .then((result_data) => {
                    context.commit("set_model_areas", result_data.results)
                });

        },
        fetch_full_model_area: function(context, params){
            fetch(context.state.api_url_model_areas + params.area_id + "/", {
                headers: context.getters.basic_auth_headers
            })
                .then(response => response.json())
                .then((result_data) => {
                    context.commit("set_full_model_area", {"area_id": params.area_id, "data": result_data})
                });

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
                .then(data => {
                    if("detail" in data && data.detail === "Invalid token."){
                        context.dispatch("do_logout");
                        throw(new Error("Token is invalid. Logging out"));
                    }
                    context.commit("set_application_variables", data)
                }, () => {console.log("Failed during loading application variables")})

                .then(() => {context.dispatch("fetch_model_areas").catch(console.log("Failed to load model areas"))})
                .then(() => {context.dispatch("fetch_full_model_area", {area_id: context.state.model_area_id}).catch(console.log("Failed to load full model area"))})
                //.then(() => {context.dispatch("fetch_application_data", {variable: "regions"}).catch(console.log("Failed to load regions"))})
                //.then(() => {context.dispatch("fetch_application_data", {variable: "crops"}).catch(console.log("Failed to load crops"))})
                .then(() => {context.dispatch("fetch_application_data", {variable: "users", lookup_table: true}).catch(console.log("Failed to load users"))})
                .then(() => {context.dispatch("fetch_model_runs").catch(console.log("Failed to load model runs"))})
                .catch(() => {console.error("Failed during loading")})

        },
        do_logout: function(context){
            let session_data = window.sessionStorage;
            session_data.setItem("waterspout_token", "");

            // then clear the stored token
            context.commit("set_api_token", "");

            // then reset the application state so that we don't have any leftovers if someone logs into a new organization
            context.commit("reset_state");
        },
        do_login: function(context, data){
            // This login workflow could be reduced to fewer requests and should be tested across the wire - it needs
            // two to three sets of synchronous requests to get everything set up right now, but could probably be
            // collapsed to one or two - we could have a login parameter to return all the application data optionally if
            // we wanted to skip the roundtrips. Not a priority at the moment

            let login_data = `
                {
                "username": "${data.username}",
                "password": "${data.password}"
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
                         function(response_data){
                            if("token" in response_data) {
                                let token = response_data.token;
                                // sometimes we get a result back for the token field, but it's not a valid token - so
                                // check the token before we assume it's good
                                if (token !== "" && token !== "null" || token !== null){
                                    context.commit("set_api_token", response_data.token);
                                    context.dispatch("fetch_variables");  // get the application data then - currently will fill in the token *again*
                                    context.commit("user_information", login_data);

                                }else{
                                    console.error("Received bad token - [" + token + "]");
                                }
                            }
                            return response_data;
                        }
                    );
                })
                .catch(() => {
                    // context.commit("set_api_token", null);  // if we have any kind of error, null the token
                    console.error("Login or application setup failed for unknown reason");
                    context.dispatch("do_logout")  // even though we're logged out, technically, we should do it again since we don't know where the failure occurred - reset to a known state
                });
        }
    }
});