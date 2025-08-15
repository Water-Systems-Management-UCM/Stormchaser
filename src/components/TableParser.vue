<template >
  <v-container >
    <v-row >
<!--   left   -->
      <v-col  >
        <v-container
            id="new_model_run"
            xs12 md12
            >
          <v-card>
            <v-divider></v-divider>
            <StormCardSlider
                  v-if="true"
                  v-model="default_region.water_proportion"
                  :initial_value=100
                  :min="50"
                  :max="100"
                  label="Water (%)"
                  :disabled="false"
                  disabled_message=""
                  :disabled_message_if="false"
              >
              </StormCardSlider>
              <v-switch
                label="Compare with Base Case"
                v-model="simple_diff_toggle"
                style="padding-left: 5px"
              ></v-switch>
            <v-container v-if="simple_diff_toggle">
              <RegionFilter
                  :region_selection_info="filter_region_selection_info"
                  :regions="sorted_regions"
                  @selected-regions="update_selected_regions"
              ></RegionFilter>
              <SimpleTableCompare
                  :compare_data="region_table_base_case"
                  :model_data="region_table_filtered"
                  :crop_list="crop_list"
                  :chart_variable="'xlandsc'"
                  :chart_options="map_variables"
                  :region_filters="filter_region_selection_info.selected_rows"
              ></SimpleTableCompare>
            </v-container>
            <v-row v-if="region_table_filtered">
              <DataViewer
                :model_data="region_table_filtered"
                :map_default_variable="'gross_revenue'"
                :map_variables="map_variables"
                :default_tab=0
                :default_chart_attribute="'gross_revenue'"
                :chart_attribute_options="visualize_attribute_options"
                :preferences="$store.getters.current_model_area.preferences"
                :table_headers="table_headers"
            ></DataViewer>
            </v-row>
          </v-card>
        </v-container>
      </v-col>
    </v-row>

  </v-container>
<!--    <v-snackbar-->
<!--        v-model="model_created_snackbar"-->
<!--        top-->
<!--        timeout="-1"-->
<!--    >-->
<!--      Model Run Created.-->
<!--      <v-btn-->
<!--          title-->
<!--          :to="{ name: 'model-run', params: { id: this.last_model_run.id }}"-->
<!--      >-->
<!--        Go to Model Run-->
<!--      </v-btn>-->
<!--      <v-btn-->
<!--        @click="reset_page()"-->
<!--      >-->
<!--        Clear Modifications-->
<!--      </v-btn>-->
<!--      <template #action="{ attrs }">-->
<!--        <v-btn-->
<!--            v-bind="$attrs"-->
<!--            @click="model_created_snackbar = false"-->
<!--        >-->
<!--          Close-->
<!--        </v-btn>-->
<!--      </template>-->
<!--    </v-snackbar>-->
<!--    <notification-snackbar-->
<!--        v-model="model_creation_failed_snackbar"-->
<!--        :error_text="model_creation_failed_text"-->
<!--        constant_snackbar_text="Could not create model run"-->
<!--    ></notification-snackbar>-->
</template>

<script>
import {defineComponent, ref} from 'vue';

import RegionCard from './RegionCard.vue';
import CropCard from './CropCard.vue';
import NotificationSnackbar from './NotificationSnackbar.vue';
import "leaflet/dist/leaflet.css"
import {LControl, LGeoJson, LMap, LTileLayer} from "@vue-leaflet/vue-leaflet";
import {get_term_for_locale} from '../store/terms.js'
import DataViewer from "./DataViewer.vue";
import Table from "../assets/scenario_50_100.json"
import StormCardRangeSlider from "./StormCardRangeSlider.vue";
import StormCardSlider from "./StormCardSlider.vue";
import SimpleTableCompare from "./SimpleTableCompare.vue";
import RegionFilter from "./RegionFilter.vue";


