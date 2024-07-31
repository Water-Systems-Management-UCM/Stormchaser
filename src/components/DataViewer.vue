<template>
  <v-container>
    <v-row>
      <v-row>
        <v-col class="col-12"
               v-if="download_name || allow_download_regions">
          <v-menu
              offset-y
          > <!-- Downloads -->
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                  v-bind="attrs"
                  v-on="on"
              >
                <v-icon>mdi-download</v-icon> Downloads
              </v-btn>
            </template>
            <v-list>
              <v-list-item v-if="download_name">
                <v-list-item-title class="download_link"><a @click="download_data"><v-icon>mdi-download</v-icon>Download Data as CSV</a></v-list-item-title>
              </v-list-item>
              <v-list-item v-if="allow_download_regions">
                <v-list-item-title class="download_link"><a @click="download_regions"><v-icon>mdi-download</v-icon>Download Region Spatial Data</a></v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>
        <v-col class="col-12 col-md-4"
               v-if="allowed_filters_by_tab[selected_tab].length > 3">
          <h4>Menu of Controls and Filters</h4>
          <v-list
              style="background-color: unset"
          >
            <v-list-item-group
                v-model="display_filters"
              multiple
              color="indigo"
            >
              <!-- these next items should really be migrated to a v-for with a data variable that holds the icons, names, etc - need to do some work on getting them all to use filter_allowed the same way though -->
              <v-list-item
                value="viz_options"
                v-if="filter_allowed('viz_options')"
                class="sc_thin_list_item"
              >
                <v-list-item-icon><v-icon>mdi-chart-bar</v-icon></v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Visualization Options</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                  value="region_multi_standalone"
                  v-if="filter_allowed('region_multi_standalone')"
                  class="sc_thin_list_item"
              >
                <v-list-item-icon><v-icon>mdi-filter</v-icon></v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Region Filters</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                value="irrigation_switch"
                v-if="filter_allowed('irrigation_switch')"
                class="sc_thin_list_item"
              >
                <v-list-item-icon><v-icon>mdi-water</v-icon></v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Irrigation/Rainfall Filter</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                  value="crop_multi"
                  v-if="filter_allowed('crop_multi')"
                  class="sc_thin_list_item"
              >
                <v-list-item-icon><v-icon>mdi-sprout</v-icon></v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Crop Filter</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                  value="years"
                  v-if="filter_allowed('years')"
                  class="sc_thin_list_item"
              >
                <v-list-item-icon><v-icon>mdi-calendar</v-icon></v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Year Filter</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                  value="parameter"
                  v-if="filter_allowed('parameter')"
                  class="sc_thin_list_item"
              >
                <v-list-item-icon><v-icon>mdi-variable</v-icon></v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Variable Selection</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                  value="stack"
                  v-if="filter_allowed('stack')"
                  class="sc_thin_list_item"
              >
                <v-list-item-icon><v-icon>mdi-chart-bar-stacked</v-icon></v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Chart Stacking</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-col>
      <v-col class="col-12 col-md-4"
             v-if="filter_enabled('crop_multi')">
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
             v-if="filter_enabled('years')"> <!--((selected_tab === TABLE_TAB || selected_tab === SUMMARY_TAB) && unique_years.length > 2) || (!(selected_tab === TABLE_TAB || selected_tab === SUMMARY_TAB) && unique_years.length > 1)">-->
        <h4>Filter to Year</h4>
        <v-autocomplete
            v-model="filter_selected_years"
            multiple
            clearable
            chips
            deletable-chips
            :items="unique_years"
            label="Filter to Year"
            persistent-hint
            solo
        ></v-autocomplete>
      </v-col>
      <!--<v-col class="col-12 col-md-4"
        v-if="filter_enabled('region_multi_standalone') && preferences.allow_viz_region_filter">
        <h4>{{ filter_region_selection_info.filter_mode_exclude ? "Exclude Regions" : "Filter to Regions" }}</h4>
        <MultiItemFilter
          :shared_state="filter_region_selection_info"
          :input_rows="sorted_regions"
          item_text="name"
          item_value="id"
          base_label_text="Regions"
          :solo="true"
          :excludable="filter_region_selection_info.filter_mode_exclude"
        ></MultiItemFilter>
      </v-col>-->
      <v-col class="col-12 col-md-4"
             v-if="filter_enabled('viz_options')">
        <h4>Visualization Options</h4>
        <v-expansion-panels accordion>
          <v-expansion-panel v-if="preferences.allow_viz_multiple_comparisons && comparison_options !== undefined && comparison_options.length > 0 && (selected_tab === CHART_TAB || selected_tab === SUMMARY_TAB)">
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
          <v-expansion-panel v-if="preferences.allow_viz_normalization && comparison_options !== undefined && comparison_options.length > 0 && selected_tab === CHART_TAB">
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
              <v-switch @click="toggle_normalize(normalize_percent_difference)"
              v-model="normalize_percent_difference"
              ><template v-slot:label>
                Show Percent Change
                <SimpleTooltip>By default, the application shows the raw difference between the current model runs (including
                  comparison model runs) and the model run selected here. When this switch is toggled on, it instead shows the percent difference
                between the model runs.</SimpleTooltip></template>
              </v-switch>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <!--<v-expansion-panel v-if="preferences.allow_viz_region_filter">
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
            </v-expansion-panel-content>
          </v-expansion-panel>-->
          <v-expansion-panel v-if="selected_tab === CHART_TAB">
            <v-expansion-panel-header>Chart Options and Download</v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-text-field v-model="chart_title" label="Chart Title"></v-text-field>
              <v-text-field v-model="chart_model_run_name" label="Name of Model Run in Chart"></v-text-field>
              <v-btn :elevation="0" outlined
                     @click="download_plot"
                     class="sc_download_button">
                <v-icon>mdi-download</v-icon> Download Chart as Image
              </v-btn>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
      <v-col class="col-12 col-md-4"
             v-if="filter_enabled('region_multi_standalone') && preferences.allow_viz_region_filter">
        <RegionFilter
            :region_selection_info="filter_region_selection_info"
            :regions="sorted_regions"
            @selected-regions="update_selected_regions"
        ></RegionFilter>
      </v-col>
      <v-col class="col-12 col-md-4"
                id="stacked_charts_switch"
               v-if="filter_enabled('parameter') || filter_enabled('stack')">
          <h4 v-if="selected_tab === MAP_TAB">Map Value</h4>
          <h4 v-if="selected_tab === CHART_TAB">Plot Value</h4>
          <v-autocomplete
              v-model="map_selected_variable"
              :items="map_variables"
              label="Map Variable"
              persistent-hint
              solo
          ></v-autocomplete>
        <v-row
            v-if="filter_enabled('stack')">
          <v-col @click="toggle_stack(charts_stacked_bars)" class="col-12">
            <h4>Stack Bars by Crop</h4>
            <v-switch
                v-model="charts_stacked_bars"
                label="Stack Bars by Crop"
            ></v-switch>
          </v-col>
        </v-row>
      </v-col>
      <v-col class="col-12 col-md-4"
             v-if="(filter_enabled('irrigation_switch') && has_rainfall_data)">
        <!-- TODO: The comparison_options !== undefined is a temporary hack to remove the download button from the input data viewer
            since its positioning is terrible. Make it work better -->
        <v-row
            v-if="filter_enabled('irrigation_switch') && has_rainfall_data">
          <v-col class="col-12">
            <!--  v-if="filter_enabled('stack') || has_rainfall_data"
            >-->
            <h4>Include Data</h4>
            <v-btn-toggle
                v-model="toggle_data_include"
                dense
                multiple
                id="sc-irrigation_data_type_toggle"
            >
              <v-btn
                  v-if="has_rainfall_data"
                  v-model="data_include_rainfall"
                  role="checkbox"
                  :aria-checked="`${data_include_rainfall}`"
              >
                <v-icon v-if="!data_include_rainfall">mdi-square</v-icon>
                <v-icon v-if="data_include_rainfall">check</v-icon> Nonirrigated
              </v-btn>

              <v-btn
                  v-if="has_rainfall_data"
                  v-model="data_include_irrigated"
                  role="checkbox"
                  :aria-checked="`${data_include_irrigated}`"
              >
                <v-icon v-if="!data_include_irrigated">mdi-square</v-icon>
                <v-icon v-if="data_include_irrigated">check</v-icon> Irrigated
              </v-btn>
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
        <v-tab href="#sc-data-viewer-summary" v-if="has_revenues">Summary</v-tab>
        <v-tab href="#sc-data-viewer-table">Table</v-tab>
        <v-tab-item
            value="sc-data-viewer-chart">
          <ResultsVisualizerBasic
              :model_data="full_data_filtered"
              :visualize_attribute="map_selected_variable"
              :visualize_attribute_options="chart_attribute_options"
              :stacked="charts_stacked_bars"
              :is_base_case="is_base_case"
              :comparison_items="selected_comparisons_full_filtered"
              :normalize_to_model_run="normalize_to_model_run_filtered"
              :filter_regions="filter_regions"
              :chart_model_run_name="chart_model_run_name"
              :y_axis_title="y_axis_label"
              :chart_title="chart_title"
              :percent_difference="normalize_percent_difference"
              ref="chart_visualizer"
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
        <v-tab-item value="sc-data-viewer-summary">
          <SummaryTable :model_run="model_run"
                        :filter_region_selection_info="filter_region_selection_info"
                        :format_currency="format_currency"
                        :no_fractions_number_formatter="no_fractions_number_formatter"
                        :multipliers="multipliers"
                        :map_variables="map_variables"
                        :full_data_filtered="full_data_filtered"
                        :selected_comparisons="selected_comparisons"
                        :selected_comparisons_full_filtered="selected_comparisons_full_filtered"
