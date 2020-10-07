<template>
    <v-layout row >
      <v-flex xs12 lg9
        id="new_model_run"
      >
        <h2>New Model Run</h2>
        <v-stepper
          v-model="model_creation_step"
        >
          <v-flex xs12>
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
              <v-flex xs12 md6>
                <h3>Add Region Modifications</h3>
                <v-autocomplete
                        v-model="selected_regions"
                        :items="all_regions"
                        item-text="name"
                        clearable
                        deletable-chips
                        chips
                        small-chips
                        label="Add Regions"
                        return-object
                        persistent-hint
                        multiple
                        solo
                ></v-autocomplete>
                <v-flex>
                    <RegionCard
                            v-for="r in selected_regions"
                            v-bind:region="r"
                            v-bind:key="r.id"
                            v-on:region-deactivate="deactivate_region"
                    ></RegionCard>
                </v-flex>
                <v-btn
                    color="primary"
                    @click="next_step(1)"
                >
                  Continue
                </v-btn>
              </v-flex>
              <v-flex xs12 md6>
                  Yo, I'm a map
              </v-flex>
            </v-stepper-content>
            <v-stepper-content
                key="`2-content`"
                step="2"
            >
              <h3>Add Crop Modifications</h3>
              <!-- temporarily using crop code in the list until we can use the name when it's loaded -->
              <v-autocomplete
                  v-model="selected_crops"
                  :items="all_crops"
                  item-text="crop_code"
                  clearable
                  deletable-chips
                  chips
                  small-chips
                  label="Add Crops"
                  return-object
                  persistent-hint
                  multiple
                  solo
              ></v-autocomplete>
              <CropCard
                  v-for="c in selected_crops"
                  v-bind:crop="c"
                  v-bind:key="c.crop_code"
                  v-on:crop-deactivate="deactivate_crop"
              ></CropCard>
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
              <v-snackbar
                  v-model="model_created_snackbar"
                  top
                  timeout="-1"
              >
                Model Run Created.
                <v-btn
                    color="pink"
                    text
                    :to="{ name: 'model-run', params: { id: this.last_model_run.id }}"
                >
                  Go to Model Run
                </v-btn>

                <template v-slot:action="{ attrs }">
                  <v-btn
                      color="pink"
                      text
                      v-bind="attrs"
                      @click="model_created_snackbar = false"
                  >
                    Close
                  </v-btn>
                </template>
              </v-snackbar>
              <notification-snackbar
                v-model="model_creation_failed_snackbar"
                :error_text="model_creation_failed_text"
                constant_snackbar_text="Could not create model run"
              ></notification-snackbar>
                <v-text-field
                  v-model="new_model_run_name"
                  label="Model Run Name"
                ></v-text-field>
                <v-textarea
                    v-model="new_model_run_description"
                    label="Description or Metadata"
                    hint="Include any details here that help you remember the intent or purpose of this model run. Input parameters will be automatically captured and shown with results."
                >
                </v-textarea>
              <v-btn v-on:click="run_model">Run Model</v-btn>
              <v-btn :href="results_download_url" download v-if="this.last_model_run.id">Download Results</v-btn>
              <v-btn v-if="this.last_model_run.id" :to="{ name: 'model-run', params: { id: this.last_model_run.id }}">Go to Model Run</v-btn>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
      </v-flex>
    </v-layout>
</template>

