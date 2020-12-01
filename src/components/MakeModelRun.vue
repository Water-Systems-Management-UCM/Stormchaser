<template>
    <v-container>
      <v-flex
        id="new_model_run"
        xs12 md12
      >
        <h2>New Model Run</h2>
        <v-stepper
          v-model="model_creation_step"
          row
        >
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
          <v-stepper-items>
            <v-stepper-content
              key="`1-content`"
              step="1"
              xs12
            >
              <v-row no-gutters>
                <v-flex xs12 md6>
                  <RegionCard :region="default_region"
                              @region_modification_value_change="refresh_map"></RegionCard>
                </v-flex>
                <v-flex xs12 md6>
                  <p class="sc-help_block">The model always includes every region. Settings from the "All Regions" card apply by default. Add cards for other regions from the dropdown to override
                    the defaults for specific regions.</p>
                </v-flex>
              </v-row>
              <v-row no-gutters>
                <v-col class="col-xs-12 col-md-6">
                  <h3 style="margin: 1em 1em 0 1em">Add Region Modifications</h3>
                  <v-autocomplete
                      v-model="selected_regions"
                      :items="available_regions"
                      item-text="region.name"
                      clearable
                      deletable-chips
                      chips
                      small-chips
                      label="Add Regions"
                      return-object
                      persistent-hint
                      multiple
                      solo
                      style="margin: 0 1em"
                  ></v-autocomplete>
                  <v-flex>
                    <RegionCard
                        v-for="r in selected_regions"
                        v-bind:region="r"
                        v-bind:key="r.region.id"
                        v-on:region-deactivate="deactivate_region"
                        @region_modification_value_change="refresh_map"
                    ></RegionCard>
                  </v-flex>
                  <v-btn
                      color="primary"
                      @click="next_step(1)"
                  >
                    Continue
                  </v-btn>
                </v-col>
                <v-col class="col-xs-12 col-md-6">
                  <!--<v-autocomplete
                    v-model="map_style_attribute"
                    :items="map_style_options"
                    label="Symbolize map by input value"
                    return-object
                    persistent-hint
                    solo
                ></v-autocomplete>-->
                  <h3>Spatial View of Modifications</h3>
                  <l-map
                      :zoom="map_zoom"
                      :center="map_center"
                      id="region_map"
                  >
                    <l-tile-layer :url="map_tile_layer_url"></l-tile-layer>
                    <l-geo-json :geojson="map_geojson" :optionsStyle="map_region_style"></l-geo-json>
                    <l-control class="leaflet_button">  <!-- Controls to switch which variable it's using to render -->
                      <button @click="switch_map('water_proportion')" :class="[map_style_attribute === 'water_proportion' ? 'selected' : '',]">
                        Water
                      </button>
                    </l-control>
                    <l-control class="leaflet_button">
                      <button @click="switch_map('land_proportion')" :class="[map_style_attribute === 'land_proportion' ? 'selected' : '',]">
                        Land
                      </button>
                    </l-control>
                  </l-map>

                </v-col>
              </v-row>
            </v-stepper-content>
            <v-stepper-content
                key="`2-content`"
                step="2"
                row
            >
              <v-flex xs12>
                <h3>Add Crop Modifications</h3>

                <CropCard :crop="default_crop"></CropCard>
                <p class="sc-help_block">Settings for the "All Crops" card apply by default. Add other crops from the dropdown to override
                  the defaults.</p>

                <!-- temporarily using crop code in the list until we can use the name when it's loaded -->
                <v-autocomplete
                    v-model="selected_crops"
                    :items="available_crops"
                    item-text="crop.name"
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
                    v-bind:key="c.crop.crop_code"
                    v-on:crop-deactivate="deactivate_crop"
                ></CropCard>
                <v-btn
                    color="primary"
                    @click="next_step(2)"
                >
                  Continue
                </v-btn>
              </v-flex>
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
              <v-btn v-if="this.last_model_run.id" :to="{ name: 'model-run', params: { id: this.last_model_run.id }}">Go to Model Run</v-btn>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
      </v-flex>
    </v-container>
</template>

