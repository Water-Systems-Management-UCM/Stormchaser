<template>
    <v-layout row >
        <v-flex xs12 md3>
             <!--<v-dialog
                    v-model="dialog"
                    width="500"
            >
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                            color="red lighten-2"
                            dark
                            v-bind="attrs"
                            v-on="on"
                    >
                        Add Region
                    </v-btn>
                </template>

                <h2>Add Region to Make Changes</h2>
                <div>
                    <Region
                            v-for="r in inactiveRegions"
                            v-bind:region="r"
                            v-bind:key="r.id"
                    ></Region>
                </div>
            </v-dialog>-->
            <v-autocomplete
                    v-model="selected_regions"
                    :items="allRegions"
                    item-text="name"
                    clearable
                    deletable-chips
                    chips
                    small-chips
                    label="Add Regions"
                    return-object
                    persisten-hint
                    multiple
                    solo
            ></v-autocomplete>
            <v-flex>
                <Region
                        v-for="r in selected_regions"
                        v-bind:region="r"
                        v-bind:key="r.id"
                        v-on:region-deactivate="deactivate_region"
                ></Region>
            </v-flex>
            <v-btn v-on:click="run_model">Run Model</v-btn>
            <v-btn :href="results_download_url" download v-if="this.last_model_run.id">Download Results</v-btn>
            <v-btn v-if="this.last_model_run.id"><router-link :to="{ name: 'model-run', params: { id: this.last_model_run.id }}">Go to Model Run</router-link></v-btn>
        </v-flex>
        <v-flex xs12 md9>
            Yo, I'm a map
        </v-flex>
    </v-layout>
</template>

<script>
    import Region from "@/components/Region";

    export default {
        components: {
            Region
        },
        name: "MakeModelRun",
        data: function(){
            return {
                selected_regions: [],
                last_model_run: {}
            }
        },
        watch: {
            selected_regions(new_array, old_array){
                // this could be streamlined into a single symmetric difference then just flip the value of .active,
                // but I think the code would be a bit less clear/maintainable. This is fine

                // find the differences
                let added = new_array.filter(x => !old_array.includes(x));
                let removed = old_array.filter(x => !new_array.includes(x));

                // toggle the values
                added.forEach(function(region){
                    region.active = true;
                })
                removed.forEach(function(region){
                    region.active = false;
                })
            },
        },
        methods: {
            deactivate_region: function(){
                console.log("Deactivating");
                this.selected_regions = this.activeRegions;
            },
            activateRegion: function(event){
                console.log(event);
                event.active = !event.active;
            },
            get_header: function() {
                let headers = new Headers();
                headers.append("Authorization", `Token ${this.$store.state.user_api_token}`);
                headers.append('Content-Type', 'application/json');
                return headers;
            },
            set_model_run: function(model_run){
                console.log("1");
                console.log(model_run);
                this.last_model_run = model_run;
                console.log("2");
                console.log(this.last_model_run);
                console.log("3");
                console.log(model_run);
                this.results_download_url = `/model_run/csv/${model_run.id}/`;
                console.log("4");
                console.log(this.results_download_url);
            },
            run_model: function() {
                console.log("Creating Model Run");
                let headers = this.get_header();
                console.log(headers.values());

                let regions = this.activeRegions;
                let scaled_down_regions = [];
                regions.forEach(function (region) {
                    let new_region = {
                        "region": region.id,
                        "water_proportion": region.water_proportion / 100, // API deals in proportions, not percents
                        "land_proportion": region.land_proportion / 100 // API deals in proportions, not percents
                    };
                    scaled_down_regions.push(new_region);
                });

                let body = `{
                                "name": "test",
                                "ready": true,
                                "organization": ${this.$store.state.organization_id},
                                "calibration_set": ${this.$store.state.calibration_set_id},
                                "region_modifications": ${JSON.stringify(scaled_down_regions)}
                            }`;

                console.log(body);
                let this_object = this;
                return fetch(this.$store.state.api_url_model_runs, {
                    method: 'POST',
                    headers: headers,
                    body: body
                }).then((response) => {
                    console.log(response);
                    return response.json().then(
                        function (json_data) {
                            console.log("JSON data");
                            console.log(json_data);
                            this_object.last_model_run = json_data;
                            this_object.$store.commit("append_model_run", json_data);
                        }
                    )
                }

                     // save the model run ID for later use
                  //.then(response => response.json())
                  //.then(data => set_regions(data));
                )
            }
        },
        computed: {
            activeRegions: function() {
                return this.$store.state.regions.filter(region => region.active === true);
            },
            inactiveRegions: function() {
                return this.$store.state.regions.filter(region => region.active === false);
            },
            allRegions: function(){
                return this.$store.state.regions;
            },
            results_download_url: function(){
                return `${this.$store.state.api_server_url}/api/model_runs/${this.last_model_run.id}/csv/`;
            }
        }
        }
</script>

<style scoped>

</style>