/>
        </v-tab-item>
        <v-tab-item value="sc-data-viewer-table">
          <v-data-table
              :dense="$store.getters.user_settings('dense_tables')"
              :headers="table_headers"
              :items="full_data_filtered"
              item-key="id"
              multi-sort
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

  </v-container>
</template>

<script>
import _ from 'lodash'
import {LControl, LMap, LTileLayer} from 'vue2-leaflet'
import {ChoroplethLayer, InfoControl, ReferenceChart} from 'vue-choropleth'
import ResultsVisualizerBasic from "./ResultsVisualizerBasic.vue";
import SimpleTooltip from "./SimpleTooltip.vue";
import RegionFilter from "./RegionFilter.vue";
import SummaryTable from "./SummaryTable.vue";

export default {
  name: "DataViewer",
  components: {
    SummaryTable,
    RegionFilter,
    LMap,
    LControl,
    'l-info-control': InfoControl,
    'l-reference-chart': ReferenceChart,
    'l-choropleth-layer': ChoroplethLayer,
    LTileLayer,
    ResultsVisualizerBasic,
    SimpleTooltip
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
    allow_download_regions: {
        type: Boolean,
        default: false
    },
    download_lookups: Object,
    download_drop_fields: Array,
    multipliers: {
      type: Object,
      default: Object
    },
    comparison_options: Array, // which items will we compare this model run to?
    preferences: Object, // model area preferences object
    is_base_case: {
      type: Boolean,
      default: false
    },
    model_run:{
      type: Object,
      default: null
    }
  },
  data: function(){
      return {
        MAP_TAB: "sc-data-viewer-map",
        TABLE_TAB: "sc-data-viewer-table",
        CHART_TAB: "sc-data-viewer-chart",
        SUMMARY_TAB: "sc-data-viewer-summary",
        display_filters: [],
        charts_stacked_bars: false,
        chart_title: "",
        y_axis_title: "",
        chart_model_run_name: "This model run",
        toggle_data_include: [0,1], // include PMP and rainfall data by default
        selected_comparisons: [],
        selected_comparisons_full: [],
        normalize_to_model_run: null,
        normalize_to_model_run_pre_retrieve: null,  // we sync the control with this, then update normalize_to_model_run once we have results
        normalize_percent_difference: true,
        selected_tab: 0,
        map_geojson: {type: "FeatureCollection", features: []},
        map_selected_variable: null,
        map_tile_layer_url: 'https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=2374da9f070e45098bff569aff92f377',
        map_tile_layer_options: [
          /*{text: "OSM Mapnik BW",
            value: 'https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
            attribution:"\u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e"
          },*/
          {
            text: "Thunderforest Atlas",
            value: "https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=2374da9f070e45098bff569aff92f377",
            attribution: "Thunderforest and \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e",
          },
          {
            text: "Thunderforest Mobile Atlas (High Contrast)",
            value: "https://tile.thunderforest.com/mobile-atlas/{z}/{x}/{y}.png?apikey=2374da9f070e45098bff569aff92f377",
            attribution: "Thunderforest and \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e",
          },
          {text: "OSM Default",
            value: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: "\u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e",
          },
          {text: "Stamen Toner Lite",
            value: 'https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png',
            attribution:"Map tiles by <a href=\"http://stamen.com\">Stamen Design</a>, under <a href=\"http://creativecommons.org/licenses/by/3.0\">CC BY 3.0</a>. Data by <a href=\"http://openstreetmap.org\">OpenStreetMap</a>, under <a href=\"http://www.openstreetmap.org/copyright\">ODbL</a>."
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
        general_number_formatter: new Intl.NumberFormat(navigator.languages, { maximumFractionDigits: 0, maximumSignificantDigits: 6}),  // format for current locale and round to whole dollars
        no_fractions_number_formatter: new Intl.NumberFormat(navigator.languages, { maximumFractionDigits: 0}),
        allowed_filters: {},
        allowed_filters_by_tab: {0: []},
        default_filters_by_tab: {0: []},
      }
  },
  mounted() {
    this.map_geojson = this.region_geojson;  // do this at mount so we can mess with the geojson later
    this.selected_tab = this.default_tab
    this.map_selected_variable = this.map_default_variable

    // we add it this way upon mounting because otherwise we risk the prospect that we don't have the base model
    // run results yet and the app won't update once we have them.
    let _this = this;
    // make sure we have options for comparison - if we don't, don't bother retrieving base case results. This also
    // protects the input data viewer from adding a comparison "model run"
    if(this.comparison_options !== null && this.comparison_options !== undefined && this.comparison_options.length > 0 && this.is_base_case === false){
      this.$store.dispatch('get_model_run_with_results', this.$store.getters.current_model_area.base_model_run.id).then(function (model_run) {
        _this.selected_comparisons.push(model_run)
      })
    }

    this.set_allowed_filters(); // we do this here rather than with computed values because the computed versions were being called a LOT and slowing things down. And really these are values that need to be calculated once per component instance, right after things are loaded
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
    },
    selected_tab: {
      handler: function(){
        this.display_filters = this.default_filters_by_tab[this.selected_tab]
        if(this.selected_tab === this.CHART_TAB){
          this.selected_comparisons_full_filtered = [];
          this.check_normalize_and_comparisons();
        }

      }
    },
    activeFilters: {
      handler(newFilters) {
        if (newFilters.includes('stack') && this.allowed_filters.years.length > 0) {
          this.allowed_filters.years = [];
        }
      },
      deep: true
    },

  },
  methods:{
    set_allowed_filters(){ // run once when mounted - see comment in mounted()
      let allowed_filters = {
          "region_multi": [],
          "region_multi_standalone": [this.SUMMARY_TAB, this.TABLE_TAB, this.CHART_TAB],
          "crop_multi": [this.MAP_TAB, this.TABLE_TAB, this.SUMMARY_TAB],
          "years": this.unique_years.length > 1 ? [this.MAP_TAB, this.CHART_TAB, this.TABLE_TAB, this.SUMMARY_TAB] : [],
          "parameter": [this.MAP_TAB, this.CHART_TAB],
          "irrigation_switch": this.has_rainfall_data ? [this.CHART_TAB, this.MAP_TAB, this.SUMMARY_TAB, this.TABLE_TAB] : [],
          "stack": [this.CHART_TAB],
          "chart_download": [this.CHART_TAB],
          "viz_options": [this.CHART_TAB, this.SUMMARY_TAB]
        };
      this.allowed_filters = allowed_filters

      let accumulator = {0: []};  // 0 defined because it's the default "selected tab" right now. So need this to not have an error on lookup.
      accumulator[this.CHART_TAB] = [];
      accumulator[this.SUMMARY_TAB] = [];
      accumulator[this.TABLE_TAB] = [];
      accumulator[this.MAP_TAB] = [];

      let allowed = allowed_filters
      Object.keys(allowed).forEach(function(filter){
        allowed[filter].forEach(function(tab){
          accumulator[tab].push(filter);
        })
      })
      this.allowed_filters_by_tab = accumulator

      let CHART_ALLOWED = this.allowed_filters_by_tab[this.CHART_TAB]
      let TABLE_ALLOWED = this.allowed_filters_by_tab[this.TABLE_TAB]
      let MAP_ALLOWED = this.allowed_filters_by_tab[this.MAP_TAB]
      let SUMMARY_ALLOWED = this.allowed_filters_by_tab[this.SUMMARY_TAB]

      let lookup = {}
      lookup[this.CHART_TAB] = CHART_ALLOWED.length > 3 ? ['viz_options', 'region_multi_standalone'] : CHART_ALLOWED;
      lookup[this.TABLE_TAB] = TABLE_ALLOWED.length > 3 ? ['region_multi_standalone', 'crop_multi'] : TABLE_ALLOWED;
      lookup[this.MAP_TAB] = MAP_ALLOWED.length > 3 ? ['parameter', 'crop_multi'] : MAP_ALLOWED;
      lookup[this.SUMMARY_TAB] = SUMMARY_ALLOWED.length > 3 ? ['viz_options', 'region_multi_standalone'] : SUMMARY_ALLOWED;

      this.default_filters_by_tab = lookup
    },
    update_selected_regions(data){
      this.filter_region_selection_info.selected_rows = data
    },
    download_plot(){
      this.$refs.chart_visualizer.download_plot(this.download_name)
    },
    format_currency(value){
      return this.currency_formatter.format(value)
    },
    toggle_stack(stack_filter){ // Checks to see if stack chart is on when trying to activate normalize
      if(stack_filter === true && this.normalize_percent_difference === true){
        this.normalize_percent_difference = false;
        this.$store.commit('app_notice', {message: "Turned off normalize percent - can't used both at the same time", timeout: 3000})
      }
    },
    toggle_normalize(normalize_filter){ // Checks to see if normalize is on when trying to activate stack chart
      if(normalize_filter === true && this.charts_stacked_bars === true){
        this.charts_stacked_bars = false;
        this.$store.commit('app_notice', {message: "Turned off stacked bar chart - can't used both at the same time", timeout: 3000})
      }
    },

    filter_allowed(item){
      return this.allowed_filters[item].findIndex(tab => tab === this.selected_tab) > -1
    },

    filter_enabled(item){
      // it's allowed to be used and the user has enabled it via the controls
      return this.display_filters.includes(item) && this.filter_allowed(item)
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
      if(index_of_normalize_run > -1 && this.selected_tab !== this.SUMMARY_TAB){
        // if we found the normalize run in the selected comparisons, remove it
        this.$store.commit('app_notice', {message: "Removed normalization model run from comparison runs - can't use in both places", timeout: 5000})
        this.selected_comparisons.splice(index_of_normalize_run, 1)
        this.selected_comparisons = [];
        // this.comparison_options = [];
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
    reduce_results_to_totals(accumulator, raw_value){
      /* similar to reduce_by_region, but not by region - for summaries that don't need multipliers */
        this.map_variables.forEach(function(variable){
            accumulator[variable.key] = accumulator[variable.key] + Number(raw_value[variable.key]);
        })
    },
    filter_model_run_records(model_run_pmp_data, model_run_rainfall_data){
      let _this = this
      let selected_regions = this.filter_region_selection_info.filter_mode_exclude ? this.filter_region_selection_info.filter_selected_exclude : this.filter_region_selection_info.selected_rows

      // if the controls specify to include irrigated data, start with that, otherwise start with an empty array
      let base_data = this.data_include_irrigated === true || !this.filter_allowed('irrigation_switch') ? model_run_pmp_data : []
      // then if they want the rainfed ag data, include that too
      // there might be a better way to do this than with a double spread
      if(this.filter_allowed('irrigation_switch') && this.data_include_rainfall && model_run_rainfall_data !== null && model_run_rainfall_data !== undefined){
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
    },
    region_filter(data_series){
      if(this.filter_regions.length === 0){
        return data_series
      }

      let region_data_series = data_series.filter(item => this.filter_regions.findIndex(region => Number(region.id) === item.region) > -1)
      return region_data_series
    },
    download_regions(){
      let group_data = null;
      if(this.$store.getters.current_model_area.region_group_sets.length > 0){  // if we have region groups, include them in the download
        group_data = this.$store.getters.current_model_area.region_groups
      }
      this.$stormchaser_utils.download_regions_as_shapefile(this.$store.getters.current_model_area.regions, ["id", "name", "internal_id"], group_data)
    },
    get_y_axis_title(){
      if (this.map_selected_variable === "xlandsc" || this.map_selected_variable === "xland"){
        return "Land (ac)";
      }else if(this.map_selected_variable === "xwatersc" || this.map_selected_variable === "xwater"){
        return "Water (ac-ft/ac)";
      } else if (this.map_selected_variable === "gross_revenue"){
        return "Gross Revenue ($)"
      } else if (this.map_selected_variable === "net_revenue"){
        return "Net Revenue ($)"
      }
      return this.map_selected_variable;
    }
  },
  computed:{
    y_axis_label: function(){
      return this.get_y_axis_title();
    },
    has_revenues: function(){
      // in some cases we need to know that we have revenue available. Check if it's one of the fields passed in
      // and return true if at least one has a gross_revenue key
      return this.map_variables.some(variable => variable.value === "gross_revenue")
    },
    has_rainfall_data: function(){
      return this.rainfall_data !== null && this.rainfall_data !== undefined && this.rainfall_data.length > 0
    },
    selected_comparisons_full_filtered(){
      let _this = this;
      return this.selected_comparisons_full.map(function(model_run){
        let model_run_data = _.cloneDeep(model_run) // clone it because we're going to overwrite results since the ResultsVisualizerBasic uses the whole structure. If we didn't clone then the next update would be incorrect (it would accumulate updates)
        model_run_data.results[0].result_set = _this.filter_model_run_records(model_run_data.results[0].result_set, model_run_data.results[0].rainfall_result_set)
        return model_run_data
      })
    },
    normalize_to_model_run_filtered(){
      let model_run_data = _.cloneDeep(this.normalize_to_model_run)
      if (model_run_data !== null){
        model_run_data.results[0].result_set = this.filter_model_run_records(model_run_data.results[0].result_set, model_run_data.results[0].rainfall_result_set)
        return model_run_data
      }
      return null

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
    map_model_data: function(){
      return this.get_region_sums_for_filtered_records(this.full_data_filtered)

      /*let _this = this
      return this.full_data_filtered.map(function(record){  // attach the region name to the map data
        record.name = _this.$store.getters.current_model_area.regions[record.region].name
        return record
      });*/
    },
    full_data_filtered: function(){
      return this.filter_model_run_records(this.model_data, this.rainfall_data)
    },
    chart_model_data: function(){
      /*
        I think this isn't in use anymore (5/6/2021)
       */
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
    },
    filter_regions(){
      return this.filter_region_selection_info.filter_mode_exclude ? this.filter_region_selection_info.filter_selected_exclude : this.filter_region_selection_info.selected_rows
    },
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

#sc-irrigation_data_type_toggle
  background-color: #666 !important;
  color: #666;

  button.v-btn:before
  button.v-btn.v-item--active:before
    background-color: white !important;

  .v-btn
    i
      color: #bbb !important;
  .v-btn.v-item--active
    i
      color: blue !important;

#stormchaser_filter_count_text
  font-size: 0.8em
  font-style: italic

.sc_download_button
  border: 1px solid #ccc !important;
  background-color: #f8f8f8 !important;
  color: #444 !important;

.sc_thin_list_item
  min-height: 36px;
  background-color: white;
  .v-list-item__icon
    margin: 8px 0

</style>