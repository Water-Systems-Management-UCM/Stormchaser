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
                  step="1"
                  editable
              >
                Region Modifications
              </v-stepper-step>
              <v-divider></v-divider>
              <v-stepper-step
                  :key="`2-step`"
                  step="2"
                  editable
              >
                Crop Modifications
              </v-stepper-step>
              <v-divider></v-divider>
              <v-stepper-step
                  :key="`3-step`"
                  step="3"
                  editable
              >
                Model Details
              </v-stepper-step>
            </template>
          </v-stepper-header>
          <v-stepper-items>
            <v-stepper-content
              key="`1-content`"
              step="1"
              xs12
            >
              <v-row no-gutters>
                <v-col class="col-12 col-md-6">
                  <RegionCard :region="default_region"
                              @region_modification_value_change="refresh_map"
                              :force_irrigation="model_supports_irrigation"
                              :force_rainfall="model_supports_rainfall"
                              :default_limits="card_limits"
                  ></RegionCard>
                </v-col>
                <v-col class="col-12 col-md-6">
                  <p class="sc-help_block">The model always includes every region. Settings from the "All Regions" card apply by default. Add cards for other regions from the dropdown to override
                    the defaults for specific regions.</p>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col class="col-12 col-sm-12 col-md-6">
                  <h3 style="margin: 1em 1em 0 1em">Add Region Modifications</h3>
                  <v-tabs
                    v-model="region_modification_tab"
                  >
                      <v-tab :style="display_region_tab">Region</v-tab>
                      <v-tab v-if="$store.getters.current_model_area.region_group_sets.length > 0">Region Groups</v-tab>
                      <v-tab-item>
                        <v-autocomplete
                            id="region_select_box"
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
                        <RegionCard
                            v-for="r in selected_regions_display"
                            :region="r"
                            :key="r.region.id"
                            @region-deactivate="deactivate_region"
                            @region_modification_value_change="refresh_map"
                            @region-model-type="set_modeled_type"
                            :default_limits="card_limits"
                            :preferences="$store.getters.current_model_area.preferences"
                        ></RegionCard>
                      </v-tab-item>
                      <v-tab-item v-if="$store.getters.current_model_area.region_group_sets.length > 0">
                        <v-autocomplete
                            id="region_select_box"
                            v-model="selected_regions"
                            :items="available_region_groups"
                            item-text="region_group.name"
                            clearable
                            deletable-chips
                            chips
                            small-chips
                            label="Add Region Groups"
                            return-object
                            persistent-hint
                            multiple
                            solo
                            style="margin: 0 1em"
                        ></v-autocomplete>
                        <RegionCard
                            v-for="r in selected_region_groups_display"
                            :region="r"
                            :key="r.region_group.name"
                            @region-deactivate="deactivate_region"
                            @region_modification_value_change="refresh_map"
                            @region-model-type="set_modeled_type"
                            :default_limits="card_limits"
                            :preferences="$store.getters.current_model_area.preferences"
                        ></RegionCard>
                      </v-tab-item>
                    </v-tabs>
                  <v-btn
                      color="primary"
                      @click="next_step(1)"
                      id="continue_step2"
                  >
                    Continue
                  </v-btn>
                </v-col>
                <v-col class="col-12 col-sm-12 col-md-6">
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
                    <l-geo-json :geojson="map_geojson" :optionsStyle="map_region_style"
                      :options="{onEachFeature: map_hover_and_click}"
                    >
                    </l-geo-json>
                    <l-control class="leaflet_button"
                      v-for="variable in map_variables"
                      :key="variable.key"
                    >
                      <button @click="switch_map(variable.key)" :class="[map_style_attribute === variable.key ? 'selected' : '',]">
                        {{ variable.text }}
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
              <v-row>
                <v-col class="col-12 col-md-9">
                  <CropCard :crop="default_crop"
                            :default_limits="card_limits"
                            v-on:price-yield-threshold="process_price_yield_threshold"
                  ></CropCard>
                </v-col>
                <v-col class="col-12 col-md-3">
                  <p class="sc-help_block sc-help_tall">Settings for the "All Crops" card apply by default. Add other crops from the dropdown to override
                    the defaults.</p>
                </v-col>
              </v-row>
              <v-row>
                <v-col class="col-12">
                  <h3>Add Crop Modifications</h3>
                </v-col>
              </v-row>
              <v-row>
                <v-col class="col-12">
                  <v-autocomplete
                      v-model="selected_crops"
                      :items="available_crops"
                      item-text="name"
                      item-value="crop_code"
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
                </v-col>
              </v-row>
              <v-row>
                  <CropCard
                      v-for="c in sorted_selected_crops"
                      :crop="c"
                      :key="c.crop_code"
                      @crop-deactivate="deactivate_crop"
                      @region-link="make_region_linked_crop"
                      @update-crop="update_crop_data"
                      :deletion_threshold="last_allcrops_price_yield_threshold"
                      :default_limits="card_limits"
                      :region_options="regions"
                      :enable_region_linking="$store.getters.current_model_area.preferences.region_linked_crops"
                      class="col-md-5"
                  ></CropCard>
              </v-row>
              <v-row>
                <v-col class="col-12">
                  <v-btn
                      color="primary"
                      @click="next_step(2)"
                  >
                    Continue
                  </v-btn>
                </v-col>
              </v-row>
            </v-stepper-content>

            <v-stepper-content
                key="`3-content`"
                step="3"
            >
              <v-row>
                <v-col class="col-md-6 col-12">
                  <h3>Add Model Details</h3>
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

                </v-col>

                <v-col class="col-md-6 col-12">
                  <h3>Review Inputs</h3>
                  <h4>Region Modifications</h4>
                  <v-data-table
                      :dense="$store.getters.user_settings('dense_tables')"
                      :headers="region_modifications_headers"
                      :items="review_region_data"
                      item-key="id"
                      disable-pagination
                      class="elevation-1"
                  >
                    <template v-slot:item.model_type ="{ item }">
                      <span v-if="item.modeled_type === $store.getters.region_modeling_types.MODELED || item.modeled_type === undefined">{{ $store.state.terms.get_term_for_locale("model_runs.types.full") }}</span>
                      <span v-if="item.modeled_type === $store.getters.region_modeling_types.FIXED">{{ $store.state.terms.get_term_for_locale("model_runs.types.hold_to_base") }}</span>
                      <span v-if="item.modeled_type === $store.getters.region_modeling_types.REMOVED">{{ $store.state.terms.get_term_for_locale("model_runs.types.no_production") }}</span>
                      <span v-if="item.modeled_type === $store.getters.region_modeling_types.LINEAR_SCALED">{{ $store.state.terms.get_term_for_locale("model_runs.types.simple") }}</span>
                    </template>
                  </v-data-table>
                  <h4>Crop Modifications</h4>
                  <v-data-table
                      :dense="$store.getters.user_settings('dense_tables')"
                      :headers="crop_modifications_headers"
                      :items="review_crop_data"
                      item-key="id"
                      disable-pagination
                      class="elevation-1"
                  >
                    <template v-slot:item.max_land_area_proportion="{ item }">
                      <span v-if="item.max_land_area_proportion === null">No Limit</span>
                      <span v-if="item.max_land_area_proportion >= 0">{{ item.max_land_area_proportion }}</span>
                    </template>
                  </v-data-table>
                  <v-row
                    v-if="$store.getters.current_model_area.preferences.allow_model_run_creation_code_view"
                  >
                    <v-col>
                      <p>
                        <a @click="update_model_run_creation_code">Show/Update Generated JSON</a>
                      </p>
                      <v-textarea
                          :value="model_run_creation_code"
                      ></v-textarea>
                    </v-col>
                  </v-row>
                </v-col>
                <v-snackbar
                    v-model="model_created_snackbar"
                    top
                    timeout="-1"
                >
                  Model Run Created.
                  <v-btn
                      text
                      :to="{ name: 'model-run', params: { id: this.last_model_run.id }}"
                  >
                    Go to Model Run
                  </v-btn>


                  <template v-slot:action="{ attrs }">
                    <v-btn
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
              </v-row>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
      </v-flex>
    </v-container>