<script>
    import RegionCard from "@/components/RegionCard";
    import CropCard from "@/components/CropCard";
    import NotificationSnackbar from "@/components/NotificationSnackbar";

    export default {
        components: {
          NotificationSnackbar,
          RegionCard,
          CropCard
        },
        name: "MakeModelRun",
        data: function(){
            return {
                selected_regions: [],
                selected_crops: [],
                last_model_run: {},
                model_creation_step: 1,
                new_model_run_name: null,
                new_model_run_description: null,
                model_created_snackbar: false,
                model_creation_failed_snackbar: false,
                model_creation_failed_text: null,
            }
        },
        watch: {
            selected_regions(new_array, old_array){
              this.update_selected(new_array, old_array)
            },
            selected_crops(new_array, old_array){
              this.update_selected(new_array, old_array)
            }
        },
        methods: {
            update_selected(new_array, old_array){
              // this could be streamlined into a single symmetric difference then just flip the value of .active,
              // but I think the code would be a bit less clear/maintainable. This is fine

              // find the differences
              let added = new_array.filter(x => !old_array.includes(x));
              let removed = old_array.filter(x => !new_array.includes(x));

              // toggle the values
              added.forEach(function(item){
                item.active = true;
              })
              removed.forEach(function(item){
                item.active = false;
              })
            },
            next_step (n) {
              this.model_creation_step = n + 1;
            },
            deactivate_region: function(){
                console.log("Deactivating");
                this.selected_regions = this.active_regions;
            },
            deactivate_crop: function(){
              console.log("Deactivating"); // we can just set it to the active_crops since it will already have its active flag set to false
              this.selected_crops = this.active_crops;
            },
            activate_region: function(event){
                console.log(event);
                event.active = !event.active;
            },
            get_header: function() {
                return this.$store.getters.basic_auth_headers;
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
            reset_model: function() {
              // When the model has been successfully submitted, this function resets it so that it can be run again
              // We should consider whether we want it to remove *everything* or not since it might be beneficial for people
              // to have some things remain so they can make slight tweaks - maybe some kind of manual reset button instead?

              this.new_model_run_name = null;
              this.new_model_run_description = null;
            },
            run_model: function() {
                console.log("Creating Model Run");
                let headers = this.get_header();
                console.log(headers.values());

                let regions = this.active_regions;
                let scaled_down_regions = [];
                regions.forEach(function (region) {
                    let new_region = {
                        "region": region.id,
                        "water_proportion": region.water_proportion / 100, // API deals in proportions, not percents
                        "land_proportion": region.land_proportion / 100 // API deals in proportions, not percents
                    };
                    scaled_down_regions.push(new_region);
                });

              let crops = this.active_crops;
              let scaled_down_crops = [];
              crops.forEach(function (crop) {
                let new_crop = {
                  "crop": crop.id,
                  "price_proportion": crop.price_proportion / 100,  // API deals in proportions, not percents
                  "yield_proportion": crop.yield_proportion / 100  // API deals in proportions, not percents
                };
                scaled_down_crops.push(new_crop);
              });


                let name = this.new_model_run_name ? `"${this.new_model_run_name}"` : null;
                let description = this.new_model_run_description ? `"${this.new_model_run_description}"` : null;

                let body = `{
                                "name": ${name},
                                "description": ${description},
                                "ready": true,
                                "organization": ${this.$store.state.organization_id},
                                "calibration_set": ${this.$store.state.calibration_set_id},
                                "region_modifications": ${JSON.stringify(scaled_down_regions)},
                                "crop_modifications": ${JSON.stringify(scaled_down_crops)}
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
                            if (response.ok) {
                              console.log("JSON data");
                              console.log(json_data);
                              this_object.last_model_run = json_data;
                              this_object.$store.commit("append_model_run", json_data);

                              this_object.model_created_snackbar = true;
                              this_object.reset_model();
                            } else {
                              this_object.model_creation_failed_snackbar = true;
                              console.log(response);
                              console.log(json_data);
                              this_object.model_creation_failed_text = "Server rejected model creation. See console for details."
                            }
                          }
                      )
                }

                     // save the model run ID for later use
                  //.then(response => response.json())
                  //.then(data => set_regions(data));
                ).catch(error => {
                  this_object.model_creation_failed_snackbar = true;
                  this_object.model_creation_failed_text = `Unknown network error - please try again later: ${error}`;
                })
            }
        },
        computed: {
            active_regions: function() {
                return this.$store.state.regions.filter(region => region.active === true);
            },
            inactive_regions: function() {
                return this.$store.state.regions.filter(region => region.active === false);
            },
            all_regions: function(){
                return this.$store.state.regions;
            },
            active_crops: function() {
                return this.$store.state.crops.filter(crop => crop.active === true);
            },
            inactive_crops: function() {
              return this.$store.state.crops.filter(crop => crop.active === false);
            },
            all_crops: function(){
                return this.$store.state.crops;
            },
            results_download_url: function(){
                return `${this.$store.state.api_server_url}/api/model_runs/${this.last_model_run.id}/csv/`;
            }
        }
    }
</script>

<style lang="stylus">
  div#new_model_run
    margin-left: auto;
    margin-right: auto;

  .v-stepper
    width: 100%
</style>