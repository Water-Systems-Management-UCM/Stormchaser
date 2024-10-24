import Vue from 'vue';
import Vuex from "vuex";

import docs_urls from '/src/store/documentation_urls.js'
import terms from '/src/store/terms.js'

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
    users: {},
    user_profile: {},
};

const getDefaultModelAreaState = () => {
    return {
        calibration_data: [],
        price_yield_corrections: {},  // we'll populate these after loading the model area state

        regions: {},  // regions by ID
        region_set: [],  // regions as a list from the API
        region_group_sets: [], // region group sets - each one has its own set of groups. E.g. a set would be "Delta Water Agencies"
        region_groups: {}, // region_groups by ID with references to their region_group_set

        multipliers_raw: [],  // raw from the API
        multipliers: {}, // will be indexed by region, then by crop. I really need to switch a lot of this to IndexedDB. Deadline today!

        crops: {},  // crops by ID
        crop_set: [],  // crops as a list from the API

        model_runs: {},
        model_defaults: {},
        base_model_run: {},
        base_case_results_id: 0,  // for when the base case has multiple result sets - stores the index of the result set to use

        map_center_latitude: 0,
        map_center_longitude: 0,
        map_default_zoom: 9,
        name: "",
        description: "",

        preferences: {
            enforce_price_yield_constraints: true,  // should the application check prices and yields when modifying crops?
        },

    };
};

const getDefaultState = () => {
    // we set this here instead of below so that we can use this to clear the state on logout
    return {
        model_areas: {},
        user_profile: {
            show_organization_model_runs: true,
            dense_tables: true,
        }, // user settings

        // these items are in the process of moving into model areas - they're here so I can get my ducks in a row first
        model_runs: {},
        base_model_run: {},

        user_information: {},
        users: {}, // Other user accounts, keyed by ID

        urls: {},

        // values that will come from Django in some way
        user_api_token: "",
        api_server_url: "//" + window.location.host,  // Need to change this when we move to the web - CSV download wasn't appropriately getting proxied because it linked out of the current page
        api_url_login: "//" + window.location.host + "/api-token-auth/",
        api_url_variables: "//" + window.location.host + "/application-variables/",  // this will need to change later too
        api_url_model_areas: null,
        api_url_user_profile: null,
        api_url_model_runs: null,
        api_url_users: null,
        api_url_regions: null,
        organization_id: null,
        model_area_id: null,
        calibration_set_id: null,

        app_notice_snackbar: false,
        app_notice_snackbar_text: "",
        app_notice_snackbar_timeout: -1,

        docs_urls: docs_urls.docs_urls,
        terms: terms,
    };
};