export default defineComponent({
  components: {
    StormCardSlider,
    StormCardRangeSlider,
    DataViewer,
    NotificationSnackbar,
    RegionCard,
    CropCard,
    LMap,
    LTileLayer,
    LGeoJson,
    LControl,
    SimpleTableCompare,
    RegionFilter
  },

  name: 'MakeModelRun',

  data: function(){
      return {
          default_region: ref({
            'region': {id: null, name: 'All Regions', internal_id: null, external_id: null},
            'land_proportion': 100,  // not actually proportions right now - they're percents and we'll make them proportions when we send them
            'water_proportion': 100,
            'rainfall_proportion': 100,
            'default': true,
            'active': true, // active by default - we need to make it unremovable too
          }),
          default_crop: {
              'waterspout_data': {crop_id: null, name: 'All Crops', crop_code: null, id: null},
              'crop_code': null,
              'yield_proportion': 100,
              'price_proportion': 100,
              'area_restrictions': [0,null], // 0 and -1 means no upper limit.
              'default': true,
              'active': true, // active by default - we need to make it unremovable too
          },
          region_modifications_headers: [
            {title: 'Region or Group Name', key: 'name' },
            {title: 'Land %', key: 'land_proportion' },
            {title: 'Irrigation %', key: 'water_proportion' },
            {title: 'Rainfall %', key: 'rainfall_proportion' },
            {title: 'Modeling', key: 'model_type' },
          ],

          region_modification_tab: 0,  // we'll track this so we can switch it, e.g. when they click on the map
          crop_modifications_headers: [
            {title: 'Crop', key: 'name' },
            this.$store.getters.current_model_area.preferences.region_linked_crops ? {title: 'Region', key: 'region' } : null,
            {title: 'Price %', key: 'price_proportion' },
            {title: 'Yield %', key: 'yield_proportion' },
            {title: 'Min Land Area %', key: 'min_land_area_proportion' },
            {title: 'Max Land Area %', key: 'max_land_area_proportion' },
          ].filter(item => item !== null),  // do it this way so we only show the region header when it's available
          selected_crops: [],
          sorted_selected_crops: [],
          last_model_run: {},
          new_model_run_name: null,
          new_model_run_description: null,
          model_created_snackbar: false,
          model_creation_failed_snackbar: false,
          model_creation_failed_text: null,
          map_tile_layer_url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          map_style_attribute: 'water_proportion',
          map_style_options: ['water_proportion', 'land_proportion'],
          map_geojson: {type: 'FeatureCollection', features: []},
          show_model_run_creation_code: false,
          model_run_creation_code: '',
          regions: [],
          available_regions: [],
          available_region_groups: [],
          available_crops: [],
          scrollInvoked: 0,
          density_setting_toggle: "",
          region_tab: null,
          region_table_filtered: ref([]),
          region_table_base_case: [],
          region_table: [],
          visualize_attribute_options: [
            {title: 'Land (ac)', value:'xlandsc', key: 'xlandsc', metric: 'ac land'},
            {title: 'Water (ac-ft/ac) (Only correct for single crop)', value:'xwatersc', key: 'xwatersc', metric: 'ac-ft/ac water (only correct for single crop)'},
            {title: 'Gross Revenue', value:'gross_revenue', key: 'gross_revenue', metric: '$ gross'},
            {title: 'TEST', value: 'test', key: 'tes'}
          ],
          table_headers: [
            {title: "Region", key:"region"},
            {title: "Crop Group", key:"crop"},
            {title: "Effective Price ($/ton)", key:"p"},
            {title: "Yield (ton/ac)", key:"y"},
            {title: "Land (ac)", key:"xland"},
            {title: "Water (ac-ft/ac)", key:"xwater"},
            {title: "Gross Revenue ($ USD)", key:"gross_revenue"},
          ],
          crop_list: [],
          region_list: [],
          map_variables: [
            {text: 'Land (ac)', value:'xlandsc', key: 'xlandsc', metric: 'ac land'},
            {text: 'Water (ac-ft/ac) (Only correct for single crop)', value:'xwatersc', key: 'xwatersc', metric: 'ac-ft/ac water (only correct for single crop)'},
            {text: 'Gross Revenue ($ USD)', value:'gross_revenue', key: 'gross_revenue', metric: '($ USD)'},
          ],
          simple_diff_toggle: false,
          filter_region_selection_info: {
            selected_rows: [],
            filter_selected_exclude: [],
            filter_mode_exclude: false,
            current_selection: function(){
              return this.filter_mode_exclude ? this.filter_selected_exclude : this.selected_rows
            }
          },
      };
  },

  created() {
    // this.set_regions();
    // this.set_crops();

    if(this.density_setting_toggle){ // Vue 3 new density mode: Added checker to change spacing on table
      this.density_setting_toggle = "compact";
    } else{
      this.density_setting_toggle = "default"
    }
  },

  mounted() {
    // this is a hack to fix that Vue2-leaflet won't load the map correctly until after a resize event is triggered. It'd be nice to remove it if we can find a better way
    setTimeout(function() { window.dispatchEvent(new Event('resize')) }, 250);
    this.map_geojson = this.region_geojson // initialize the map data and inject the internal_id property
    // setTimeout(this.refresh_map, 500);  // we used to trigger the map update loop - now we'll just trigger a refresh
    window.stormchaser.make_model_run_component = this;  // for debugging online.
    this.get_cutback_data();
    this.crop_list = [... this.$store.getters.current_model_area.crop_set]
    this.region_list = [... this.$store.getters.current_model_area.region_set]
    this.get_table_cutback()
    this.region_table_base_case = this.region_table_filtered; // Setting base case on mount since this is with no cutbacks

  },

  watch: {
    'default_region.water_proportion': function (newVal){
      this.default_region.water_proportion = newVal;
      this.get_table_cutback();
      // this.refresh_map()
    },

    selected_regions(new_array, old_array){
      this.update_selected(new_array, old_array)
      // console.log("new and old arr", new_array, old_array)
      // adding a region can change the size of the map frame, so trigger a resize event so it knows it's bigger
      setTimeout(function() { window.dispatchEvent(new Event('resize')) }, 250);
      // this.update_region_color()
      // this.refresh_map()  // when we add or remove regions, the map changes (because defaults get applied to regions)
    },
    selected_crops(new_array, old_array){
      this.update_selected(new_array, old_array)
      this.sorted_selected_crops = [...this.selected_crops]
      this.sort_by_name(this.selected_crops)
    },

    selected_regions_crop_pack(){
        if(this.selected_regions_crop_pack.length > 0){
          this.filter_model_run_records(this.selected_regions_crop_pack);
        }
      },
    selected_regions_groups(){
        let _this = this

        for(let i = 0; i < this.selected_regions_groups.length; i++){
          (this.selected_regions_groups[i].regions_in_group.forEach(r => {
            const matched_region = _this.available_regions.find(ele => ele.region.name === r.name)
            matched_region.is_group = true;
            matched_region.modeled_type = matched_region.region.default_behavior;
          }))
          this.selected_regions_groups[i].active = true;
        }
    },
  },

  methods: {
    get_cutback_data(){
      this.region_table = Table;
    },

    update_selected_regions(data){
      this.filter_region_selection_info.selected_rows = data
    },

    get_crop_region_name_code(crop_name, region){
      if(crop_name){
        for(let i = 0; i < this.crop_list.length; i++){
          if(this.crop_list[i].name === crop_name){
            delete this.crop_list[i].xland
            delete this.crop_list[i].xwater
            return this.crop_list[i].id;
          }
        }
      }
      if(region){
        for(let i = 0; i < this.region_list.length; i++){
          if(this.region_list[i].internal_id === region){
            delete this.region_list[i].xland
            delete this.region_list[i].xwater
            return this.region_list[i].id;
          }
        }
      }

    },

    get_table_cutback(){
      const cutback = (this.default_region.water_proportion / 100)
      let filtered_results = this.region_table.filter(region => region['Shortage_%'] === cutback);

      this.region_table_filtered = [...filtered_results];

      for(let i = 0; i < this.region_table_filtered.length; i++){
        this.region_table_filtered[i].crop = this.get_crop_region_name_code(this.region_table_filtered[i].crop)
        this.region_table_filtered[i].region = this.get_crop_region_name_code(null,this.region_table_filtered[i].region)
        this.region_table_filtered[i].gross_revenue = this.region_table_filtered[i].grevsc;
      }
    },
    reset_page(){
      location.replace(location.href.split('#')[0]);
      // this.set_regions();
      // this.set_crops();
      this.reset_model();
      this.default_region = {
        'region': {id: null, name: 'All Regions', internal_id: null, external_id: null},
        'land_proportion': 100,  // not actually proportions right now - they're percents and we'll make them proportions when we send them
        'water_proportion': 100,
        'rainfall_proportion': 100,
        'default': true,
        'active': true, // active by default - we need to make it unremovable too
      };

      this.default_crop = {
        'waterspout_data': {crop_id: null, name: 'All Crops', crop_code: null, id: null},
        'crop_code': null,
        'yield_proportion': 100,
        'price_proportion': 100,
        'area_restrictions': [0,null], // 0 and -1 means no upper limit.
        'default': true,
        'active': true, // active by default - we need to make it unremovable too
      };
      this.selected_regions = [];
      this.selected_crops = [];
      this.sorted_selected_crops = [];

      // this.get_model_run_creation_json();
    },
    term_for_locale(term){
      return get_term_for_locale(term)
    },
    onScroll() {
        this.scrollInvoked++
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
        if(!('is_deletable' in item) || item.is_deletable === true){
          // if it's currently deletable, we can just remove it
          // items have their own logic for removal - crops can't be removed if all crops is set below their price/yield threshold
          item.auto_created = false;
          item.active = false;
        }else{
          // otherwise, we're not allowed to remove it, so add it back
          item.active = true;  // reset the active flag if it was manually removed, so that the item shows correctly
          new_array.push(item)
          _this.$store.commit('app_notice', {message: 'Cannot remove some items - hover over the info button in the top right of their cards for more information', timeout: 5000})
        }
      })
    },

    deactivate_region: function(){
        console.log('Deactivating');
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
        'price' in crop_info ? crop.price_proportion = crop_info.price : null;
        'yield' in crop_info ? crop.yield_proportion = crop_info.yield : null;
        'auto' in crop_info ? crop.auto_created = crop_info.auto : null;
        'region' in crop_info ? crop.region = crop_info.region : null;
        'name' in crop_info ? crop.name = crop_info.name : null;
        'is_original_crop' in crop_info ? crop.is_original_crop = crop_info.is_original_crop : null;
        this.selected_crops.push(crop)  // toggles the active flag for us
    },

    reset_model: function() {
      // When the model has been successfully submitted, this function resets it so that it can be run again
      // We should consider whether we want it to remove *everything* or not since it might be beneficial for people
      // to have some things remain so they can make slight tweaks - maybe some kind of manual reset button instead?

      this.new_model_run_name = null;
      this.new_model_run_description = null;
    },

    switch_map(variable){
      this.map_style_attribute = variable;
      // this.refresh_map()  // force a refresh after we change the attribute to visualize by
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
    filter_model_run_records(){
        let crop_list = [];

        let temp_base_case = this.proxy_to_raw(this.$store.getters.base_case_results);

        this.selected_regions_crop_pack.forEach(({ region }) => {
          const region_id = region.id; // Obtaining a region's id

          const matching_regions = temp_base_case.filter(region_info => region_id === region_info.region); // Looking for all regions with ID from base case
          let crop_list = []
          matching_regions.forEach(crop_record => {
            const crop = this.available_crops.find(c => c.waterspout_data.id === crop_record.crop)

            this.make_region_linked_crop({"crop":crop, "region": region});
          });
        });

      },
  },

  computed: {
      sorted_regions(){
        return this.sort_by_name(this.$store.getters.current_model_area.region_set)
      },
      display_region_tab(){
        /* We do this to set the styling on the "Region" tab for the region card inputs. It's a cheap hack to not
            need to make that code into a subcomponent (along with more signals/events) and to not have to duplicate
            some markup with a lot of plumbing. We only want the tabs to display when we *have* groups to work with,
            so just code it up as tabs, and hide the tab bar if we don't have any groups
         */
        return this.$store.getters.current_model_area.region_group_sets.length > 0 ? 'display: flex' : 'display: none';
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
        return this.$stormchaser_utils.regions_as_geojson(this.available_regions.map(function(region){return region.region}), ['id', 'name', 'internal_id']);
      },
  },
});
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