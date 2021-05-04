<template>
  <v-container>
    <v-row>
      <v-row>
      <v-col class="col-12 col-md-4"
             v-if="filter_allowed('crop_multi')">
        <h4>Filter to Crop</h4>
        <v-autocomplete
            v-model="filter_selected_crops"
            :items="unique_crops"
            label="Filter to Crop"
            persistent-hint
            solo
            clearable
            multiple
            chips
            deletable-chips
        ></v-autocomplete>
      </v-col>
      <v-col class="col-12 col-md-4"
             v-if="((selected_tab === TABLE_TAB || selected_tab === SUMMARY_TAB) && unique_years.length > 2) || (!(selected_tab === TABLE_TAB || selected_tab === SUMMARY_TAB) && unique_years.length > 1)">
        <h4>Filter to Year</h4>
        <v-autocomplete
            v-model="filter_selected_year"
            :items="unique_years"
            label="Filter to Year"
            persistent-hint
            solo
        ></v-autocomplete>
      </v-col>
      <v-col class="col-12 col-md-4"
        v-if="filter_allowed('region_multi_standalone') && preferences.allow_viz_region_filter">
        <h4>{{ filter_region_selection_info.filter_mode_exclude ? "Exclude Regions" : "Filter to Regions" }}</h4>
        <!--<v-autocomplete
            v-model="filter_selected_region"
            :items="unique_regions"
            label="Filter to Region"
            persistent-hint
            solo
        ></v-autocomplete>-->
        <MultiItemFilter
          :shared_state="filter_region_selection_info"
          :input_rows="sorted_regions"
          item_text="name"
          item_value="id"
          base_label_text="Regions"
          :solo="true"
          :excludable="filter_region_selection_info.filter_mode_exclude"
        ></MultiItemFilter>
      </v-col>
      <v-col class="col-12 col-md-4"
             v-if="selected_tab === CHART_TAB && has_additional_chart_options">
        <h4>Visualization Options</h4>
        <v-expansion-panels accordion>
          <v-expansion-panel v-if="preferences.allow_viz_multiple_comparisons && comparison_options !== undefined && comparison_options.length > 0">
            <v-expansion-panel-header>Add/Change Comparison Model Runs</v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-autocomplete
                  v-model="selected_comparisons"
                  :items="comparison_options"
                  label="Comparison Runs"
                  item-value="id"
                  item-text="name"
                  return-object
                  persistent-hint
                  multiple
                  clearable
                  deletable-chips
                  chips
              ></v-autocomplete>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel v-if="preferences.allow_viz_normalization && comparison_options !== undefined && comparison_options.length > 0">
            <v-expansion-panel-header>Change Baseline/Normalization</v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-autocomplete
                  v-model="normalize_to_model_run_pre_retrieve"
                  :items="comparison_options"
                  label="Normalize To Model Run"
                  item-value="id"
                  item-text="name"
                  return-object
                  persistent-hint
                  clearable
                  deletable-chips
                  chips
              ></v-autocomplete>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel v-if="preferences.allow_viz_region_filter">
            <v-expansion-panel-header>Filter Regions<span v-if="filter_region_selection_info.selected_rows.length > 0" style="padding-left: 0.5em;display:inline-block">({{ filter_region_selection_info.selected_rows.length }})</span></v-expansion-panel-header>
            <v-expansion-panel-content>
              <MultiItemFilter
                  :shared_state="filter_region_selection_info"
                  :input_rows="sorted_regions"
                  item_text="name"
                  item_value="id"
                  base_label_text="Regions"
                  :excludable="true"
                  :solo="false"
              ></MultiItemFilter>
              <!--<p><a @click="filter_chart_selected_regions=sorted_regions">Select All</a>, <a @click="filter_chart_selected_regions = []">Select None</a></p>-->
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
      <v-col class="col-12 col-md-4"
               v-if="filter_allowed('parameter')">
          <h4 v-if="selected_tab === MAP_TAB">Map Value</h4>
          <h4 v-if="selected_tab === CHART_TAB">Plot Value</h4>
          <v-autocomplete
              v-model="map_selected_variable"
              :items="map_variables"
              label="Map Variable"
              persistent-hint
              solo
          ></v-autocomplete>
      </v-col>
      <v-col class="col-12 col-md-4"
             id="stacked_charts_switch"
             v-if="filter_allowed('stack')">
        <v-row>
          <v-col class="col-12">
            <h4>Stack Bars by Crop</h4>
            <v-switch
                v-model="charts_stacked_bars"
                label="Stack Bars by Crop"
            ></v-switch>
          </v-col>
        </v-row>
        <v-row
            v-if="has_rainfall_data">
          <v-col class="col-12">
            <!--  v-if="filter_allowed('stack') || has_rainfall_data"
            >-->
            <h4>Include Data</h4>
            <v-btn-toggle
                dark
                v-model="toggle_data_include"
                dense
                background-color="primary"
                multiple
            >
              <v-btn
                  v-if="has_rainfall_data"
                  v-model="data_include_rainfall"
              >
                <v-icon>mdi-weather-pouring</v-icon> Nonirrigated
              </v-btn>

              <v-btn
                  v-if="has_rainfall_data"
                  v-model="data_include_irrigated"
                  :input-value="data_include_irrigated"
              >
                <v-icon>mdi-water-pump</v-icon> Irrigated
              </v-btn>

              <!--<v-btn
                  v-model="charts_stacked_bars"
                  v-if="filter_allowed('stack')">
                <v-icon>mdi-chart-bar-stacked</v-icon> Stack Bars
              </v-btn>-->
            </v-btn-toggle>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
      <v-tabs
          active-class="active_tab"
          v-model="selected_tab">
        <v-tab href="#sc-data-viewer-chart">Charts</v-tab>
        <v-tab href="#sc-data-viewer-map">Map</v-tab>
        <v-tab href="#sc-data-viewer-summary" v-if="has_multipliers">Summary</v-tab>
        <v-tab href="#sc-data-viewer-table">Table</v-tab>
        <v-tab-item
            value="sc-data-viewer-chart">
          <ResultsVisualizerBasic
              :model_data="full_data_filtered"
              :visualize_attribute="map_selected_variable"
              :visualize_attribute_options="chart_attribute_options"
              :stacked="charts_stacked_bars"
              :comparison_items="selected_comparisons_full_filtered"
              :normalize_to_model_run="normalize_to_model_run"
              :filter_regions="filter_region_selection_info.filter_mode_exclude ? filter_region_selection_info.filter_selected_exclude : filter_region_selection_info.selected_rows"
          ></ResultsVisualizerBasic>
        </v-tab-item>
        <v-tab-item value="sc-data-viewer-map">
          <v-row>
            <v-col class="col-12">
              <p>Select values from the dropdowns above to display data on the map</p>
              <l-map
                  :center="map_center"
                  :zoom="map_zoom"
                  style="height: 500px;"
              >
                <l-tile-layer :url="map_tile_layer_url"
                              :attribution="map_attribution"
                ></l-tile-layer>
                <l-choropleth-layer
                    :data="map_model_data"
                    titleKey="name"
                    idKey="region"
                    :value="map_value"
                    :extraValues="extra_hover_values"
                    geojsonIdKey="id"
                    :geojson="map_geojson"
                    :colorScale="color_scale"
                    strokeColor="#999"
                    :strokeWidth=0
                >
                  <template slot-scope="props">
                    <l-info-control
                        class="sc-leaflet_control"
                        title="Region Data"
                        :item="props.currentItem"
                        :unit="props.unit"
                        placeholder="Select variables (top), then hover over a region for values"/>
                    <l-reference-chart
                        class="sc-leaflet_control"
                        :title="map_color_scale_title"
                        :colorScale="color_scale"
                        :min="Math.round(props.min)"
                        :max="Math.round(props.max)"
                        position="topright"/>
                  </template>
                </l-choropleth-layer>
                <l-control class="basemap_options" position="bottomright">  <!-- Controls to switch which variable it's using to render -->
                  <v-select
                    v-model="map_tile_layer_url"
                    :items="map_tile_layer_options"
                    label="Basemap"
                    ></v-select>
                </l-control>
              </l-map>
            </v-col>
          </v-row>
        </v-tab-item>
        <v-tab-item value="sc-data-viewer-summary" v-if="has_multipliers">
          <p class="warning stormchaser_missing_multipliers_warning"
              v-if="records_missing_multipliers > 0"
          >
            <v-icon>warning</v-icon>
            Warning: Some records do not have indirect, value add, or employment data. Estimates may be lowered as a result.
          </p>
          <v-data-table
              :headers="[{text: 'Variable', value: 'name' },{text: 'Direct', value: 'direct'}, {text:'Indirect', value: 'indirect'}]"
              :items="summary_data"
              item-key="variable"
              class="elevation-1">
              <template v-slot:item.direct="{ item }">
                <span>{{ item.name === "Jobs" ? general_number_formatter.format(item.direct) : format_currency(item.direct) }}</span>
              </template>
              <template v-slot:item.indirect="{ item }">
                <span>{{ item.name === "Jobs" ? general_number_formatter.format(item.indirect) : format_currency(item.indirect) }}</span>
              </template>
          </v-data-table>
        </v-tab-item>
        <v-tab-item value="sc-data-viewer-table">
          <v-data-table
              :headers="table_headers"
              :items="full_data_filtered"
              item-key="id"
              multi-sort
              sort-by="region,crop,year"
              sort-desc
              class="elevation-1"
              :items-per-page="50"
          >
            <template v-slot:item.region="{ item }">
              <span class="region_name">{{ $store.getters.get_region_name_by_id(item.region) }}</span>
            </template>
            <template v-slot:item.crop="{ item }">
              <span class="crop_name">{{ $store.getters.get_crop_name_by_id(item.crop) }}</span>
            </template>
            <template v-slot:item.p="{ item }"> <!-- `$${Number(Math.round(Number(item.p + "e2")) + "e-2")}` -->
              <span class="price">{{ format_currency(item.p) }}</span>
            </template>
            <template v-slot:item.omegaland="{ item }"> <!-- `$${Number(Math.round(Number(item.p + "e2")) + "e-2")}` -->
              <span>{{ format_currency(item.omegaland) }}</span>
            </template>
            <template v-slot:item.omegasupply="{ item }"> <!-- `$${Number(Math.round(Number(item.p + "e2")) + "e-2")}` -->
              <span>{{ format_currency(item.omegasupply) }}</span>
            </template>
            <template v-slot:item.omegalabor="{ item }"> <!-- `$${Number(Math.round(Number(item.p + "e2")) + "e-2")}` -->
              <span>{{ format_currency(item.omegalabor) }}</span>
            </template>
            <template v-slot:item.omegatotal="{ item }"> <!-- `$${Number(Math.round(Number(item.p + "e2")) + "e-2")}` -->
              <span>{{ format_currency(item.omegatotal) }}</span>
            </template>
            <template v-slot:item.y="{ item }"> <!--  -->
              <span class="yield">{{ Number(Math.round(Number(item.y + "e2")) + "e-2") }}</span>
            </template>
            <template v-slot:item.xland="{ item }"> <!--  -->
              <span class="land">{{ general_number_formatter.format(item.xland) }}</span>
            </template>
            <template v-slot:item.xwater="{ item }"> <!--  -->
              <span class="water">{{ Number(Math.round(Number(item.xwater + "e2")) + "e-2") }}</span>
            </template>
            <template v-slot:item.xlandsc="{ item }">
              <span class="xlandsc">{{ general_number_formatter.format(item.xlandsc) }}</span>
            </template>
            <template v-slot:item.gross_revenue="{ item }">
              <span class="gross_revenue">{{ format_currency(item.gross_revenue) }}</span>
            </template>
            <template v-slot:item.net_revenue="{ item }">
              <span class="net_revenue">{{ format_currency(item.net_revenue) }}</span>
            </template>
            <template v-slot:item.water_per_acre="{ item }">
              <span class="water_per_acre">{{ Number(Math.round(Number(item.water_per_acre + "e2")) + "e-2") }}</span>
            </template>
            <template v-slot:item.xwatersc="{ item }">
              <span class="xwatersc">{{ general_number_formatter.format(item.xwatersc) }}</span>
            </template>
          </v-data-table>
        </v-tab-item>
      </v-tabs>
      <p id="stormchaser_filter_count_text">Filters returned {{ full_data_filtered.length }} records</p>
    </v-row>
    <v-row style="margin-top:1em">
      <v-btn
          v-if="download_name"
          @click="download_data"><v-icon>mdi-download</v-icon>Download Data as CSV</v-btn>
    </v-row>
  </v-container>