export default new Vuex.Store({
    state: getDefaultState(),
    getters: {
        base_case_results: state => {
            // get the results data for the selected base case
            let current_model_area = state.model_areas[state.model_area_id];
            return current_model_area.model_runs[current_model_area.base_model_run.id].results[current_model_area.base_case_results_id].result_set;
        },
        basic_auth_headers: state => {
            let headers = new Headers();
            headers.append("Authorization", `Token ${state.user_api_token}`);
            headers.append('Content-Type', 'application/json');
            return headers;
        },
        current_model_area: state => {
            return state.model_areas[state.model_area_id];
        },
        net_revenue_enabled: (state, getters) => {
            return getters.current_model_area.preferences.include_net_revenue && getters.user_settings("show_net_revenues")
        },
        get_region_name_by_id: (state, getters) => (id) => {
            if (id === null){
                return "All Regions";
            }
            return getters.current_model_area.regions[id].name;
        },
        get_region_group_name_by_id: (state, getters) => (id) => {
            return getters.current_model_area.region_groups[id].name;
        },
        get_region_code_by_id: (state, getters) => (id) => {
            if (id === null){
                return "All Regions";
            }
            return getters.current_model_area.regions[id].internal_id;
        },
        get_crop_name_by_id:  (state, getters) => (id) => { // I pulled a copy of this code from the ModelRun code - it should be a getter in the Vuex store instead
            if (id === null){
                return "All Crops";
            }
            return getters.current_model_area.crops[id].name;
        },
        app_is_loaded: (state) => {
            let current_model_area = state.model_areas[state.model_area_id];
            // check if the current model area has been defined, if it has a regions array, and if that regions array has items in it as a proxy for loading core data
            return current_model_area !== undefined && "region_set" in current_model_area && "crop_set" in current_model_area && current_model_area.region_set.length > 0 && current_model_area.crop_set.length > 0
        },
        user_settings: (state) => (key) => {
            return state.user_profile[key]
        },
        region_modeling_types: (state, getters) => {
            for (let region in getters.current_model_area.regions) {
                // we loop, but we are doing this just to get the first region since it'll have the properties we need
                // we'll also just return the whole first region and the users can check the various modeling types from there
                return getters.current_model_area.regions[region];
            }
        }
    },
    mutations: {
        change_model_area(state, payload){
            Vue.set(state, "model_area_id", payload.id);
            this.dispatch("fetch_full_model_area", {area_id: payload.id})
                .then(() => {this.dispatch("fetch_application_data", {variable: "users", lookup_table: true}).catch(console.log("Failed to load users"))})
                .then(() => {this.dispatch("fetch_model_runs").catch(console.log("Failed to load model runs"))});
        },
        close_app_notice_snackbar(state){
            Vue.set(state, "app_notice_snackbar", false);
            Vue.set(state, "app_notice_snackbar_text", "");
            Vue.set(state, "app_notice_snackbar_timeout", -1);
        },
        app_notice(state, payload){
            /* Opens the application-wide error snackbar and sets the message */
            let message = payload.message;
            let send_to_log = payload.send_to_log ? payload.send_to_log : true;
            let timeout = payload.timeout ? payload.timeout : -1;

            Vue.set(state, "app_notice_snackbar_text", message);
            Vue.set(state, "app_notice_snackbar_timeout", timeout);
            Vue.set(state, "app_notice_snackbar", true);

            if(send_to_log){
                console.error(message);
            }
        },
        set_model_runs (state, payload){
            Vue.set(state.model_areas[payload.area_id], "model_runs", payload.model_runs);
        },
        set_model_areas (state, payload){
            for(let i=0; i < payload.length; i++) {
                let model_area = getDefaultModelAreaState();
                Object.assign(model_area, payload[i]);  // merge new data into the default model area info so we have all keys
                Vue.set(state.model_areas, payload[i].id, model_area);  // then store as an object indexed by model area ID using Vue's setter so the value is updated reactively
            }

            if(payload.length === 1){  // if we only have one model area, set it to be the current one
                Vue.set(state, 'model_area_id', payload[0].id)
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
            });
            state.model_areas[payload.area_id].region_set.forEach(function(region){
                Vue.set(state.model_areas[payload.area_id].regions, region.id, region);
            });
            state.model_areas[payload.area_id].region_group_sets.forEach(function(region_group_set){
                region_group_set.groups.forEach(function(region_group){
                    region_group["region_group_set"] = region_group_set;
                    Vue.set(state.model_areas[payload.area_id].region_groups, region_group.id, region_group);
                })
            });

            state.model_areas[payload.area_id].multipliers_raw.forEach(function(multiplier){
                if(!(multiplier.region in state.model_areas[payload.area_id].multipliers)){
                    state.model_areas[payload.area_id].multipliers[multiplier.region] = {}
                }  // make sure that we have an object for the region first

                // then set it with the region as the first key and the crop as the second
                state.model_areas[payload.area_id].multipliers[multiplier.region][multiplier.crop] = multiplier
            })

            // once we set the model area up in a basic form, set its price/yield correction lookup
            /* {default: 0.95,  // encompasses all values - we won't be able to adjust the all crops card very far without creating region cards
                    1 { default: 0.91, // keyed by crop ids, with a default value for that crop that encompasses all regions
                              1: 0.90,  // keyed by region ids
                              2: 0.84
                             }
                  }
              */
            let calibration_data = state.model_areas[payload.area_id].calibration_data[0].calibration_set;

            let price_yield_correction_data = {default: 0}
            //let crops = []
            // let's only go through this once; we'll loop through and first assign to an array of values for the default
            // item and the specific crop while also assigning to each specific crop/region combo.

            calibration_data.forEach(function (item) {
                let value = parseFloat(item.price_yield_correction_factor)  // can come through as a string

                price_yield_correction_data.default = Math.max(price_yield_correction_data.default, value)  // keep either the old or the new item, depending which is larger

                if (item.crop in price_yield_correction_data) {  // if we've seen the crop before, push to the array
                    // we want to store the highest value for the crop in any region as its default

                    if(payload.getters.current_model_area.preferences.enforce_price_yield_constraints === true){
                        price_yield_correction_data[item.crop].default = Math.max(price_yield_correction_data[item.crop].default, value)
                    }else{
                        price_yield_correction_data[item.crop].default = 0  // this is just a fast way to disable the check - it'll never end up below zero, so everything is always fine
                                                                            // if we ever use this outside of debugging, then we should check the preference when making model runs to
                                                                            // improve performance
                    }

                    price_yield_correction_data[item.crop].crop_id = item.crop  // set the ID internally so we can do things like filter the parent object on values
                } else {
                    price_yield_correction_data[item.crop] = {default: value}  // otherwise, create the object and array for the crop
                }
                price_yield_correction_data[item.crop][item.region] = value // and set the crop/region value in all cases after checking the crop exists
            })

            Vue.set(state.model_areas[payload.area_id], "price_yield_corrections", price_yield_correction_data)

        },
        set_base_model_run(state, payload){
            Vue.set(state.model_areas[payload.area_id], "base_model_run", payload.model_run);
        },
        set_single_model_run(state, payload){
            console.log("Updating data for model run " + payload.run.id);
            Vue.set(state.model_areas[payload.area_id].model_runs, payload.run.id, payload.run);
        },
        set_application_variables (state, payload){
            // new way - old way is below - set any API URL in the result into a corresponding key in the URLs portion of the state
            Object.keys(payload).forEach(function(url_key){
                Vue.set(state.urls, url_key, payload[url_key]);
            });

            console.log(payload);
            // copy the main API urls into the application so we know where to find everything, but the back end can tell
            // us about it when the API changes. We should probably do this a better way
            state.user_api_token = payload.user_api_token;
            state.api_url_model_runs = payload.api_url_model_runs;
            state.api_url_regions = payload.api_url_regions;
            state.api_url_crops = payload.api_url_crops;
            state.api_url_users = payload.api_url_users;
            state.api_url_model_areas = payload.api_url_model_areas;
            // state.model_area_id = payload.model_area_id;   // commented out because we now handle this later - we set it automatically if we only have 1 model area or prompt the user if there are multiple - this could be nice later if we change to allowing users to set a default
            state.organization_id = payload.organization_id;
            state.calibration_set_id = payload.calibration_set_id;
            console.log(state.user_api_token);
        },
        set_user_information(state, payload){
            Vue.set(state, "user_information", payload);
        },
        set_user_profile(state, payload){
            // set each subitem individually to make sure they're reactive and respond to updates
            Object.keys(payload).forEach(function(key){
                Vue.set(state.user_profile,key, payload[key]);
            });
        },
        set_users(state, payload){
            state.users = payload;
        },
        set_api_token(state, payload){
            state.user_api_token = payload;
            let session_data = window.sessionStorage;
            session_data.setItem("waterspout_token", payload);  // set it into session storage
        },
        reset_state: function(state){
            // See https://stackoverflow.com/questions/42295340/how-to-clear-state-in-vuex-store
            // We assign it this way so that the values get merged and listeners get updated instead of overwriting everything
            Object.assign(state, getDefaultState());
        },
    },
    actions: {
        check_region_modification_type(context, data) {
            // check that the modeled type ID matches the modeling type indicated by name in check_type
            return data.modeled_type === context.getters.region_modeling_types[data.check_type]
        },
        delete_model_run: function(context, data){
            // attempts to delete the model run and returns the promise - up to the caller to handle error display
            let url = `${context.state.api_url_model_runs}${data.id}/`;
            return fetch(url, {
                headers: context.getters.basic_auth_headers,
                method: "DELETE"
            })
                .then(response => {
                    if (response.ok){
                        console.log("Success, removing");
                        delete context.state.model_runs[data.id];  // remove the item from the list of model runs we have
                    }
                    return response;
                });
        },
        set_model_runs: function(context, data){
            // sets defaults for the application for each model_runs
            let model_runs_by_id = {};
            // .results is because it comes back from the server as an array keyed as "results" in the object
            data.model_runs.forEach(function(model_run){
                model_runs_by_id[model_run.id] = model_run;
                if (model_run.is_base === true){  // if we find the base model run
                    context.commit("set_base_model_run", {
                        area_id: data.area_id,
                        model_run: model_run
                    });  // then set it
                    context.dispatch("update_model_run", model_run.id);  // force a detail view load of this model run so we get base results
                }
            });

            context.commit("set_model_runs", {
                area_id: data.area_id,
                model_runs: model_runs_by_id
            });
        },
        fetch_all_model_runs: function(context){
            /* fetches all model runs a user has access to, regardless of which model area it's in (not really what we want anymore) */
            console.log("Fetching Model Runs");
            console.log(context.state.api_url_model_runs);
            fetch(context.state.api_url_model_runs, {
                headers: context.getters.basic_auth_headers
            })
                .then(response => response.json())
                .then(data => context.dispatch("set_model_runs", {
                    area_id: context.getters.current_model_area.id,
                    model_runs: data
                }));
        },
        fetch_model_runs: function(context){
            if(context.state.model_area_id === null){  // don't send bogus requests to the server - if we don't have a model area yet, skip it
                return
            }

            /* fetches all model runs a user has access to, regardless of which model area it's in (not really what we want anymore) */
            console.log("Fetching Model Runs")
            fetch(`${context.state.api_url_model_areas}${context.state.model_area_id}/model_runs`, {
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
                .then(function(response){
                    if (response.ok){
                        return response
                    } else {
                        context.commit("app_notice", {message: "Failed to retrieve model run - this is likely a permissions error. Received response " + response.status})
                        throw new Error("Failed to retrieve model run")
                    }
                })
                .then(response => response.json())
                .then(data => context.commit("set_single_model_run", {
                    area_id: context.getters.current_model_area.id,
                    run: data
                }));
            return context.getters.current_model_area.model_runs[model_run_id];
        },
        get_model_run_with_results: async function(context, model_run_id){ // gets the model run and assures we have results if they exist
            console.log(model_run_id)
            const sleep = (milliseconds) => {
                return new Promise(resolve => setTimeout(resolve, milliseconds));
            };
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
                if (check_iterations > 200){
                    // if we try for more than 10 seconds, break and log an error
                    console.log("Failed to wait for model runs to be initialized - couldn't retrieve model run with ID " + model_run_id + " from application state");
                    break;
                }
            }

           if (model_run.complete === false || !("results" in model_run) || model_run.results === null || model_run.results === undefined){
                console.log("Fetching model run update and any results");
                model_run = await context.dispatch("update_model_run", model_run.id);
            }

           return model_run;
         },
        fetch_application_data: function(context, data){
            let use_first = data.use_first ? data.use_first : false;  // whether or not to only use the first object that comes back or a whole array
            console.log("Fetching " + data.variable);
            let api_url = context.state.urls["api_url_" + data.variable];
            console.log(api_url);
            fetch(api_url, {
                headers: context.getters.basic_auth_headers
            })
                .then(response => response.json())
                .then((result_data) => {
                    if(use_first){
                        result_data.results = result_data.results[0]
                    }
                    result_data.use_first = use_first;
                    result_data.variable = data.variable; // make sure we know which item we're working on
                    result_data.lookup_table = data.lookup_table; // pass the flag indicating whether it should be a list or a lookup
                    context.dispatch("set_application_data", result_data);
                });
        },
        set_application_data: function(context, data){
            let defaults = variable_defaults[data.variable];

            // sets defaults for the application for each item - there's probably a better way to do this than a nested
            // forEach, but whatever - this is fine for now
            if(!data.use_first){
                data.results.forEach(function(item, index){ // for every resulting item
                    Object.keys(defaults).forEach(function(name){ // set every single default on it configured for this variable
                        data.results[index][name] = defaults[name];  // look up the default value by name and apply it here with the same name
                    })
                })
            }

            if (data.lookup_table === true) { // if we should convert it to a lookup table
                let lookup = {};
                data.results.forEach(function(item){
                    lookup[item.id] = item;
                })
                data.results = lookup;
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
                    context.commit("set_model_areas", result_data.results);
                });

        },
        fetch_full_model_area: function(context, params){
            if(params.area_id === null){  // don't send bogus requests to the server - if we don't have a model area yet, skip it
                return
            }

            fetch(context.state.api_url_model_areas + params.area_id + "/", {
                headers: context.getters.basic_auth_headers
            })
                .then(response => response.json())
                .then((result_data) => {
                    // TODO we shouldn't actually pass getters in here - it's a bit backward, but the set_full_model_area mutation would need a bigger refactor if we weren't wanting to do that.
                    context.commit("set_full_model_area", {"area_id": params.area_id, "data": result_data, "getters": context.getters});
                })
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
                    context.commit("set_application_variables", data);
                }, () => {console.log("Failed during loading application variables")})
                .then(() => {context.dispatch("fetch_application_data", {variable: "user_profile", use_first: true}).catch(console.log("Failed to load user profile (settings)"))})
                .then(() => {context.dispatch("fetch_model_areas").catch(console.log("Failed to load model areas"))})
                .then(() => {context.commit("change_model_area", {id: context.state.model_area_id}).catch(console.log("Failed to load full model area"))})
                //.then(() => {context.dispatch("fetch_application_data", {variable: "regions"}).catch(console.log("Failed to load regions"))})
                //.then(() => {context.dispatch("fetch_application_data", {variable: "crops"}).catch(console.log("Failed to load crops"))})
                .catch(() => {console.error("Failed during loading")})

        },
        save_user_profile: function(context){

            let headers = context.getters.basic_auth_headers;

            return fetch(context.state.urls.api_url_user_profile + `${context.state.user_profile.id}/`, {
                method: 'PUT',  // this is an update
                headers: headers,
                body: JSON.stringify(context.state.user_profile),
                credentials: 'omit' // we want this because otherwise, if they logged into the admin interface, it'll send an invalid CSRF token and Django will choke on it
            })
                .then((response) => {
                    return response.json().then(
                        function(response_data){
                            let error_key = null;
                            if ("non_field_errors" in response_data) {
                                error_key = "non_field_errors";
                            }else if("detail" in response_data){
                                error_key = "detail";
                            }
                            if(error_key){
                                context.commit("app_notice", {message: "Failed to save settings - server error was: " + response_data[error_key]});
                                console.error(response_data);
                            }else if(response.status !== 200){
                                context.commit("app_notice", {message: "Failed to save settings - server status " + response.status});
                            }else{
                                context.commit("app_notice", {message: "Settings saved", timeout: 5000, send_to_log:false});
                            }
                        }
                    );
                })
                .catch(() => {
                    // context.commit("set_api_token", null);  // if we have any kind of error, null the token
                    console.error("Failed to save user profile");
                    context.commit("app_notice", {message: "Failed to save settings, please try again later"})
                });
        },
       async update_model_run_name_and_description(context, details) {

            console.log("save_text_edit executed")

            let model_run_id = details.id
            let model_run_name = details.name
            let model_run_description = details.description

            let headers = context.getters.basic_auth_headers
            let request_body = context.state.model_areas[context.state.model_area_id].model_runs[model_run_id];
            // let request_body = {id: model_run_id};
            request_body.name = model_run_name
            request_body.description = model_run_description;

            return fetch(context.state.api_url_model_runs + `${model_run_id}/`, {
                method: 'PUT',  // this is an update of the original text
                headers: headers,
                body: JSON.stringify(request_body),
                credentials: 'omit'
            })
                .then(console.log("save_text_edit executed"))
                .then((response) => {


                    return response.json().then(
                        function(response_data){
                            let error_key = null;
                            if ("non_field_errors" in response_data) {
                                error_key = "non_field_errors"
                            }else if("detail" in response_data){
                                error_key = "detail"
                            }
                            if(error_key){
                                context.commit("app_notice", {message: "Failed to save settings - server error was: " + response_data[error_key]})
                                console.error(response_data)
                            }else if(response.status !== 200){
                                context.commit("app_notice", {message: "Failed to save settings - server status " + response.status})
                            }else{
                                context.commit("app_notice", {message: "Model changes saved", timeout: 5000, send_to_log:false})
                            }
                        }
                    );
                })
                .catch(() => {
                    console.error("Failed to edit model information");
                    context.commit("app_notice", {message: "Failed to store model information, please try again later"})
                });
        },
        do_logout: function(context){
            let session_data = window.sessionStorage;
            session_data.setItem("waterspout_token", "");

            // then clear the stored token
            context.commit("set_api_token", "");

            // then reset the application state so that we don't have any leftovers if someone logs into a new organization
            context.commit("reset_state");

            window.stormchaser.$router.push({name: "home"});
        },
        check_and_set_token: function(context, data){
            // sometimes we get a result back for the token field, but it's not a valid token - so
            // check the token before we assume it's good
            let token = data.token
            let user_info = data.user_info
            if (token !== "" && token !== "null" || token !== null){
                context.commit("set_api_token", token);
                context.dispatch("fetch_variables");  // get the application data then - currently will fill in the token *again*
                context.commit("user_information", user_info);

            }else{
                console.error("Received bad token - [" + token + "]");
            }
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
                                context.dispatch("check_and_set_token", {token: response_data.token, user_info: response_data})
                            }
                            return response_data;
                        }
                    );
                })
                .catch(() => {
                    // context.commit("set_api_token", null);  // if we have any kind of error, null the token
                    console.error("Login or application setup failed for unknown reason");
                    context.dispatch("do_logout");  // even though we're logged out, technically, we should do it again since we don't know where the failure occurred - reset to a known state
                });
        }
    }
});