</template>

<script>

import Vue from 'vue';

import RegionCard from "@/components/RegionCard";
import CropCard from "@/components/CropCard";
import NotificationSnackbar from "@/components/NotificationSnackbar";
// import L from "leaflet";
import {LControl, LGeoJson, LMap, LTileLayer} from 'vue2-leaflet';
import clonedeep from 'lodash.clonedeep';

export default {
        components: {
          NotificationSnackbar,
          RegionCard,
          CropCard,
          LMap,
          LTileLayer,
          LGeoJson,
          LControl,
        },
        name: "MakeModelRun",
        data: function(){
            return {
                default_region: {
                  "region": {id: null, name: "All Regions", internal_id: null, external_id: null},
                  "land_proportion": 100,  // not actually proportions right now - they're percents and we'll make them proportions when we send them
                  "water_proportion": 100,
                  "rainfall_proportion": 100,
                  "default": true,
                  "active": true, // active by default - we need to make it unremovable too
                },
                default_crop: {
                    "waterspout_data": {crop_id: null, name: "All Crops", crop_code: null, id: null},
                    "crop_code": null,
                    "yield_proportion": 100,
                    "price_proportion": 100,
                    "area_restrictions": [0,null], // 0 and -1 means no upper limit.
                    "default": true,
                    "active": true, // active by default - we need to make it unremovable too
                },
                region_modifications_headers: [
                  {text: 'Region or Group Name', value: 'name' },
                  {text: 'Land %', value: 'land_proportion' },
                  {text: 'Irrigation %', value: 'water_proportion' },
                  {text: 'Rainfall %', value: 'rainfall_proportion' },
                  {text: 'Modeling', value: 'model_type' },
                ],
                region_modification_tab: 0,  // we'll track this so we can switch it, e.g. when they click on the map
                crop_modifications_headers: [
                  {text: 'Crop', value: 'name' },
                  this.$store.getters.current_model_area.preferences.region_linked_crops ? {text: 'Region', value: 'region' } : null,
                  {text: 'Price %', value: 'price_proportion' },
                  {text: 'Yield %', value: 'yield_proportion' },
                  {text: 'Min Land Area %', value: 'min_land_area_proportion' },
                  {text: 'Max Land Area %', value: 'max_land_area_proportion' },
                ].filter(item => item !== null),  // do it this way so we only show the region header when it's available
                selected_regions: [],
                selected_crops: [],
                sorted_selected_crops: [],
                lowest_price_yield_value: 1,  // we'll cache this to do less checking.
                last_allcrops_price_yield_threshold: 1,  // we'll store this so we can determine if a crop is deleteable
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
                show_model_run_creation_code: false,
                model_run_creation_code: "",
                regions: [],
                available_regions: [],
                available_region_groups: [],
                available_crops: []
            }
        },
        created() {
          this.set_regions();
          this.set_crops();
        },
        mounted() {
          // this is a hack to fix that Vue2-leaflet won't load the map correctly until after a resize event is triggered. It'd be nice to remove it if we can find a better way
          setTimeout(function() { window.dispatchEvent(new Event('resize')) }, 250);
          this.map_geojson = this.region_geojson;  // initialize the map data and inject the internal_id property
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
              this.sorted_selected_crops = [...this.selected_crops]
              this.sort_by_name(this.sorted_selected_crops)
            }
        },
        methods: {
            set_regions(){
              let out_regions = clonedeep(Object.values(this.$store.getters.current_model_area.regions)) // get the object as an array
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
              this.regions = out_regions;

              // takes the items from the input props and adds the values they need for this component to a new object
              // we'll use here so that the global data store stays clean

              let avail_regions = [];
              // make the new region objects
              Object.keys(out_regions).forEach(function(region_id){
                avail_regions.push({
                  "region": out_regions[region_id],
                  "region_group": null,
                  "land_proportion": 100,
                  "water_proportion": 100,
                  "rainfall_proportion": 100,
                  "active": false,
                  "is_group": false
                })
              })
              this.available_regions = avail_regions
              let _this = this;
              // make the new region objects
              let region_groups = this.$store.getters.current_model_area.region_group_sets;
              if(region_groups.length > 0) {
                this.available_region_groups = Object.values(this.$store.getters.current_model_area.region_group_sets[0].groups).map(function (region_group) {
                  return {
                    "region_group": region_group,
                    "region": {},
                    "land_proportion": 100,
                    "water_proportion": 100,
                    "rainfall_proportion": 100,
                    "active": false,
                    "is_group": true,
                    "regions_in_group": region_group.regions.map(function (id) {
                      return _this.$store.getters.current_model_area.regions[id]
                    })
                  };
                })
              }
            },
            set_crops: function(){
              // takes the items from the input props and adds the values they need for this component to a new object
              // we'll use here so that the global data store stays clean

              let avail_crops = clonedeep(Object.values(this.$store.getters.current_model_area.crops));
              this.sort_by_name(avail_crops);

              // initialize the array
              let crops = [];

              // then make the new crop objects
              Object.keys(avail_crops).forEach(function(crop_id){
                crops.push({
                  "waterspout_data": avail_crops[crop_id],
                  "crop_code": avail_crops[crop_id].crop_code,  // this is a duplication, but when we region-link, we'll change it
                  "name": avail_crops[crop_id].name,  // this is a duplication, but when we region-link, we'll change it
                  "yield_proportion": 100,
                  "price_proportion": 100,
                  "area_restrictions": [0, null], // -1 means no upper limit - one will be set on the crop card as users change it
                  "auto_created": false,  // we use this to signify that the crop has been forcibly added by the application
                  "active": false,
                  "is_original_crop": true, // when we make region_linked crops, this will be false
                })
              });

              this.available_crops = crops;
            },

            set_modeled_type(args){
              console.log(args)

              let change_region;
              if (args.region.is_group){
                change_region = this.selected_regions.find(region => region.region_group.id === args.region.region_group.id)
              }else{
                change_region = this.selected_regions.find(region => region.region.id === args.region.region.id)
              }

              switch (args.type){
                case "modeled":
                  Vue.set(change_region, 'modeled_type', this.$store.getters.region_modeling_types.MODELED);
                  break;
                case "removed":
                  Vue.set(change_region, 'modeled_type', this.$store.getters.region_modeling_types.REMOVED);
                  break;
                case "static":
                  Vue.set(change_region, 'modeled_type', this.$store.getters.region_modeling_types.FIXED);
                  break
                case "linear_scaled":
                  Vue.set(change_region, 'modeled_type', this.$store.getters.region_modeling_types.LINEAR_SCALED);
                  break;
              }
            },
            /**
             * Handles setting the mouseover and click actions for each item in the map.
             *
             * @param feature - the geojson feature that was hovered or clicked
             * @param layer - the full geojson layer - passed by vue-leaflet
             */
            map_hover_and_click(feature, layer){
              let item_name = feature.properties.name;
              let item_id = feature.properties.id;
              let _this = this;

              // set the mouseover popup by binding the region's name to the popup - will show up at mouse location
              layer.on('mouseover', function () { ///
                layer.bindPopup(item_name).openPopup()
              });

              // bind the click event to the layer for each polygon
              layer.on('click', function() {
                // check if the region is already in the selected regions - we don't want to do this if it is since that would duplicate it
                if(_this.selected_regions.filter(region => region.region.id === item_id).length === 0){
                  // find the clicked region in the available regions and set it to active, before pushing it to the selected regions array
                  let region = _this.available_regions.filter(regionfind => regionfind.region.id === item_id)[0]
                  region.active = true;
                  _this.selected_regions.push(region);
                  _this.region_modification_tab = 0;  // change the region modifications view to the cards so they see it.
                }
              })
            },
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
              let _this = this;

              // toggle the values
              added.forEach(function(item){
                item.active = true;
              })
              removed.forEach(function(item){
                if(!("is_deletable" in item) || item.is_deletable === true){
                  // if it's currently deletable, we can just remove it
                  // items have their own logic for removal - crops can't be removed if all crops is set below their price/yield threshold
                  item.auto_created = false;
                  item.active = false;
                }else{
                  // otherwise, we're not allowed to remove it, so add it back
                  item.active = true;  // reset the active flag if it was manually removed, so that the item shows correctly
                  new_array.push(item)
                  _this.$store.commit("app_notice", {message: "Cannot remove some items - hover over the info button in the top right of their cards for more information", timeout: 5000})
                }
              })
            },
            next_step (n) {
              this.model_creation_step = n + 1;
            },
            deactivate_region: function(){
                console.log("Deactivating");
                this.selected_regions = this.active_regions
            },
            deactivate_crop: function(){
              //console.log("Deactivating" + crop.name); // we can just set it to the active_crops since it will already have its active flag set to false
              /*if(crop !== undefined){
                let _crop = this.available_crops.find(av_crop => av_crop.crop_code === crop.crop_code);
                _crop.active = false;
              }*/
              // when we deactivate a crop, filter the available crops to remove region-linked ones that have been removed by the user
              console.log(`new avail: ${this.available_crops.filter(crop => {crop.active === true || crop.is_original_crop === true})}`)
              // then update selected crops with active crops;
              this.selected_crops = this.active_crops;
            },
            activate_region: function(event){
                console.log(event);
                event.active = !event.active;
            },
            activate_crop: function(crop_info){
                let crop_code = crop_info.crop_code;
                let crop = this.available_crops.find(a_crop => a_crop.crop_code === crop_code);

                crop.active = true

                // in some cases, we'll create the new card with the settings of an existing card
                "price" in crop_info ? crop.price_proportion = crop_info.price : null;
                "yield" in crop_info ? crop.yield_proportion = crop_info.yield : null;
                "auto" in crop_info ? crop.auto_created = crop_info.auto : null;
                "region" in crop_info ? crop.region = crop_info.region : null;
                "name" in crop_info ? crop.name = crop_info.name : null;
                "is_original_crop" in crop_info ? crop.is_original_crop = crop_info.is_original_crop : null;
                this.selected_crops.push(crop)  // toggles the active flag for us
            },
            update_crop_data: function(crop_data){
              let current_crop = this.selected_crops.find(a_crop => a_crop.crop_code === crop_data.crop_code)
              current_crop.region = crop_data.region
              current_crop.name = current_crop.waterspout_data.name + " - " + crop_data.region.name;
              current_crop.crop_code = crop_data.id + " - " + this.crop.region.id;
              console.log("Crop Update: " + current_crop)
            },
            /*
             * Duplicate an available crop to select
             *
             * It might seem weird for us to duplicate a crop - why create a crop that doesn't exist?
             * We use this when we make region-linked crop cards - it duplicates the crop object to persist it
             * as it is now, then makes the changes (such as a new name) to the existing crop
             */
            duplicate_crop: function(crop, new_region){
              let new_crop = clonedeep(crop)

              let current_crop = this.available_crops.find(a_crop => a_crop.crop_code === crop.crop_code)

              if(current_crop.auto_created !== true){  // only deactivate the current crop if it's *not* auto_created. Auto-added crops stay as they are
                current_crop.active = false
                this.deactivate_crop()
              }
              new_crop.auto_created = false; // overwrite auto_created just in case it was set in the parent card.
              new_crop.crop_code = current_crop.waterspout_data.crop_code + "." + new_region.id;
              // new_crop.waterspout_data.crop_code = current_crop.waterspout_data.crop_code + "." + new_region.id;
              new_crop.waterspout_data.region = new_region;

              //console.log(`Activating ${crop.crop_code}`)
              //this.activate_crop({crop_id: crop.id, region: new_region})

              new_crop.active = false
              this.available_crops.push(new_crop);
              console.log(`Activating ${new_crop.crop_code}`)
              this.activate_crop({
                crop_code: new_crop.crop_code,
                region: new_region,
                name: crop.waterspout_data.name + " - " + new_region.name,
                is_original_crop: false})

              this.sort_by_name(this.available_crops); // sort the crop list so the new one shows in the right spot.
              return new_crop
            },
            /*
            * Region-linking of crops is a funky concept we have. Generally speaking, we'll specify crop parameters
            * model-wide, for all regions. But occasionally, people might need to control specific crops in specific
            * regions - the most granular settings we can provide. Given the setup of the application, we'll handle this
            * in a slightly funky way. When someone indicates they want to region-link crops, we'll duplicate that crop
            * object, then change its name and set the value for its region property. This way we can patch it into the
            * existing crop selection autocomplete, etc and it can be removed, etc, within the current session. If we
            * didn't do something like this, things could get funky. So, this method receives the event from an existing
            * crop card that says we need to region-link it, then handles the duplication process.
            *
            */
            make_region_linked_crop: function(args){
              let new_crop = this.duplicate_crop(args.crop, args.region)
              console.log(new_crop)
            },
            /*
             * Find Whether or not the all crops card crossed an individual crop's price/yield threshold
             * and create new crop cards, as appropriate with each crop at its own threshold
            */
            process_price_yield_threshold: function(new_values){
              console.log(new_values)

              // find crops that have a default thresholds *above* the value we just got from the all crops card

              let new_threshold = new_values.price * new_values.yield;
              this.last_allcrops_price_yield_threshold = new_threshold;
              if(new_threshold > this.lowest_price_yield_value){
                // right now, this code is pretty expensive - not sure how it'll do on lower-power devices. For some speedup:
                // if it's greater than previous values, set the new lowest to this value, then return - we don't need to examine crops.
                // if we make it so that people can't remove a crop whose threshold is higher than this, then we can even remove this
                // logic a bit for a greater speedup (just return, don't reset the threshold unless a crop is removed), because
                // then once something is added, it will *have* to stay until the threshold is increased
                this.lowest_price_yield_value = new_threshold;
                return
              }
              this.lowest_price_yield_value = new_threshold

              let higher_crops = Object.values(this.$store.getters.current_model_area.price_yield_corrections).filter(crop => typeof(crop) === "object" && crop.default > new_threshold)
              let _this = this;
              higher_crops.forEach(function(crop){
                // check if it's inactive right now
                let change_crop = _this.inactive_crops.find(found_crop => found_crop.waterspout_data.id === crop.crop_id)
                if(change_crop !== undefined){ // if we found it in the inactive crops list, activate the card, otherwise leave it alone
                  console.log(change_crop);
                  let new_price = new_values.price * 100;
                  let new_yield = new_values.yield * 100;

                  // Now increment one again - we're always getting the *current* values that actually violated our
                  // constraint, so we need to increment it slightly - just increment whichever one is lower - it might
                  // not be the same one they most recently changed, but it'll bring us in bounds without changing
                  // their input much - we could track which one last changed on the crop components, but it feels a bit
                  // like overkill right now.
                  new_price < new_yield ? new_price++ : new_yield++;

                  _this.activate_crop({crop_code: change_crop.crop_code, price: new_price, yield: new_yield, auto: true});
                }
              });
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
            /*
             * Given the current state of the model run, generates the JSON that will create it when
             * sent to the server.
             */
            get_model_run_creation_json(){
              let regions = this.selected_regions;
              let scaled_down_regions = [
                {  // add the default region info right off the bat
                  "region": null,
                  "land_proportion": this.default_region.land_proportion / 100,
                  "water_proportion": this.default_region.water_proportion / 100,
                  "rainfall_proportion": this.default_region.rainfall_proportion / 100
                }
              ];
              regions.forEach(function (region) {
                let new_region = {
                  "water_proportion": region.water_proportion / 100, // API deals in proportions, not percents
                  "rainfall_proportion": region.rainfall_proportion / 100, // API deals in proportions, not percents
                  "land_proportion": region.land_proportion / 100, // API deals in proportions, not percents
                  "modeled_type": region.modeled_type
                };
                if(region.is_group){
                  new_region["region_group"] = region.region_group.id;
                }else{
                  new_region["region"] = region.region.id;
                }
                scaled_down_regions.push(new_region);
              });

              let crops = this.selected_crops;
              let scaled_down_crops = [
                {  // add the default crop info right off the bat
                  "crop": null,
                  "price_proportion": this.default_crop.price_proportion / 100,
                  "yield_proportion": this.default_crop.yield_proportion / 100,
                  "min_land_area_proportion": this.default_crop.area_restrictions[0] / 100,
                  "max_land_area_proportion": this.default_crop.area_restrictions[1] !== null ? this.default_crop.area_restrictions[1] / 100 : null,
                }
              ];
              crops.forEach(function (crop) { // then iterate through all of the crop modifications and add them
                let new_crop = {
                  "crop": crop.waterspout_data.id,
                  "price_proportion": crop.price_proportion / 100,  // API deals in proportions, not percents
                  "yield_proportion": crop.yield_proportion / 100,  // API deals in proportions, not percents
                  "min_land_area_proportion": crop.area_restrictions[0] / 100,
                  "max_land_area_proportion": crop.area_restrictions[1] !== null ? crop.area_restrictions[1] / 100 : null,
                };
                if("region" in crop && crop.region !== undefined){
                  new_crop.region = crop.region.id
                }
                scaled_down_crops.push(new_crop);
              });


              let name = this.new_model_run_name ? this.new_model_run_name : null;
              let description = this.new_model_run_description ? this.new_model_run_description : null;

              let rainfall_set_id = null
              if(this.$store.getters.current_model_area.supports_rainfall === true) {
                rainfall_set_id = this.$store.getters.current_model_area.rainfall_data[0].id
              }

              let body = `{
                                "name": ${JSON.stringify(name)},
                                "description": ${JSON.stringify(description)},
                                "ready": true,
                                "organization": ${this.$store.getters.current_model_area.organization_id},
                                "calibration_set": ${this.$store.getters.current_model_area.calibration_data[0].id},
                                "rainfall_set": ${JSON.stringify(rainfall_set_id)},
                                "region_modifications": ${JSON.stringify(scaled_down_regions)},
                                "crop_modifications": ${JSON.stringify(scaled_down_crops)}
                            }`;

              return body;
            },
            /*
             * Updates the variable that stores/shows the model creation JSON on the page (when people
             * have access to this feature based on model area preferences.
             */
            update_model_run_creation_code: function() {
              this.show_model_run_creation_code = true;
              this.model_run_creation_code = this.get_model_run_creation_json();
            },
            run_model: function() {
                this.model_creation_failed_snackbar = false; // if they trigger this function, get rid of existing error notifications so new ones or success messages are obvious

                console.log("Creating Model Run");
                let headers = this.get_header();
                console.log(headers.values());

                let body = this.get_model_run_creation_json()

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
                let color_value = Math.round(((value - min) / (max - min)) * 200) // multiply times 200 instead of 255 for black to green to top out on a darker color
                // return {color: `rgb(${255-color_value}, 255, ${255-color_value})`}  // white to green color ramp
                return {color: `rgb(0, ${color_value}, 0)`}; // black to green color ramp
              }

              let region_object = this.selected_regions.find(a_region => a_region.region.id === feature.properties.id);
              let region_not_found_object = this.available_regions.find(a_region => a_region.region.id === feature.properties.id); // used for group lookups
              let limits = this.$store.getters.current_model_area.model_defaults;
              let variables_lookup = {"water_proportion": "water", "land_proportion": "land", "rainfall_proportion": "rainfall"}
              let variable = variables_lookup[this.map_style_attribute]

              // Get whether or not the current region supports the variable being displayed. If it doesn't, we'll want to remove it from the map
              let region_supports_variable = true; // default for if it's not a specific region or if it's for land - always supported
              if (region_object !== undefined && (variable === "water" || variable === "rainfall")){
                let lookup = variable === "water" ? "irrigation" : "rainfall"  // the API serves one thing as "irrigation", so make sure to change it here
                region_supports_variable = region_object.region["supports_" + lookup]
              }

              // get the list of region groups with cards that this region is a member of
              let groups_with_cards = [];
              if(region_not_found_object !== undefined) {
                groups_with_cards = region_not_found_object.region.groups.filter(group => this.selected_region_group_ids.includes(group))
              }

              // if we have a region card for this region and the region supports this type of adjustment, then get the color to display
              if(region_object !== undefined && region_supports_variable === true){
                return get_color(region_object[this.map_style_attribute], limits[`min_${variable}`], limits[`max_${variable}`])
              }else if(region_supports_variable === false) {  // if the region don't support the variable set it to a color that is fully transparent to make it disappear
                return {color: `rgba(255, 0, 0, 0)`}
              }else if(groups_with_cards.length > 0){  // otherwise, check if a group card is active for this region
                // get the first region group card that applies
                let region_group_object = this.selected_region_groups_display.filter(group => group.region_group.id === groups_with_cards[0])[0]
                return get_color(region_group_object[this.map_style_attribute], limits[`min_${variable}`], limits[`max_${variable}`])
              }else{  // otherwise this region is using the default region's settings
                return get_color(this.default_region[this.map_style_attribute], limits[`min_${variable}`], limits[`max_${variable}`])
              }
            },
            switch_map(variable){
              this.map_style_attribute = variable;
              this.refresh_map()  // force a refresh after we change the attribute to visualize by
            },
            sort_by_name: function(sa){
              sa.sort(function(a, b) {  // sort them by crop name
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
              return sa
            },
        },
        computed: {
            display_region_tab(){
              /* We do this to set the styling on the "Region" tab for the region card inputs. It's a cheap hack to not
                  need to make that code into a subcomponent (along with more signals/events) and to not have to duplicate
                  some markup with a lot of plumbing. We only want the tabs to display when we *have* groups to work with,
                  so just code it up as tabs, and hide the tab bar if we don't have any groups
               */
              return this.$store.getters.current_model_area.region_group_sets.length > 0 ? "display: flex" : "display: none";
            },
            active_regions: function() {
                // merge both active regions and groups here - this will get used whenever a region/group card is removed, so we need both to be merged here
                return this.available_regions.filter(region => region.active === true).concat(this.available_region_groups.filter(region_group => region_group.active === true));
            },
            inactive_regions: function() {
                return this.available_regions.filter(region => region.active === false);
            },
            active_crops: function() {
                return this.available_crops.filter(crop => crop.active === true);
            },
            inactive_crops: function() {
                //return this.available_crops.filter(crop => crop.active === false);
                let _this = this;
                // this is a dumb way to do this, but it's not working for crop.active filtering - my mental model seems to be messed up here
                // so instead, we'll look at each available crop, then look to see if it's selected. If it doesn't find one, then it's inactive.
                // sorry future me for nested arrow functions
                // also checks the the crop doesn't have a region defined - if it does, we don't want to auto-add it - it's not a requirement then.
                return this.available_crops.filter(crop => _this.selected_crops.find(sel_crop => sel_crop.crop_code === crop.crop_code && sel_crop.active === true) === undefined && (crop.region === null || crop.region === undefined));
            },
            results_download_url: function(){
                return `${this.$store.state.api_server_url}/api/model_runs/${this.last_model_run.id}/csv/`;
            },
            region_geojson: function(){
              return this.$stormchaser_utils.regions_as_geojson(this.available_regions.map(function(region){return region.region}), ["id", "name", "internal_id"])
              /*return {
                type: "FeatureCollection",
                features:this.available_regions.map(function (region) {
                  return JSON.parse(region.region.geometry);
                })
              }*/
            },
            review_region_data(){
              let all_regions = [this.default_region, ...this.selected_regions];
              return all_regions.map(function (region) {
                return {
                  id: region.region.id !== null ? region.region.id : 0,
                  name: region.is_group ? region.region_group.name : region.region.name,
                  land_proportion: region.land_proportion,
                  water_proportion: region.water_proportion,
                  rainfall_proportion: region.rainfall_proportion,
                  modeled_type: region.modeled_type,
                }
              })
            },
            review_crop_data(){
              let all_crops = [this.default_crop, ...this.selected_crops];
              return all_crops.map(function (crop) {
                return {
                  id: crop.crop_code !== null ? crop.crop_code : 0,
                  name: crop.name !== undefined ? crop.name : crop.waterspout_data.name,
                  price_proportion: crop.price_proportion,
                  yield_proportion: crop.yield_proportion,
                  min_land_area_proportion: crop.area_restrictions[0],
                  max_land_area_proportion: crop.area_restrictions[1],
                  region: "region" in crop ? crop.region.name : "",
                }
              })
            },
            map_center: function(){
              return [this.$store.getters.current_model_area.map_center_latitude, this.$store.getters.current_model_area.map_center_longitude]
            },
            map_zoom: function(){
              return this.$store.getters.current_model_area.map_default_zoom
            },
            card_limits: function(){
              return this.$store.getters.current_model_area.model_defaults;
            },
            model_supports_irrigation(){
              // if any region supports irrigation, include it in the all regions card
              return this.regions.some(reg => reg.supports_irrigation === true)
            },
            model_supports_rainfall(){
              // if any region supports rainfall, include it in the all regions card
              return this.regions.some(reg => reg.supports_rainfall === true)
            },
            map_variables(){
              let map_vars = [{key: 'land_proportion', text:'Land'},]
              if(this.$store.getters.current_model_area.supports_rainfall){
                map_vars.unshift({key: 'rainfall_proportion', text:'Rainfall'})
              }
              if(this.$store.getters.current_model_area.supports_irrigation){
                map_vars.unshift({key: 'water_proportion', text: 'Irrigation'})
              }
              return map_vars
            },
            selected_regions_display(){
              return this.selected_regions.filter(region => region.is_group === false)
            },
            selected_region_groups_display(){
              return this.selected_regions.filter(region => region.is_group)
            },
            selected_region_group_ids(){
              return this.selected_region_groups_display.map(function(region_group){
                return region_group.region_group.id
              })
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