<script>
    import RegionCard from "@/components/RegionCard";
    import CropCard from "@/components/CropCard";
    import NotificationSnackbar from "@/components/NotificationSnackbar";
    // import L from "leaflet";
    import {LMap, LTileLayer, LGeoJson, LControl} from 'vue2-leaflet';

    export default {
        components: {
          NotificationSnackbar,
          RegionCard,
          CropCard,
          LMap,
          LTileLayer,
          LGeoJson,
          LControl
        },
        name: "MakeModelRun",
        data: function(){
            return {
                default_region: {
                  "region": {id: null, name: "All Regions", internal_id: null, external_id: null},
                  "land_proportion": 100,  // not actually proportions right now - they're percents and we'll make them proportions when we send them
                  "water_proportion": 100,
                  "default": true,
                  "active": true, // active by default - we need to make it unremovable too
                },
                default_crop: {
                    "crop": {crop_id: null, name: "All Crops", crop_code: null, id: null},
                    "yield_proportion": 100,
                    "price_proportion": 100,
                    "area_restrictions": [0,200],
                    "default": true,
                    "active": true, // active by default - we need to make it unremovable too
                },
                selected_regions: [],
                selected_crops: [],
                last_model_run: {},
                model_creation_step: 1,
                new_model_run_name: null,
                new_model_run_description: null,
                model_created_snackbar: false,
                model_creation_failed_snackbar: false,
                model_creation_failed_text: null,
                map_tile_layer_url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                map_style_attribute: "water_proportion",
                map_style_options: ["water_proportion", "land_proportion"],
                map_geojson: {type: "FeatureCollection", features: []},
            }
        },
        mounted() {
          // this is a hack to fix that Vue2-leaflet won't load the map correctly until after a resize event is triggered. It'd be nice to remove it if we can find a better way
          setTimeout(function() { window.dispatchEvent(new Event('resize')) }, 250);
          this.map_geojson = this.region_geojson;  // initialize the map data
          setTimeout(this.refresh_map, 500);  // we used to trigger the map update loop - now we'll just trigger a refresh
        },
        watch: {
            selected_regions(new_array, old_array){
              this.update_selected(new_array, old_array)
              // adding a region can change the size of the map frame, so trigger a resize event so it knows it's bigger
              setTimeout(function() { window.dispatchEvent(new Event('resize')) }, 250);
              this.refresh_map()  // when we add or remove regions, the map changes (because defaults get applied to regions)
            },
            selected_crops(new_array, old_array){
              this.update_selected(new_array, old_array)
            }
        },
        methods: {
            //update_map_loop(){
              // this is commented out because we now listen for an event raised from the RegionCard indicating that
              // values have changed. I'm a tiny bit concerned about that for performance (because changing the slider
              // triggers the event dozens of times), so I'm leaving this in case we decide to return to a refresh loop

              // the map isn't reactive to styling/options changes (such as if the style values would change
              // when we change sliders. Instead, we need to modify the features in place to get it to notice changes
              // and re-render them. We'll push an empty object to features and immediately pop it off every 5 second
              // - this seems to trigger a re-render and the 5 second loop means we don't have to watch every slider
              // for a change (though we could probably watch a single event - it might be better to do that in the long
              // run, though it could be a lot of events and I could see this breaking on that timescale
              //this.refresh_map();
              //setTimeout(this.update_map_loop, 5000);
            //},
            refresh_map(){
              this.map_geojson.features.push({})
              this.map_geojson.features.pop();
            },
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
                this.last_model_run = model_run;
                this.results_download_url = `/model_run/csv/${model_run.id}/`;
            },
            reset_model: function() {
              // When the model has been successfully submitted, this function resets it so that it can be run again
              // We should consider whether we want it to remove *everything* or not since it might be beneficial for people
              // to have some things remain so they can make slight tweaks - maybe some kind of manual reset button instead?

              this.new_model_run_name = null;
              this.new_model_run_description = null;
            },
            run_model: function() {
                this.model_creation_failed_snackbar = false; // if they trigger this function, get rid of existing error notifications so new ones or success messages are obvious

                console.log("Creating Model Run");
                let headers = this.get_header();
                console.log(headers.values());

                let regions = this.selected_regions;
                let scaled_down_regions = [
                  {  // add the default region info right off the bat
                    "region": null,
                    "land_proportion": this.default_region.land_proportion / 100,
                    "water_proportion": this.default_region.water_proportion / 100
                  }
                ];
                regions.forEach(function (region) {
                    let new_region = {
                        "region": region.region.id,
                        "water_proportion": region.water_proportion / 100, // API deals in proportions, not percents
                        "land_proportion": region.land_proportion / 100 // API deals in proportions, not percents
                    };
                    scaled_down_regions.push(new_region);
                });

              let crops = this.selected_crops;
              let scaled_down_crops = [
                {  // add the default crop info right off the bat
                  "crop": null,
                  "price_proportion": this.default_crop.price_proportion / 100,
                  "yield_proportion": this.default_crop.yield_proportion / 100,
                  "min_land_area_proportion": this.default_crop.area_restrictions[0] / 100,
                  "max_land_area_proportion": this.default_crop.area_restrictions[1] / 100
                }
              ];
              crops.forEach(function (crop) { // then iterate through all of the crop modifications and add them
                let new_crop = {
                  "crop": crop.crop.id,
                  "price_proportion": crop.price_proportion / 100,  // API deals in proportions, not percents
                  "yield_proportion": crop.yield_proportion / 100,  // API deals in proportions, not percents
                  "min_land_area_proportion": crop.area_restrictions[0] / 100,
                  "max_land_area_proportion": crop.area_restrictions[1] / 100
                };
                scaled_down_crops.push(new_crop);
              });


                let name = this.new_model_run_name ? this.new_model_run_name : null;
                let description = this.new_model_run_description ? this.new_model_run_description : null;

                let body = `{
                                "name": ${JSON.stringify(name)},
                                "description": ${JSON.stringify(description)},
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
                              this_object.$store.commit("set_single_model_run", {
                                area_id: this_object.$store.getters.current_model_area.id,
                                run: json_data
                              });

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
            },
            map_region_style: function(feature){
              let get_color = function(value, min, max){
                let color_value = Math.round(((value - min) / (max - min)) * 200) // multiply times 200 for black to green to top out on a darker color
                // return {color: `rgb(${255-color_value}, 255, ${255-color_value})`}  // white to green color ramp
                return {color: `rgb(0, ${color_value}, 0)`}; // black to green color ramp
              }

              let region_object = this.selected_regions.find(a_region => a_region.region.id === feature.properties.id);
              if(region_object !== undefined){
                return get_color(region_object[this.map_style_attribute], 50, 120)
              }else{
                return get_color(this.default_region[this.map_style_attribute], 50, 120)
              }
            },
            switch_map(variable){
              this.map_style_attribute = variable;
              this.refresh_map()  // force a refresh after we change the attribute to visualize by
            }
        },
        computed: {
            available_regions: function(){
              // takes the items from the input props and adds the values they need for this component to a new object
              // we'll use here so that the global data store stays clean

              let avail_regions = [];
              let _this = this;

              // make the new region objects
              Object.keys(_this.regions).forEach(function(region_id){
                avail_regions.push({
                  "region": _this.regions[region_id],
                  "land_proportion": 100,
                  "water_proportion": 100,
                  "active": false
                })
              })

              return avail_regions;
            },
            available_crops: function(){
              // takes the items from the input props and adds the values they need for this component to a new object
              // we'll use here so that the global data store stays clean

              // initialize the array
              let crops = [];
              let _this = this;

              // then make the new crop objects
              Object.keys(_this.crops).forEach(function(crop_id){
                crops.push({
                  "crop": _this.crops[crop_id],
                  "yield_proportion": 100,
                  "price_proportion": 100,
                  "area_restrictions": [0,200],
                  "active": false,
                })
              });

              return crops;
            },
            regions: function() {
                let out_regions = Object.values(this.$store.getters.current_model_area.regions) // get the object as an array
                out_regions.sort(function(a, b) {  // sort them by region name
                      let nameA = a.name.toUpperCase(); // case insensitive sort - make it uppercase for comparison
                      let nameB = b.name.toUpperCase();
                      if (nameA < nameB) {
                        return -1;
                      }
                      if (nameA > nameB) {
                        return 1;
                      }
                      return 0;
                    });
                return out_regions;
            },
            crops: function() {
                let out_crops = Object.values(this.$store.getters.current_model_area.crops);
                out_crops.sort(function(a, b) {  // sort them by crop name
                  let nameA = a.name.toUpperCase(); // case insensitive sort - make it uppercase for comparison
                  let nameB = b.name.toUpperCase();
                  if (nameA < nameB) {
                    return -1;
                  }
                  if (nameA > nameB) {
                    return 1;
                  }
                  return 0;
                });
              return out_crops;
            },
            active_regions: function() {
                return this.available_regions.filter(region => region.active === true);
            },
            inactive_regions: function() {
                return this.available_regions.filter(region => region.active === false);
            },
            active_crops: function() {
                return this.available_crops.filter(crop => crop.active === true);
            },
            inactive_crops: function() {
              return this.available_crops.filter(crop => crop.active === false);
            },
            results_download_url: function(){
                return `${this.$store.state.api_server_url}/api/model_runs/${this.last_model_run.id}/csv/`;
            },
            region_geojson: function(){
              return this.$stormchaser_utils.regions_as_geojson(this.available_regions.map(function(region){return region.region}), "id")
              /*return {
                type: "FeatureCollection",
                features:this.available_regions.map(function (region) {
                  return JSON.parse(region.region.geometry);
                })
              }*/
            },
            map_center: function(){
              return [this.$store.getters.current_model_area.map_center_latitude, this.$store.getters.current_model_area.map_center_longitude]
            },
            map_zoom: function(){
              return this.$store.getters.current_model_area.map_default_zoom;
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

  .sc-help_block
    margin-top: 0.5em;

  #region_map
    min-height: 500px;

  .leaflet_button
    background: #fff;
    font-weight: bold;
    min-width: 6em;
    text-align: center;
    // border-radius: 0.1em;
    border: 1px solid #aaa;

    button
      padding: 0.5em;
      width: 100%;
      height: 100%;

    button.selected
      padding: 0.5em;
      border: 1px solid #3baeff;
      width: 100%;
      height: 100%;
      background-color: #acdbff

</style>