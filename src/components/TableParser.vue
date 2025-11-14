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
            <!--     Two different sliders to handle the different increments for tables       -->
            <StormCardSlider
                  v-if="this.$store.getters.current_model_area.background_code === 'planning_area' || this.$store.getters.current_model_area.background_code === 'sldm' || $store.getters.current_model_area.background_code === 'outside_region'"
                  v-model="default_region.water_proportion"
                  :initial_value=100
                  :min="50"
                  :max="100"
                  label="Water (%)"
                  :disabled="false"
                  disabled_message=""
                  :disabled_message_if="false"
                  :step="5"
              >
            </StormCardSlider>
            <StormCardSlider
                  v-else
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
                :map_default_variable="'xlandsc'"
                :map_variables="map_variables"
                :default_tab=0
                :default_chart_attribute="'xlandsc'"
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
import CDFA_Table from "../assets/cdfa/cdfa_table.json"
import PA_Table from "../assets/pa_50_100.json"
import SLDM_Table from "../assets/sldm/results_sldm.json"
import Outside_Table from "../assets/outside_regions/outside_regions_50_100.json"
import StormCardRangeSlider from "./StormCardRangeSlider.vue";
import StormCardSlider from "./StormCardSlider.vue";
import SimpleTableCompare from "./SimpleTableCompare.vue";
import RegionFilter from "./RegionFilter.vue";
import MapViewer from "./MapViewer.vue";


export default defineComponent({
  components: {
    MapViewer,
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

  name: 'TableParser',

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
          base_case: [],
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
          map_tile_layer_options: [
            {
              text: 'Thunderforest Atlas',
              value: 'https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=2374da9f070e45098bff569aff92f377',
              attribution: 'Thunderforest and <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
            },
            {
              text: 'Thunderforest Mobile Atlas (High Contrast)',
              value: 'https://tile.thunderforest.com/mobile-atlas/{z}/{x}/{y}.png?apikey=2374da9f070e45098bff569aff92f377',
              attribution: 'Thunderforest and <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
            },
            {text: 'OSM Default',
              value: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
              attribution: '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
            },
            {text: 'MapTiler Satellite',
              value: 'https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=WHAyg8Il19PitcCcMYkS',
              attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
            },
          ],
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
            {title: 'Water (ac-ft/ac)', value:'xwatersc', key: 'xwatersc', metric: 'ac-ft/ac water'},
            {title: 'Gross Revenue', value:'gross_revenue', key: 'gross_revenue', metric: '$ gross'},
          ],
          table_headers: [
            {title: "Region", key:"region"},
            {title: "Crop Group", key:"crop"},
            {title: "Effective Price ($/ton)", key:"p"},
            {title: "Yield (ton/ac)", key:"y"},
            {title: "Land (ac)", key:"xlandsc"},
            {title: "Water (ac-ft/ac)", key:"xwatersc"},
            {title: "Gross Revenue ($ USD)", key:"gross_revenue"},
          ],
          crop_list: [... this.$store.getters.current_model_area.crop_set],
          region_list: [... this.$store.getters.current_model_area.region_set],
          map_variables: [
            {text: 'Land (ac)', value:'xlandsc', key: 'xlandsc', metric: 'ac land'},
            {text: 'Water (ac-ft/ac)', value:'xwatersc', key: 'xwatersc', metric: 'ac-ft/ac water'},
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
    if(this.$store.getters.current_model_area.background_code === 'cdfa'){
      this.get_region_id(); // this is needed because of an issue when loading regions, it would not take the region id
    }

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
      if(this.$store.getters.current_model_area.background_code === 'cdfa'){
        this.region_table = [...CDFA_Table, ...Table];
        return
      } else if(this.$store.getters.current_model_area.background_code === 'planning_area'){
        this.region_table = [...PA_Table];
        return
      } else if(this.$store.getters.current_model_area.background_code === 'sldm'){
        this.region_table = [...SLDM_Table];
        return
      } else if(this.$store.getters.current_model_area.background_code === 'outside_regions'){
        this.region_table = [...Outside_Table];
        return
      }

      this.region_table = [...Table];
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
          // console.log("DEBUG GET NAME", this.region_list[i].internal_id, region)
          if(this.region_list[i].name === region){
            delete this.region_list[i].xland
            delete this.region_list[i].xwater
            return this.region_list[i].id;
          }
        }
      }

    },

    get_table_cutback() {
      const cutback = this.default_region.water_proportion / 100;

      // Filter, but do NOT mutate original objects
      if(this.$store.getters.current_model_area.background_code === 'cdfa'){
        this.region_table = [...this.region_table];
      }
      let filtered_results = this.region_table.filter(
        region => Number(region['Shortage_%']) === cutback
      );

      if(this.base_case.length === 0 && cutback === 1){
        this.base_case = [...filtered_results]
      }

      // Map into an array of cloned + transformed objects

      this.region_table_filtered = filtered_results.map(row => {
        let name = this.get_crop_region_name_code(null, row.region);
        // console.log("DEBUG GET TABLe", row, filtered_results[0])
        // console.log('Row keys:', Object.keys(row));
        // console.log('DEBUG name result:', name);
        return {
          ...row, // clone existing row props first
          region: name,
          crop: this.get_crop_region_name_code(row.crop),
          gross_revenue: row.grevsc
        };

      });

    },

    term_for_locale(term){
      return get_term_for_locale(term)
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

    reset_model: function() {
      // When the model has been successfully submitted, this function resets it so that it can be run again
      // We should consider whether we want it to remove *everything* or not since it might be beneficial for people
      // to have some things remain so they can make slight tweaks - maybe some kind of manual reset button instead?

      this.new_model_run_name = null;
      this.new_model_run_description = null;
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

        let temp_base_case = this.base_case;

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
    get_region_id() {
      const regions = this.$store.getters.current_model_area.regions;

      // Map: used for linking region names to IDs
      const lookup = {};
      Object.entries(regions).forEach(([id, region]) => {
        lookup[region.name] = Number(id);
      });

      // Search map to look for sub string of region name
      const updatedArr = this.region_table.map(item => {
        // Find the first key in lookup that contains item.region
        const matchKey = Object.keys(lookup).find(key =>
          key.toLowerCase().includes(item.region.toLowerCase())
        );

        if (matchKey) {
          return { ...item, region: lookup[matchKey] };
        }
        return item;
      });
      this.region_table = updatedArr;
    }
  },

  computed: {
      sorted_regions(){
        return this.sort_by_name(this.$store.getters.current_model_area.region_set)
      },
      active_regions: function() {
          // merge both active regions and groups here - this will get used whenever a region/group card is removed, so we need both to be merged here
          return this.available_regions.filter(region => region.active === true).concat(this.available_region_groups.filter(region_group => region_group.active === true));
      },

      active_crops: function() {
          return this.available_crops.filter(crop => crop.active === true);
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