</template>

<script>
import _ from 'lodash'
import { LMap, LTileLayer, LControl } from 'vue2-leaflet'
import {  InfoControl, ReferenceChart, ChoroplethLayer } from 'vue-choropleth'
import ResultsVisualizerBasic from "@/components/ResultsVisualizerBasic";
import MultiItemFilter from "@/components/MultiItemFilter";

export default {
  name: "DataViewer",
  components: {
    MultiItemFilter,
    LMap,
    LControl,
    'l-info-control': InfoControl,
    'l-reference-chart': ReferenceChart,
    'l-choropleth-layer': ChoroplethLayer,
    LTileLayer,
    ResultsVisualizerBasic
  },
  props:{
    table_headers: Array,
    model_data: Array,
    rainfall_data: Array,
    map_default_variable: String,
    map_variables: Array,
    default_tab: Number,
    default_chart_attribute: String,
    chart_attribute_options: Array,
    download_name: String,
    download_lookups: Array,
    download_drop_fields: Array,
    comparison_options: Array, // which items will we compare this model run to?
    preferences: Object, // model area preferences object
  },
  data: function(){
      return {
        MAP_TAB: "sc-data-viewer-map",
        TABLE_TAB: "sc-data-viewer-table",
        CHART_TAB: "sc-data-viewer-chart",
        SUMMARY_TAB: "sc-data-viewer-summary",
        records_missing_multipliers: 0,  // how many records don't have multiplier values?
        multiplier_names: ["gross_revenue", "total_revenue", "direct_value_add", "total_value_add", "direct_jobs", "total_jobs"],
        charts_stacked_bars: false,
        toggle_data_include: [0,1], // include PMP and rainfall data by default
        selected_comparisons: [],
        selected_comparisons_full: [],
        normalize_to_model_run: null,
        normalize_to_model_run_pre_retrieve: null,  // we sync the control with this, then update normalize_to_model_run once we have results
        selected_tab: 0,
        map_geojson: {type: "FeatureCollection", features: []},
        map_selected_variable: null,
        map_tile_layer_url: 'https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
        map_tile_layer_options: [
          {text: "OSM Mapnik BW",
            value: 'https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
            attribution:"\u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e"
          },
          {text: "Stamen Toner Lite",
            value: 'https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png',
            attribution:"Map tiles by <a href=\"http://stamen.com\">Stamen Design</a>, under <a href=\"http://creativecommons.org/licenses/by/3.0\">CC BY 3.0</a>. Data by <a href=\"http://openstreetmap.org\">OpenStreetMap</a>, under <a href=\"http://www.openstreetmap.org/copyright\">ODbL</a>."
          },
          {text: "OSM Default",
            value: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: "\u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e",
          },
          {text: "MapTiler Satellite",
            value: 'https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=WHAyg8Il19PitcCcMYkS',
            attribution: '\u003ca href="https://www.maptiler.com/copyright/" target="_blank"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href="https://www.openstreetmap.org/copyright" target="_blank"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e'
          },
        ],
        old_map_tile_layer_url: '',
        filter_selected_years: [],
        filter_selected_crops: [],
        filter_selected_region: "any",  // defunct
        filter_chart_selected_regions: [],
        filter_chart_selected_regions_exclude: [], // which regions should be shown if we're in exclude mode - should be mutally exclusive with filter_chart_selected_regions
        filter_chart_selected_regions_mode: false, // is this an exclude filter or an include filter?
        filter_region_selection_info: {
          selected_rows: [],
          filter_selected_exclude: [],
          filter_mode_exclude: false,
          current_selection: function(){
            return this.filter_mode_exclude ? this.filter_selected_exclude : this.selected_rows
          }
        }, //{exclude_mode: false, selection_length: 0},
        color_scale: ["e7d090", "e9ae7b", "de7062"],
        currency_formatter: new Intl.NumberFormat(navigator.languages, { style: 'currency', currency: 'USD', maximumSignificantDigits: 6, maximumFractionDigits: 0}),  // format for current locale and round to whole dollars
        general_number_formatter: new Intl.NumberFormat(navigator.languages, { maximumFractionDigits: 0, maximumSignificantDigits: 6})  // format for current locale and round to whole dollars

      }
  },
  mounted() {
    this.map_geojson = this.region_geojson;  // do this at mount so we can mess with the geojson later
    this.selected_tab = this.default_tab
    this.map_selected_variable = this.map_default_variable

    // we add it this way upon mounting because otherwise we risk the prospect that we don't have the base model
    // run results yet and the app won't update once we have them.
    let _this = this;
    this.$store.dispatch('get_model_run_with_results', this.$store.getters.current_model_area.base_model_run.id).then(function (model_run) {
      _this.selected_comparisons.push(model_run)
    })
  },
  watch: {
    selected_comparisons:{
      deep:true,
      handler: function(){
        this.check_normalize_and_comparisons()
        // we watch comparison_items and when anything changes, we trigger a check to see if we've already retrieved
        // results for the selected model run - only retrieving them when the user selects the model run. We do
        // this in the watcher and push to a new array because in a computed property, the async updates create
        // problems.
        console.log("updating comparison data")
        let _this = this;
        this.selected_comparisons_full = []
        this.selected_comparisons.forEach(function(item) {  // then add them back based on what's currently chosen
          _this.$store.dispatch('get_model_run_with_results', item.id).then(function (model_run) {
            // retrieves the model run from the $store. If we already have results, returns it quickly, otherwise
            // it retrieves the results and only returns once we have them.
            //if(!(model_run.id === _this.normalize_to_model_run.id)){
            // only push it if it's not the normalization run. We'll still want to make sure we have the results though
            _this.selected_comparisons_full.push(model_run)
          })
        })
      }
    },
    normalize_to_model_run_pre_retrieve: {
      handler: function(){
        this.check_normalize_and_comparisons()

        if(this.normalize_to_model_run_pre_retrieve === null){
          this.normalize_to_model_run = null;
        }else{
          // now we once again need to make sure we have data before changing the controls
          let _this = this;
          this.$store.dispatch('get_model_run_with_results', this.normalize_to_model_run_pre_retrieve.id).then(function (model_run) {
            _this.normalize_to_model_run = model_run
          })
        }
      }
    },
    filter_chart_selected_regions: {
      handler: function() {
        this.update_excluded_regions()
      },
    },
    filter_chart_selected_regions_mode: {
      handler: function () {
        this.update_excluded_regions()
      }
    }
  },
  methods:{
    format_currency(value){
      return this.currency_formatter.format(value)
    },
    filter_allowed(item){
      let allowed_tabs = {
        "region_single": [],
        "region_multi": [this.CHART_TAB],
        "region_multi_standalone": [this.SUMMARY_TAB, this.TABLE_TAB],
        "crop_multi": [this.MAP_TAB, this.TABLE_TAB, this.SUMMARY_TAB],
        "years": [],
        "parameter": [this.MAP_TAB, this.CHART_TAB],
        "stack": [this.CHART_TAB]
      }

      return allowed_tabs[item].findIndex(tab => tab === this.selected_tab) > -1
    },
    update_excluded_regions(){
      // if filter_chart_selected_regions_mode is false, we're in include mode not exclude mode.
      if(!this.filter_chart_selected_regions_mode){
        return;
      }

      // created the inverted selection = filter all the regions and find the ones that aren't in the selected regions list
      this.filter_chart_selected_regions_exclude = this.sorted_regions.filter(reg => !this.filter_chart_selected_regions.some(sel_reg => sel_reg.id === reg.id))
    },
    /*
     * Check the normalize and comparison options for conflicts
     *
     * When someone adds a normalization model run, it could also be in the comparisons - we should remove it
     * from comparisons if found in order to prevent weird gaps in the charts.
     */
    check_normalize_and_comparisons(){
      if(this.normalize_to_model_run_pre_retrieve === null){
        return;
      }
      let index_of_normalize_run = this.selected_comparisons.findIndex(comp => comp.id === this.normalize_to_model_run_pre_retrieve.id);
      if(index_of_normalize_run > -1){
        // if we found the normalize run in the selected comparisons, remove it
        this.$store.commit('app_notice', {message: "Removed normalization model run from comparison runs - can't use in both places", timeout: 5000})
        this.selected_comparisons.splice(index_of_normalize_run, 1)
      }
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
    download_data(){
      this.$stormchaser_utils.download_array_as_csv({data: this.model_data,
        filename: this.download_name,
        lookups: this.download_lookups,
        drop_fields: this.download_drop_fields,
      })
    },
    schedule_refresh(){
      setTimeout(this.refresh_map, 250)
    },
    refresh_map(){
      this.map_geojson.features.push({})
      this.map_geojson.features.pop();
    },
    unique_items_list: function(property, text_lookup_function){

      let the_set = new Set(this.model_data.map(function(record){
        return record[property]
      }))

      let output_items = []
      the_set.forEach(function(record){
        let text = ""
        text_lookup_function ? text = text_lookup_function(record) : text = record;
        output_items.push({text: text, value: record})}
      )
      return output_items

      /*
      let items = this.model_data.map(function(record){
        let text = ""
        text_lookup_function ? text = text_lookup_function(record[text_property]) : text = record[text_property];
        return {text: text, value: record[value_property]}}
      )
      if(this.selected_tab === 1){ // if we're on the data table tab, start items with an "any" value - not for the map
        items.unshift({text: "Any", value: "any"})
      }
      let output_items = [];
      new Set(items).forEach(item => {output_items.push(item)})
      return output_items;
      // for some reason Array.from doesn't exist within this application. Is something modifying the prototype???
      //return Array.from(new Set(this.model_data.map(record => {return record["property"]}))) */
    },
    get_empty_region_multipliers(){
      // return an empty object of multipliers if they weren't found at all
      let mults = this.multiplier_names.reduce((mults, name) => (mults[name] = 0, mults), {})
      mults["gross_revenue"] = 1
      return mults
    },
    get_region_multipliers(region_id){
      let region_multipliers = this.$store.getters.current_model_area.regions[region_id].multipliers
      let _this = this;

      if(region_multipliers === null || region_multipliers === undefined){
        this.records_missing_multipliers++;
        return this.get_empty_region_multipliers()
      }
      region_multipliers["gross_revenue"] = 1;

      // make sure they're all numerical
      this.multiplier_names.forEach(function(mult){
        if(region_multipliers[mult] !== null && region_multipliers[mult] !== undefined) {
          region_multipliers[mult] = Number(region_multipliers[mult])  // set a value here so that a missing record isn't invalidating the rest of the math, we'll display a warning message
        }
      })

      // now check that all the individual keys are defined - if not, we'll mark a missing multiplier before returning
      this.multiplier_names.forEach(function(mult){
        if(region_multipliers[mult] === null || region_multipliers[mult] === undefined) {
          _this.records_missing_multipliers++;
          region_multipliers[mult] = 0  // set a value here so that a missing record isn't invalidating the rest of the math, we'll display a warning message
          return region_multipliers; // return immediately so that we only mark it as missing once for the record
        }
      })

      return region_multipliers
    },
    reduce_by_region(accumulator, raw_value){  // sums values for a crop across region results
      let region = raw_value.region;
      let _this = this;
      if (!(region in accumulator)){
        accumulator[region] = {}
        accumulator[region].name = _this.$store.getters.current_model_area.regions[region].name
        accumulator[region].region = region
        this.map_variables.forEach(function(variable){
          accumulator[region][variable.key] = Number(raw_value[variable.key]);
        })
      }else{
        this.map_variables.forEach(function(variable){
          accumulator[region][variable.key] = accumulator[region][variable.key] + Number(raw_value[variable.key]);
        })

      }
      return accumulator;
    },
    get_region_sums_for_filtered_records(results){
      let region_values = {};
      let accumulated = results.reduce(this.reduce_by_region, region_values)
      return Object.values(accumulated)
    },
    filter_model_run_records(model_run_pmp_data, model_run_rainfall_data){
      let _this = this
      let selected_regions = this.filter_region_selection_info.filter_mode_exclude ? this.filter_region_selection_info.filter_selected_exclude : this.filter_region_selection_info.selected_rows

      // if the controls specify to include irrigated data, start with that, otherwise start with an empty array
      let base_data = this.data_include_irrigated === true ? model_run_pmp_data : []
      // then if they want the rainfed ag data, include that too
      // there might be a better way to do this than with a double spread
      if(this.data_include_rainfall && model_run_rainfall_data !== null && model_run_rainfall_data !== undefined){
        base_data = [...base_data, ...model_run_rainfall_data]
      }

      return base_data.filter(function(record){
        // basically an AND filter
        // Check that the filter is currently allowed/active, then check if there's a selection active, then actually filter the records to the matching selections.
        // If the filter isn't allowed, then it returns all records for that type (years/regions/crops), and if nothing is
        // selected, then it also assumes inclusion of all records for that type. So the filter needs to be allowed and have items
        // chosen in order to filter the output set.
        return (!_this.filter_allowed('years') || _this.filter_selected_years.length === 0 || _this.filter_selected_years.some(year_sel => year_sel === record.year)) &&
            (!(_this.filter_allowed('region_multi') || _this.filter_allowed('region_multi_standalone')) || selected_regions.length === 0 || selected_regions.some(reg_sel => reg_sel.id === record.region)) &&
            (!_this.filter_allowed('crop_multi') || _this.filter_selected_crops.length === 0 || _this.filter_selected_crops.some(crop_sel => crop_sel === record.crop))
      })
    }
  },
  computed: {
    has_multipliers: function(){
      return this.$store.getters.current_model_area.region_set.some(region => "multipliers" in region)
    },
    has_rainfall_data: function(){
      return this.rainfall_data !== null && this.rainfall_data !== undefined
    },
    selected_comparisons_full_filtered(){
      let _this = this;
      return this.selected_comparisons_full.map(function(model_run){
        let model_run_data = _.cloneDeep(model_run) // clone it because we're going to overwrite results since the ResultsVisualizerBasic uses the whole structure. If we didn't clone then the next update would be incorrect (it would accumulate updates)
        model_run_data.results[0].result_set = _this.filter_model_run_records(model_run_data.results[0].result_set, model_run_data.results[0].rainfall_result_set)
        return model_run_data
      })
    },
    data_include_rainfall: function(){
      return this.toggle_data_include.indexOf(0) > -1
    },
    data_include_irrigated: function(){
      return this.toggle_data_include.indexOf(1) > -1
    },
    region_geojson: function(){
      return this.$stormchaser_utils.regions_as_geojson(this.$store.getters.current_model_area.regions, ["id", "name"])
    },
    /*
     * For use as an input to other filtering functions
     */
    year_filtered_base_data: function(){
      let filtered_data = this.model_data;
      let _this = this
      if (this.unique_years.length > 1) {  // if we have more than one year, then filter by year, otherwise keep it all
        filtered_data = filtered_data.filter(record => record.year === _this.filter_selected_year)
      }
      return filtered_data
    },
    map_model_data: function(){
      return this.get_region_sums_for_filtered_records(this.full_data_filtered)

      /*let _this = this
      return this.full_data_filtered.map(function(record){  // attach the region name to the map data
        record.name = _this.$store.getters.current_model_area.regions[record.region].name
        return record
      });*/
    },
    /*table_model_data: function(){
      let _this = this
      return this.model_data.filter(function(record){
        return (_this.filter_selected_year === "any" || record.year === _this.filter_selected_year) &&
            (_this.filter_chart_selected_regions.length === 0 || _this.filter_chart_selected_regions.some(reg_sel => reg_sel.id === record.region)) &&
            (_this.filter_selected_crop === "any" || record.crop === _this.filter_selected_crop)
      })
    },*/
    full_data_filtered: function(){
      /*
        Doesn't currently apply to the chart as of 4/30/2021
       */
      return this.filter_model_run_records(this.model_data, this.rainfall_data)

    },
    chart_model_data: function(){
      let _this = this;
      console.log(`Unique Years: ${this.unique_years.length}`)
      if (this.unique_years.length === 1){
        let base_data = this.model_data
        if(this.rainfall_data !== null && this.rainfall_data !== undefined){
          base_data = [...base_data, ...this.rainfall_data]
        }
        return base_data
      }else{
        return this.model_data.filter(record => record.year === _this.filter_selected_year);
      }
    },
    summary_data: function(){
      let result_accumulator = this.get_empty_region_multipliers()

      let _this = this;
      this.full_data_filtered.reduce(function(accumulator, result){
        let multipliers = _this.get_region_multipliers(result.region);
        _this.multiplier_names.forEach(function(mult){
          accumulator[mult] += result.gross_revenue * multipliers[mult]
        })
        return accumulator
      }, result_accumulator)

      let revenues = {name: "Revenue", direct: result_accumulator["gross_revenue"], indirect: result_accumulator["total_revenue"]}
      let value_add = {name: "Value Add", direct: result_accumulator["direct_value_add"], indirect: result_accumulator["indirect_value_add"]}
      let employment = {name: "Jobs", direct: result_accumulator["direct_jobs"], indirect: result_accumulator["indirect_jobs"]}

      return [revenues, value_add, employment]
    },
    unique_crops: function(){
      return this.unique_items_list("crop", this.$store.getters.get_crop_name_by_id)
    },
    unique_years: function(){
      return this.unique_items_list( "year")
    },
    unique_regions: function() {
      return this.unique_items_list("region", this.$store.getters.get_region_name_by_id)
    },
    map_value: function() {
      this.schedule_refresh()
      return {key: this.map_selected_variable, metric: this.map_variables.filter(item => item.value === this.map_selected_variable)[0].metric}
    },
    extra_hover_values: function(){
      // filter the hover values to avoid the selected item so we don't have duplicates in the display
      return this.map_variables.filter(item => item.key !== this.map_value.key)
    },
    map_color_scale_title: function() {
      return this.map_variables.filter(item => item.key === this.map_value.key)[0].text
    },
    map_center: function(){
      return [this.$store.getters.current_model_area.map_center_latitude, this.$store.getters.current_model_area.map_center_longitude]
    },
    map_zoom: function(){
      return this.$store.getters.current_model_area.map_default_zoom;
    },
    map_attribution: function(){
      let _this = this;
      return this.map_tile_layer_options.find(item => item.value === _this.map_tile_layer_url).attribution
    },
    has_additional_chart_options(){
      return this.preferences.allow_viz_multiple_comparisons || this.preferences.allow_viz_normalization || this.preferences.allow_viz_region_filter
    },
    sorted_regions(){
      return this.sort_by_name(this.$store.getters.current_model_area.region_set)
    }
  }
}

</script>

<style lang="stylus">
hide_accessibly()
  /* Position offscreen, rather than displaying None so that screen readers still see it */
  position: absolute !important;
  top: -9999px !important;
  left: -9999px !important;

#stacked_charts_switch
  label
    hide_accessibly()

/* Make the top right bar wider so the text is visible */
.leaflet-top.leaflet-right
  width: 20%
  min-width: 150px;

  .info.leaflet-control
    width: 100%;

/* Make sure that the filter dropdowns sit above the maps */
.v-menu__content.theme--light.menuable__content__active.v-autocomplete__content
  z-index: 1000 !important;  /* So annoying to have to use !important to override styles that frameworks set */

.v-input--switch
  transform: scale(1.25)
  transform-origin: bottom left

.basemap_options, .sc-leaflet_control.info
  background-color: rgba(255,255,255,0.8)
  border-radius: 3px
  padding: 0.5em
  padding-bottom: 0

  .v-select
    z-index: 1000

.v-application
  .warning.stormchaser_missing_multipliers_warning
    padding: 1em
    background-color: #fcee22 !important
    border: 1px solid #baa923 !important

#stormchaser_filter_count_text
  font-size: 0.8em
  font-style: italic
</style>