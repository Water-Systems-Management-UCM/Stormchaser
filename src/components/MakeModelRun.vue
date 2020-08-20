<template>
    <v-layout row >
        <v-stepper
          v-model="model_creation_step"
        >
          <v-flex xs12 md12>
            <v-stepper-header>
              <template>
                <v-stepper-step
                    :key="`1-step`"
                    :complete="model_creation_step > n"
                    step="1"
                    editable
                >
                  Region Modifications
                </v-stepper-step>
                <v-stepper-step
                    :key="`2-step`"
                    :complete="model_creation_step > n"
                    step="2"
                    editable
                >
                  Crop Modifications
                </v-stepper-step>
                <v-stepper-step
                    :key="`3-step`"
                    :complete="model_creation_step > n"
                    step="3"
                    editable
                >
                  Model Details
                </v-stepper-step>
                <v-divider
                    v-if="n !== steps"
                    :key="n"
                ></v-divider>
              </template>
            </v-stepper-header>
          </v-flex>
          <v-stepper-items>
            <v-stepper-content
              key="`1-content`"
              step="1"
            >
              <v-flex xs12 md3>
                <h3>Add Region Modifications</h3>
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
                <v-btn
                    color="primary"
                    @click="next_step(1)"
                >
                  Continue
                </v-btn>
              </v-flex>
              <v-flex xs12 md9>
                  Yo, I'm a map
              </v-flex>
            </v-stepper-content>
            <v-stepper-content
                key="`2-content`"
                step="2"
            >
              <h3>Add Crop Modifications</h3>

              <v-btn
                  color="primary"
                  @click="next_step(2)"
              >
                Continue
              </v-btn>
            </v-stepper-content>

            <v-stepper-content
                key="`3-content`"
                step="3"
            >
              <h3>Add Model Details</h3>
              <v-btn v-on:click="run_model">Run Model</v-btn>
              <v-btn :href="results_download_url" download v-if="this.last_model_run.id">Download Results</v-btn>
              <v-btn v-if="this.last_model_run.id"><router-link :to="{ name: 'model-run', params: { id: this.last_model_run.id }}">Go to Model Run</router-link></v-btn>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
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
                last_model_run: {},
                model_creation_step: 1,
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
            next_step (n) {
              this.model_creation_step = n + 1;
            },
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

<style lang="stylus">
  .v-stepper
    width: 100%
</style>