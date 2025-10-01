<template>
  <v-container>
    <v-row no-gutters class="mx-auto">
      <v-col cols="2">
<!--    toggles    -->
        <v-sheet class="button-container">
          <h4>Controls and Filters</h4>
          <v-chip @click="clear_filters" v-if="display_filters.length > 0" text="Clear" prepend-icon="mdi-window-close" variant="outlined" ></v-chip>
          <v-chip-group
            v-model="display_filters"
            column
            multiple
            style="display: flex; flex-direction: column;"
          >
            <v-chip @click="filter_disable('viz_options')" :value="`viz_options`" v-if="filter_allowed('viz_options')" text="Visualization " prepend-icon="mdi-chart-bar" variant="outlined" filter size="default" ></v-chip>
            <v-chip @click="filter_disable('region_multi_standalone')" :value="`region_multi_standalone`" v-if="filter_allowed('region_multi_standalone')" text="Region" prepend-icon="mdi-filter" variant="outlined" filter ></v-chip>
            <v-chip @click="filter_disable('years')" :value="`years`" v-if="filter_allowed('years')" text="Year" prepend-icon="mdi-calendar" variant="outlined" filter ></v-chip>
            <v-chip @click="filter_disable('parameter')" :value="`parameter`" v-if="filter_allowed('parameter')" text="Variable " prepend-icon="mdi-variable" variant="outlined" filter ></v-chip>
            <v-chip @click="filter_disable('irrigation_switch')" :value="`irrigation_switch`" v-if="filter_allowed('irrigation_switch')" text="Irrigation/Rainfall" prepend-icon="mdi-water" variant="outlined" filter ></v-chip>
            <v-chip @click="filter_disable('stack')" :value="`stack`" v-if="filter_allowed('stack')" text="Chart" prepend-icon="mdi-chart-bar" variant="outlined" filter ></v-chip>
            <v-chip @click="filter_disable('crop_multi')" :value="`crop_multi`"  v-if="filter_allowed('crop_multi')" text="Crop Filter" prepend-icon="mdi-sprout" variant="outlined" filter ></v-chip>
            <v-chip @click="filter_disable('map_norm')" :value="`map_norm`"  v-if="filter_allowed('map_norm')" text="Normalize" prepend-icon="mdi-percent-outline" variant="outlined" filter ></v-chip>
          </v-chip-group>

        </v-sheet>
      </v-col>
      <v-col>
<!--    controls    -->
        <v-sheet class="pa-2 ma-2">
          <v-row>
            <p id="stormchaser_filter_count_text">Filters returned {{ full_data_filtered?.length }} records</p>
          </v-row>
          <v-row>
            <v-col v-if="filter_enabled('viz_options')">
              <h4>Visualization Options </h4>
              <v-expansion-panels accordion>
                <v-expansion-panel v-if="preferences.allow_viz_multiple_comparisons && comparison_options !== undefined && comparison_options.length > 0 && (selected_tab === CHART_TAB || selected_tab === SUMMARY_TAB || selected_tab === TABLE_TAB || selected_tab === MAP_TAB)">
                  <v-switch
                      v-if="(selected_tab === TABLE_TAB) || selected_tab === MAP_TAB"
                      label="Toggle Difference"
                      v-model="table_diff_toggle"
                      style="padding-left: 5px"
                  ></v-switch>
                  <v-expansion-panel-title v-if="selected_tab !== MAP_TAB">Add/Change Comparison Model Runs</v-expansion-panel-title>
                  <v-expansion-panel-text v-if="selected_tab !== MAP_TAB">
                    <v-autocomplete
                        v-model="selected_comparisons"
                        :items="comparison_options"
                        label="Comparison Runs"
                        item-value="id"
                        item-title="name"
                        return-object
                        persistent-hint
                        multiple
                        clearable
                        deletable-chips
                        chips
                    ></v-autocomplete>

                    <v-switch
                        v-if="(selected_tab === TABLE_TAB) || selected_tab === MAP_TAB"
                        label="Toggle Difference"
                        v-model="table_diff_toggle"
                    ></v-switch>
                  </v-expansion-panel-text>
                </v-expansion-panel>
                <v-expansion-panel v-if="preferences.allow_viz_normalization && comparison_options !== undefined && comparison_options.length > 0 && selected_tab === CHART_TAB">
                  <v-expansion-panel-title>Change Baseline/Normalization</v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-autocomplete
                        v-model="normalize_to_model_run_pre_retrieve"
                        :items="comparison_options"
                        label="Normalize To Model Run"
                        item-value="id"
                        item-title="name"
                        return-object
                        persistent-hint
                        clearable
                        deletable-chips
                        chips
                    ></v-autocomplete>
                    <v-switch
                        v-model="normalize_percent_difference"
                        @click="toggle_normalize(normalize_percent_difference)"
                    >
                      <template v-slot:label>
                        Show Percent Change
                        <v-col class="col-12 sc-help_block sc-help_tall" v-if="normalize_percent_difference">
                          By default, the application shows the raw difference between the current model runs (including
                          comparison model runs) and the model run selected here. When this switch is toggled on, it instead shows the percent difference
                          between the model runs.
                        </v-col>
                        <SimpleTooltip>By default, the application shows the raw difference between the current model runs (including
                          comparison model runs) and the model run selected here. When this switch is toggled on, it instead shows the percent difference
                          between the model runs.</SimpleTooltip></template>
                    </v-switch>
                  </v-expansion-panel-text>
                </v-expansion-panel>
                <v-expansion-panel v-if="selected_tab === CHART_TAB">
                  <v-expansion-panel-title>Chart Options and Download</v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-text-field v-model="chart_title" label="Chart Title"></v-text-field>
                    <v-text-field v-model="chart_model_run_name" label="Name of Model Run in Chart"></v-text-field>
                    <v-btn :elevation="0" outlined
                           @click="download_plot"
                           class="sc_download_button">
                      <v-icon>mdi-download</v-icon> Download Chart as Image
                    </v-btn>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>
          </v-row>
          <v-row>
            <v-col v-if="filter_enabled('region_multi_standalone') && preferences.allow_viz_region_filter" class="mb-2">
              <RegionFilter
                  :region_selection_info="filter_region_selection_info"
                  :regions="sorted_regions"
                  @selected-regions="update_selected_regions"
                  :viewer_tab="selected_tab"

              ></RegionFilter>
              <br>
<!--       REMOVING TEMPORARY       -->
<!--              <div v-if="selected_tab === TABLE_TAB">-->
<!--                <v-switch-->
<!--                  label="Show number of wells"-->
<!--                  v-model="table_well_toggle"-->
<!--                ></v-switch>-->
<!--              </div>-->
<!--              <div v-if="selected_tab === SUMMARY_TAB">-->
<!--                <v-switch-->
<!--                  label="Show wells data"-->
<!--                  v-model="summ_well_toggle"-->
<!--                ></v-switch>-->
<!--              </div>-->
<!--              <div v-if="selected_tab === MAP_TAB">-->
<!--                <h4>-->
<!--                  Filter Wells-->
<!--                  <SimpleTooltip-->
<!--                      :text_only="true">{{ "Wells are categorize into three different levels (Low, Medium, High) which were found by taking distribution." }}-->
<!--                  </SimpleTooltip>-->
<!--                </h4>-->

<!--                <v-autocomplete-->
<!--                    v-model="filter_wells"-->
<!--                    multiple-->
<!--                    clearable-->
<!--                    chips-->
<!--                    deletable-chips-->
<!--                    :items="california_wells"-->
<!--                    label="Filter Wells"-->
<!--                    item-title="text"-->
<!--                    item-value="value"-->
<!--                    persistent-hint-->
<!--                    solo-->
<!--                ></v-autocomplete>-->
<!--              </div>-->
            </v-col>
            <v-col v-if="filter_enabled('years')">
              <h4>Filter to Year</h4>
              <v-autocomplete
                  v-model="filter_selected_years"
                  multiple
                  clearable
                  chips
                  deletable-chips
                  :items="unique_years"
                  label="Filter to Year"
                  item-title="text"
                  item-value="value"
                  persistent-hint
                  solo
              ></v-autocomplete>
            </v-col>
            <v-col v-if="filter_enabled('parameter')">
              <h4 v-if="selected_tab === MAP_TAB">Map Value</h4>
              <h4 v-if="selected_tab === CHART_TAB">Plot Value</h4>
              <v-autocomplete
                  v-model="map_selected_variable"
                  :items="map_variables"
                  item-title="text"
                  label="Variable"
                  persistent-hint
                  solo
              ></v-autocomplete>
            </v-col>
            <v-col v-if="filter_enabled('crop_multi')">
              <h4>Filter to Crop</h4>
              <v-autocomplete
                  v-model="filter_selected_crops"
                  :items="unique_crops"
                  item-title="text"
                  :item-value="item => item"
                  label="Filter to Crop"
                  persistent-hint
                  solo
                  clearable
                  multiple
                  chips
                  deletable-chips
              ></v-autocomplete>
<!--      REMOVING TEMPORARY        -->
<!--              <div v-if="selected_tab !== MAP_TAB || selected_tab !== SUMMARY_TAB">-->
<!--                <h4>-->
<!--                  Crop Pesticide-->
<!--                  <SimpleTooltip-->
<!--                      :text_only="true">{{ "Pesticide data shows the average amount applied to each crop. It combines all pesticides used on that crop into one value. Some regions will not have data for certain crops." }}-->
<!--                  </SimpleTooltip>-->
<!--                </h4>-->
<!--                <div v-if="this.$store.getters.current_model_area.background_code !== 'planning_area' || this.$store.getters.current_model_area.background_code !== 'cdfa'">-->
<!--                  <v-switch-->
<!--                      v-model="pesticide_data_toggle"-->
<!--                      label="Show Pesticide Data"-->

<!--                  ></v-switch>-->

<!--                </div>-->
<!--              </div>-->
            </v-col>
            <v-col v-if="filter_enabled('stack')">
              <h4>Stack Bars by Crop</h4>
              <v-switch
                  v-model="charts_stacked_bars"
                  label="Stack Bars by Crop"
              ></v-switch>
            </v-col>
            <v-col v-if="filter_enabled('map_norm')">
              <h4>Normalize Map Values</h4>
              <v-switch
                  v-model="map_norm_toggle"
                  label="Normalize Values"
              ></v-switch>

              <h4>Percentage Change</h4>
              <v-switch
                  v-model="percent_change_toggle"
                  label="Percentage Change"
              ></v-switch>

              <v-col class="col-12 sc-help_block sc-help_tall" v-if="map_norm_toggle">
                Note: Having Normalize Values on could display improper values for certain high yield crops (ie Apples).
                Land value will always show as 1 since we find the proportion according to land.
              </v-col>
            </v-col>
            <v-col v-if="(filter_enabled('irrigation_switch') && has_rainfall_data)">
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
                  <v-icon v-if="data_include_rainfall">mdi-check</v-icon> Nonirrigated
                </v-btn>

                <v-btn
                    v-if="has_rainfall_data"
                    v-model="data_include_irrigated"
                    role="checkbox"
                    :aria-checked="`${data_include_irrigated}`"
                >
                  <v-icon v-if="!data_include_irrigated">mdi-square</v-icon>
                  <v-icon v-if="data_include_irrigated">mdi-check</v-icon> Irrigated
                </v-btn>
              </v-btn-toggle>
            </v-col>
          </v-row>
        </v-sheet>

      </v-col>
    </v-row>
    <v-row>
    <v-divider></v-divider>
    <v-container>
      <v-card>
        <v-tabs
          active-class="active_tab"
          v-model="selected_tab"
        >
          <v-tab :value=0>Charts</v-tab>
          <v-tab :value=1>Map</v-tab>
          <v-tab :value=2 v-if="has_revenues">Summary</v-tab>
          <v-tab :value=3>Table</v-tab>
        </v-tabs>
        <v-tabs-window v-model="selected_tab">
<!-- CHART -->
          <v-tabs-window-item value=0 >
            <div v-if="selected_tab === 0">

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
                  :chart_title="chart_title"
                  :y_axis_title="get_y_axis_title()"
                  :percent_difference="normalize_percent_difference"
                  ref="chart_visualizer"
              ></ResultsVisualizerBasic>
            </div>
          </v-tabs-window-item>
<!-- MAP  -->
          <v-tabs-window-item value=1 >
            <MapViewer
              :map_default_variable="map_default_variable"
              :map_variables="map_variables"
              :model_data="full_data_filtered"
              :visualize_attribute_options="visualize_attribute_options"
              :map_selected_variable="map_selected_variable"
              :filter_crop_year="full_data_filtered"
              :filter_wells="filter_wells"
              @map_max_value="update_map_max_value"
              @map_min_value="update_map_min_value"
              :map_norm="map_norm_toggle"
              :percent_toggle="percent_change_toggle"
              :difference_toggle="table_diff_toggle"
              @update-map-norm="update_map_norm"
              :selected_comparisons_full="selected_comparisons_full_filtered[0]"
              :result_data="(base_case !== null) ? base_case : $store.getters.base_case_results"
              :selected_filters="[filter_selected_years, filter_selected_crops, filter_region_selection_info]"
              :filtered_base_case="filter_model_run_records((base_case !== null) ? base_case : $store.getters.base_case_results,[])"
              :is_base_case="is_base_case"
              :selected_regions="filter_region_selection_info.selected_rows.length"
              :well_data="well_data"
            ></MapViewer>

          </v-tabs-window-item>
<!-- SUMM -->
          <v-tabs-window-item value=2 >
            <SummaryTable v-if="selected_tab === SUMMARY_TAB" :filter_region_selection_info="filter_region_selection_info"
              :format_currency="format_currency"
              :full_data_filtered="full_data_filtered"
              :map_variables="map_variables"
              :model_run="model_run"
              :multipliers="multipliers"
              :no_fractions_number_formatter="no_fractions_number_formatter"
              :selected_comparisons="selected_comparisons"
              :selected_comparisons_full_filtered="selected_comparisons_full_filtered"
              :well_data_toggle="summ_well_toggle"
              :well_data="filtered_well_data"
            >
            </SummaryTable>
          </v-tabs-window-item>
<!-- TABLE-->
          <v-tabs-window-item value=3 >
            <v-container>
              View crop-specific data by region. When a run is selected, values from the run appear underneath.
              Toggle “Show Differences” to see changes directly
            <v-data-table
                :density="density_setting_toggle"
                :headers="table_headers"
                :items="full_data_filtered"
                item-key="key"
                multi-sort
                sort-desc
                class="elevation-1"
                :items-per-page="10"
                hover
            >
            <template v-slot:item.region="{ item }">
              <span class="region_name">{{ $store.getters.get_region_name_by_id(item.region) }}</span>
              <div  v-if="selected_comparisons_full_filtered.length > 0" :key="selected_comparisons_full_filtered[0].id" style="color: black; background-color: #f0f0f0;">
                <span  style="color: black; padding: 2px 4px; border-radius: 4px;">{{get_comparison_table_element("region", item)}} (From {{ selected_comparisons_full_filtered[0].name }})</span>
              </div>
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
              <div style="color: black; background-color: #f0f0f0; padding: 2px 4px; border-radius: 4px;" v-if="selected_comparisons_full_filtered.length > 0" :key="model_run.id">
                {{ get_comparison_table_element("xlandsc", item) }}
                <SimpleTooltip v-if="table_diff_toggle"
                  :text_only="true">{{ get_comparison_text(get_comparison_table_element("xlandsc", item), item.xlandsc) }}
                </SimpleTooltip>
              </div>
            </template>
            <template v-slot:item.gross_revenue="{ item }">
              <span class="gross_revenue">{{ general_number_formatter.format(item.gross_revenue) }}</span>
              <div style="color: black; background-color: #f0f0f0; padding: 2px 4px; border-radius: 4px;" v-if="selected_comparisons_full_filtered.length > 0" :key="model_run.id">
                {{ get_comparison_table_element("gross_revenue", item) }}
                <SimpleTooltip v-if="table_diff_toggle"
                  :text_only="true">{{ this.compare_runs_text_info }}
                </SimpleTooltip>
              </div>
            </template>
            <template v-slot:item.grevsc="{ item }">
              <span class="gross_revenue">{{ general_number_formatter.format(item.grevsc) }}</span>
              <div style="color: black; background-color: #f0f0f0; padding: 2px 4px; border-radius: 4px;" v-if="selected_comparisons_full_filtered.length > 0" :key="model_run.id">
<!--                {{ get_comparison_table_element("gross_revenue", item) }}-->
                <SimpleTooltip v-if="table_diff_toggle"
                  :text_only="true">{{ this.compare_runs_text_info }}
                </SimpleTooltip>
              </div>
            </template>

            <template v-slot:item.net_revenue="{ item }">
              <span class="net_revenue">{{ format_currency(item.net_revenue) }}</span>
              <div style="color: black; background-color: #f0f0f0; padding: 2px 4px; border-radius: 4px;" v-if="selected_comparisons_full_filtered.length > 0" :key="model_run.id">
                {{ get_comparison_table_element("net_revenue", item) }}
                <SimpleTooltip v-if="table_diff_toggle"
                  :text_only="true">{{ this.compare_runs_text_info }}
                </SimpleTooltip>
              </div>
            </template>
            <template v-slot:item.water_per_acre="{ item }">
              <span class="water_per_acre">{{ Number(Math.round(Number(item.water_per_acre + "e2")) + "e-2") }}</span>
            </template>
            <template v-slot:item.xwatersc="{ item }">
              <span class="xwatersc">{{ general_number_formatter.format(item.xwatersc) }}</span>
              <div style="color: black; background-color: #f0f0f0; padding: 2px 4px; border-radius: 4px;" v-if="selected_comparisons_full_filtered.length > 0" :key="model_run.id">
                {{ get_comparison_table_element("xwatersc", item) }}
                <SimpleTooltip v-if="table_diff_toggle"
                  :text_only="true">{{ get_comparison_text(get_comparison_table_element("xwatersc", item), item.xwatersc) }}
                </SimpleTooltip>
              </div>
            </template>
            <template v-if="table_well_toggle" v-slot:item.wells = "{ item }">
              <span>{{ get_number_wells(item).count }}</span>
            </template>
<!--            <template v-if="pesticide_data_toggle" v-slot:item.crop_group = "{ item }">-->
<!--              <span>{{ get_pesticide_data(item).crop_group }}</span>-->
<!--            </template>-->
            <template v-if="pesticide_data_toggle" v-slot:item.amount_used_lbs = "{ item }">
              <span>{{ general_number_formatter.format(get_pesticide_data(item).amount_used_lbs) }}</span>
            </template>
            </v-data-table>
<!--            <PesticideTable-->
<!--                :density_toggle="density_setting_toggle"-->
<!--                :filters="[filter_selected_crops, filter_region_selection_info]"-->
<!--            ></PesticideTable>-->
            </v-container>
          </v-tabs-window-item>

        </v-tabs-window>
      </v-card>
    </v-container>
    </v-row>

  </v-container>
</template>

<script>
import {defineComponent, reactive, toRaw} from 'vue';

import _, {toString} from 'lodash'
import "leaflet/dist/leaflet.css"
import {LControl, LGeoJson, LMap, LTileLayer, LTooltip} from "@vue-leaflet/vue-leaflet";
import {ChoroplethLayer, InfoControl, ReferenceChart} from 'vue-choropleth'
import ResultsVisualizerBasic from './ResultsVisualizerBasic.vue';
import SimpleTooltip from './SimpleTooltip.vue';
import RegionFilter from './RegionFilter.vue';
import SummaryTable from './SummaryTable.vue';
import MapViewer from "./MapViewer.vue";
import jsonDataWells from '../assets/california_wells_EDIT.json'
import pesticide_data from '../assets/pest_crop_groups_090825.json'

export default defineComponent({
  name: 'DataViewer',

  components: {
    SummaryTable,
    RegionFilter,
    LMap,
    LControl,
    'l-info-control': InfoControl,
    'l-reference-chart': ReferenceChart,
    'l-choropleth-layer': ChoroplethLayer,
    LTileLayer,
    LGeoJson,
    LTooltip,
    ResultsVisualizerBasic,
    SimpleTooltip,
    MapViewer,
  },

  props:{
    table_headers: Array,
    model_data: reactive(Array),
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
    base_case: {
      type: Array,
      default: null
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
    },
    filters: [
      { value: 'viz_options', title: 'Visualization Options', icon: 'mdi-chart-bar' },
      { value: 'region_multi_standalone', title: 'Region Filters', icon: 'mdi-filter' },
      { value: 'irrigation_switch', title: 'Irrigation/Rainfall Filter', icon: 'mdi-water' },
      { value: 'crop_multi', title: 'Crop Filter', icon: 'mdi-sprout' },
      { value: 'years', title: 'Year Filter', icon: 'mdi-calendar' },
      { value: 'parameter', title: 'Variable Selection', icon: 'mdi-variable' },
      { value: 'stack', title: 'Chart Stacking', icon: 'mdi-chart-bar-stacked' },
      { value: 'baseline', title: 'Baseline', icon: 'mdi-chart-bar-stacked' },
    ],
    menu_controls: [
      {title: 'Region Filter', icon: 'mdi-chart-bar'}
    ],
  },

  data(){
      return {
        CHART_TAB: 0,
        MAP_TAB: 1,
        SUMMARY_TAB: 2,
        TABLE_TAB: 3,
        display_filters: ["viz_options"],
        charts_stacked_bars: false,
        pesticide_data_toggle: false,
        chart_title: '',
        y_axis_title:'',
        chart_model_run_name: 'This model run',
        toggle_data_include: [0,1], // include PMP and rainfall data by default
        table_diff_toggle: false,
        table_well_toggle: false,
        summ_well_toggle: false,
        selected_comparisons: [],
        selected_comparisons_full: [],
        normalize_to_model_run: null,
        normalize_to_model_run_pre_retrieve: null,  // we sync the control with this, then update normalize_to_model_run once we have results
        normalize_percent_difference: false,
        selected_tab: 0,
        map_max_value: null,
        map_min_value: null,
        map_geojson: {type: 'FeatureCollection', features: []},
        map_selected_variable: null,
        map_tile_layer_url: 'https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=2374da9f070e45098bff569aff92f377',
        data_table_headers: [],
        density_setting_toggle: this.$store.getters.user_settings('dense_tables'),
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
        map_norm_toggle: false,
        visualize_attribute_options: [
            {text:'Land (ac land)', value: 'xlandsc', key: 'xlandsc', metric: 'ac land'},
            {text:'Water (ac-ft) (Only correct for single crop)', value: 'xwatersc', key: 'xwatersc', metric: 'ac-ft'},
            {text:'Gross Revenue ($ gross)', value: 'gross_revenue', key: 'gross_revenue', metric: '$ gross'},
        ],
        old_map_tile_layer_url: '',
        filter_selected_years: [],
        filter_wells: [],
        filter_selected_crops: [],
        filter_selected_region: 'any',  // defunct
        filter_chart_selected_regions: [],
        filtered_base_case: [],
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
        color_scale: ['e7d090', 'e9ae7b', 'de7062'],
        currency_formatter: new Intl.NumberFormat(navigator.languages, { style: 'currency', currency: 'USD', maximumSignificantDigits: 6, maximumFractionDigits: 0}),  // format for current locale and round to whole dollars
        general_number_formatter: new Intl.NumberFormat(navigator.languages, { maximumFractionDigits: 0, maximumSignificantDigits: 6}),  // format for current locale and round to whole dollars
        no_fractions_number_formatter: new Intl.NumberFormat(navigator.languages, { maximumFractionDigits: 2}),
        allowed_filters: {},
        allowed_filters_by_tab: {0: []},
        default_filters_by_tab: {0: []},
        compare_runs_text_info: '',
        enabled_filters: [],
        percent_change_toggle: false,
        well_data: jsonDataWells,
        filtered_well_data: [],
      };
  },

  mounted() {
    this.map_geojson = this.region_geojson;  // do this at mount so we can mess with the geojson later
    this.selected_tab = this.default_tab
    this.map_selected_variable = this.map_default_variable

    if(this.density_setting_toggle){ // Vue 3 new density mode: Added checker to change spacing on table
      this.density_setting_toggle = "compact";
    } else{
      this.density_setting_toggle = "default"
    }
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
        // console.log('updating comparison data')
        let _this = this;
        this.selected_comparisons_full = []
        this.selected_comparisons.forEach(function(item) {  // then add them back based on what's currently chosen
          _this.$store.dispatch('get_model_run_with_results', item.id).then(function (model_run) {
            // retrieves the model run from the $store. If we already have results, returns it quickly, otherwise
            // it retrieves the results and only returns once we have them.
            // only push it if it's not the normalization run. We'll still want to make sure we have the results though
            _this.selected_comparisons_full.push(model_run)
          })
        })
        // console.log("sel comp", this.selected_comparisons_full)
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
        console.log("Updating")
        this.update_excluded_regions()
      },
    },
    filter_chart_selected_regions_mode: {
      handler: function () {
        this.update_excluded_regions()
      }
    },
    full_data_filtered:{
      handler: function (){
        if(this.summ_well_toggle){
          const uniqueByRegion = Array.from(
            this.full_data_filtered.reduce((map, obj) => {
              if (!map.has(obj.region)) {
                map.set(obj.HR_Region, obj);
              }
              return map;
            }, new Map()).values()
          );
          let well_region_info = [];
          for(let i = 0; i < uniqueByRegion.length; i++){
            well_region_info.push(this.get_number_wells(uniqueByRegion[i]))
          }

          const collapsed = well_region_info.reduce((acc, curr) => {
            acc.count += curr.count;
            acc.mean += curr.mean;
            acc.variance += curr.variance;
            return acc;
          }, { count: 0, mean: 0, variance: 0 });

          this.filtered_well_data = collapsed;
        }
      }
    },
    table_well_toggle: {
      handler: function (){
        if(this.table_well_toggle){
          this.table_headers.push( {title: "# of Wells", key:"wells"})
        }else {
          const indexCrop = this.table_headers.findIndex(header => header.key === "wells");

          this.table_headers.splice(indexCrop,1);
        }

      }
    },
    summ_well_toggle: {
      handler: function (){
        this.filtered_well_data = this.get_number_wells();

      }
    },
    pesticide_data_toggle: {
      handler: function (){
        if(this.pesticide_data_toggle){
          // this.table_headers.push( {title: "Crop Group", key:"crop_group"} );
          this.table_headers.push( {title: "Pesticides Used (lbs)", key:"amount_used_lbs"} );
        }else {
          const indexCrop = this.table_headers.findIndex(header => header.key === "crop_group");

          this.table_headers.splice(indexCrop,2);
        }
      }
    },
    selected_tab: {
      handler: function(){
        this.display_filters = reactive(this.default_filters_by_tab[this.selected_tab])
        this.enabled_filters = this.default_filters_by_tab[this.selected_tab];
        if(this.selected_tab === this.MAP_TAB){
          this.selected_comparisons = []
        }
        else{
          // Searching an array of objects (https://stackoverflow.com/a/50909930)
          const check_base_case = ele => ele.id === this.$store.getters.current_model_area.base_model_run.id
          if(!this.selected_comparisons.some(check_base_case) && this.comparison_options?.length > 0 && !this.is_base_case){
            const base_case_id = this.$store.getters.current_model_area.base_model_run.id;
            let base_case_w_results = this.$store.getters.current_model_area.model_runs[base_case_id];
            this.selected_comparisons.push(base_case_w_results)
          }
        }
      }
    },
  },

  methods:{
    update_map_norm(value) {
      this.map_norm = value;
    },

    get_number_wells(item){
      let count = 0;
      let info = {};

      if(!item){
        info.count = this.well_data.length;

        let depth = 0;
        for(let i = 0; i < info.count; i++){
          depth += Number(this.well_data[i].properties.gm_well_depth_ft);

        }
        info.mean = (depth / info.count);

        let variance = 0;
        for (let i = 0; i < info.count; i++) {
          let value = Number(this.well_data[i].properties.gm_well_depth_ft);
          variance += Math.pow(value - Number(info.mean), 2);
        }
        info.variance = Math.sqrt(variance / info.count);
        return info;
      }
      let depth = 0;
      for(let i = 0; i < this.well_data.length; i++){
        if(item['HR_Region'].toLowerCase() === this.well_data[i].properties.Basin_Name.toLowerCase()){
          depth += Number(this.well_data[i].properties.gm_well_depth_ft);
          count++;
        }
      }
      let variance = 0;
      info.count = count;
      info.mean = (depth / info.count);
      console.log(info)
      for (let i = 0; i < info.count; i++) {
        let value = Number(this.well_data[i].properties.gm_well_depth_ft);
        variance += Math.pow(value - Number(info.mean), 2);
      }
      info.variance = Math.sqrt(variance / info.count);

      return info;
    },

    ///
    get_pesticide_data(item){
      for(let i = 0; i < pesticide_data.length; i++){
        let region = this.$store.getters.get_region_by_id(item.region);
        // console.log("DEBUG PES", region.name.toLowerCase(), pesticide_data[i].basin_su_3.toLowerCase())
        if (region.name.toLowerCase().includes(pesticide_data[i].basin_su_3.toLowerCase())) {
          if (item.crop_class.toLowerCase().includes(pesticide_data[i].crop_group.toLowerCase())) {
            pesticide_data[i].amount_used_lbs = (pesticide_data[i].amount_used_lbs * 2.20462) // converting kg to lb
            return pesticide_data[i];
          }
        }
      }
      return {crop_group: "-", amount_used_lbs: "-"}
    },

    get_y_axis_title(){
      // Simple way of checking which y-axis we are using and what to display
      if(!this.normalize_percent_difference){
        if (this.map_selected_variable === "xlandsc" || this.map_selected_variable === "xland"){
          return "Land (ac)";
        }else if(this.map_selected_variable === "xwatersc" || this.map_selected_variable === "xwater"){
          return "Water (ac-ft)";
        } else if (this.map_selected_variable === "gross_revenue"){
          return "Gross Revenue ($)"
        } else if (this.map_selected_variable === "net_revenue"){
          return "Net Revenue ($)"
        }
        return this.map_selected_variable;
      }
    },

    format_no_fractions(value){
      return this.no_fractions_number_formatter.format(value)
    },
    filter_crop_region(item) {
      // Destructure selected_comparisons_full_filtered for easier access to result_set
      const resultSet = this.selected_comparisons_full_filtered[0].results[0].result_set;
      let temp = resultSet.filter(entry => {
        if(entry.region === item.region){
          return entry.crop === item.crop;
        }
      });
      return temp;
    },
    get_comparison_table_element(table_entry, item){
      let filtered_item = this.filter_crop_region(item);
      let table_value;

      if(filtered_item[0]){
        if(item.hasOwnProperty("gross_revenue") || item.hasOwnProperty("net_revenue")){
          if(table_entry === 'gross_revenue' || table_entry === 'net_revenue'){
            if(this.table_diff_toggle){
              table_value = this.format_currency(((filtered_item[0][table_entry]) - item[table_entry])); // to avoid numbers less than .01 round here (helps with showing -0)

              if(table_value > item[table_entry]){
                this.compare_runs_text_info = `The selected model comparison run, "${this.selected_comparisons_full_filtered[0].name}", has ${table_value} more than the current viewed model run (considering active filters)`
              } else if(table_value < item[table_entry]) {
                this.compare_runs_text_info = `The selected model comparison run, "${this.selected_comparisons_full_filtered[0].name}", has ${table_value} less than the current viewed model run (considering active filters)`
              } else{
                this.compare_runs_text_info = `This model run, "${this.selected_comparisons_full_filtered[0].name}", has the same value as the current viewed model run (considering active filters)`
              }
              return this.format_currency((filtered_item[0][table_entry]) - item[table_entry]);
            }
            return this.format_currency((filtered_item[0][table_entry]));
          }
        }
        if(table_entry === 'region'){
          return this.$store.getters.get_region_name_by_id(filtered_item[0].region);
        }
        if(!this.table_diff_toggle){
          return this.format_no_fractions(filtered_item[0][table_entry]);
        }
        table_value = this.format_no_fractions((filtered_item[0][table_entry]) - item[table_entry])
      }


      return table_value;
    },
    get_comparison_text(table_value, item){
      if( (table_value.replace(",", "")) === toString(0) ){
        return `This selected model run has the same value as the model run "${this.model_run.name}" (considering active filters)`
      }
      else if( (table_value.replace(",", "").replace("$",'')) > toString(0)){
        return `This selected model run, has ${table_value} more than the model run "${this.model_run.name}" (considering active filters)`
      }
      else if( (table_value.replace(",", "").replace("$",'')) < toString(0)) {
        return `This selected model run has ${table_value.replace('-','')} less than the model run "${this.model_run.name}" (considering active filters)`
      }
    },
    clear_filters(){
      this.filter_disable("all");
      this.display_filters = [];
    },
    update_map_max_value(value) {
      this.map_max_value = value;
    },
    update_map_min_value(value) {
      this.map_min_value = value;
    },
    set_allowed_filters(){ // run once when mounted - see comment in mounted()
      let allowed_filters = {
          'region_multi': [],
          'region_multi_standalone': [this.SUMMARY_TAB, this.TABLE_TAB, this.CHART_TAB, this.MAP_TAB],
          'crop_multi': [this.MAP_TAB, this.TABLE_TAB, this.SUMMARY_TAB],
          'years': this.unique_years.length > 1 ? [this.MAP_TAB, this.CHART_TAB, this.TABLE_TAB, this.SUMMARY_TAB] : [],
          'parameter': [this.MAP_TAB, this.CHART_TAB],
          'irrigation_switch': this.has_rainfall_data ? [this.CHART_TAB, this.MAP_TAB, this.SUMMARY_TAB, this.TABLE_TAB] : [],
          'stack': [this.CHART_TAB],
          'chart_download': [this.CHART_TAB],
          'viz_options': [this.CHART_TAB, this.SUMMARY_TAB, this.TABLE_TAB, this.MAP_TAB],
          'map_norm': [this.MAP_TAB],
          'difference': [this.MAP_TAB],
          'baseline': [this.CHART_TAB],
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
      lookup[this.TABLE_TAB] = TABLE_ALLOWED.length > 3 ? ['region_multi_standalone', 'crop_multi','viz_options'] : TABLE_ALLOWED;
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
      if(value === null || value === undefined){
        return '-'
      }
      return this.currency_formatter.format(value)
    },
    filter_allowed(item) {
      if(item === "clear"){
        this.clear_filters();
      }
      // if('stack'){
      //   if(this.normalize_to_model_run){
      //     this.normalize_to_model_run_pre_retrieve = null;
      //     this.$store.commit('app_notice', {message: "Removed normalize model run, can't have both at the same time", timeout: 3000})
      //   }
      // }
      if (this.allowed_filters[item]) {
        return this.allowed_filters[item].includes(this.selected_tab);
      }
      return false;
     },
    filter_enabled(item){
      // it's allowed to be used and the user has enabled it via the controls
      if(item === 'stack' && this.charts_stacked_bars){
        if(this.normalize_to_model_run){
          this.normalize_to_model_run_pre_retrieve = null;
          this.$store.commit('app_notice', {message: "Removed normalize model run, can't have both at the same time", timeout: 3000, send_to_log: false})
        }
      }
      return this.display_filters.includes(item) && this.filter_allowed(item)
    },
    filter_disable(item){
        switch (item){
          case 'viz_options':
            if(this.display_filters.length > 0 && this.display_filters.find(ele => ele === item)){
              this.display_filters.filter(ele => ele !== item); // Removes the item but keeps everything else
              if(!this.is_base_case){
                this.selected_comparisons = [this.$store.getters.base_case_full]
              } else {
                this.selected_comparisons = []
              }
              this.selected_comparisons_full = []
              this.normalize_to_model_run = null
              this.normalize_to_model_run_pre_retrieve = null  // we sync the control with this, then update normalize_to_model_run once we have results
              this.normalize_percent_difference = false
              console.log("resetting viz")
            } else{
              this.display_filters.concat(item);
            }
            break;
          case 'region_multi_standalone':
            if(this.display_filters.length > 0 && this.display_filters.find(ele => ele === item)){
              this.display_filters.filter(ele => ele !== item); // Removes the item but keeps everything else
              this.filter_region_selection_info = {
                selected_rows: [],
                filter_selected_exclude: [],
                filter_mode_exclude: false,
                current_selection: false
              }
              console.log("resetting regions")

            } else {
              this.display_filters.concat(item)
            }
            break
          case 'years':
            if(this.display_filters.length > 0 && this.display_filters.find(ele => ele === item)){
              this.display_filters.filter(ele => ele !== item); // Removes the item but keeps everything else
              this.filter_selected_years = [];
              console.log("resetting years")

            } else {
              this.display_filters.concat(item)
            }
            break
          case 'parameter':
            if(this.display_filters.length > 0 && this.display_filters.find(ele => ele === item)){
              this.display_filters.filter(ele => ele !== item); // Removes the item but keeps everything else
              this.map_selected_variable = this.map_default_variable;
              console.log("resetting map variable")

            } else {
              this.display_filters.concat(item)
            }
            break;
          case 'stack':
            if(this.display_filters.length > 0 && this.display_filters.find(ele => ele === item)){
              this.display_filters.filter(ele => ele !== item); // Removes the item but keeps everything else
              this.charts_stacked_bars = false;
              console.log("resetting stack")

            } else {
              this.display_filters.concat(item)
            }
            break
          case 'irrigation_switch':
            if(this.display_filters.length > 0 && this.display_filters.find(ele => ele === item)){
              this.display_filters.filter(ele => ele !== item); // Removes the item but keeps everything else
              this.toggle_data_include = [0,1];
              console.log("resetting switches")

            } else {
              this.display_filters.concat(item)
            }
            break
          case 'crop_multi':
            if(this.display_filters.length > 0 && this.display_filters.find(ele => ele === item)){
              this.display_filters.filter(ele => ele !== item); // Removes the item but keeps everything else
              this.filter_selected_crops = [];
              console.log("resetting crop")

            } else {
              this.display_filters.concat(item)
            }
            break
          case 'all':
            this.filter_selected_crops = [];
            this.display_filters = [];
            this.toggle_data_include = [0,1];
            this.charts_stacked_bars = false;
            this.map_selected_variable = this.map_default_variable;
            this.filter_selected_years = [];
            this.filter_region_selection_info = {
              selected_rows: [],
              filter_selected_exclude: [],
              filter_mode_exclude: false,
              current_selection: false
            }
            if(!this.is_base_case){
                this.selected_comparisons = [this.$store.getters.base_case_full]
              } else {
                this.selected_comparisons = []
            }
            this.selected_comparisons_full = []
            this.normalize_to_model_run = null
            this.normalize_to_model_run_pre_retrieve = null  // we sync the control with this, then update normalize_to_model_run once we have results
            this.normalize_percent_difference = false
            console.log("all default")
        }
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
        this.$store.commit('app_notice', {message: 'Removed normalization model run from comparison runs - can\'t use in both places', timeout: 5000})
        this.selected_comparisons.splice(index_of_normalize_run, 1)
      }
    },
    toggle_normalize(normalize_filter){ // Checks to see if normalize is on when trying to activate stack chart
      if(normalize_filter === true && this.charts_stacked_bars === true){
        this.charts_stacked_bars = false;
        this.$store.commit('app_notice', {message: "Turned off stacked bar chart - can't used both at the same time", timeout: 3000})
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

      return base_data?.filter(function(record){
        // basically an AND filter
        // Check that the filter is currently allowed/active, then check if there's a selection active, then actually filter the records to the matching selections.
        // If the filter isn't allowed, then it returns all records for that type (years/regions/crops), and if nothing is
        // selected, then it also assumes inclusion of all records for that type. So the filter needs to be allowed and have items
        // chosen in order to filter the output set.
        return (!_this.filter_allowed('years') || _this.filter_selected_years.length === 0 || _this.filter_selected_years.some(year_sel => year_sel === record.year)) &&
            (!(_this.filter_allowed('region_multi') || _this.filter_allowed('region_multi_standalone')) || selected_regions.length === 0 || selected_regions.some(reg_sel => reg_sel.id === record.region)) &&
            (!_this.filter_allowed('crop_multi') || _this.filter_selected_crops.length === 0 || _this.filter_selected_crops.some(crop_sel => crop_sel.value === record.crop))
      })
    },
    region_filter(data_series){
      if(this.filter_regions.length === 0){
        return data_series
      }

      let region_data_series = data_series.filter(item => this.key.findIndex(region => Number(region.id) === item.region) > -1)
      return region_data_series
    },

    download_regions(){
      let group_data = null;
      if(this.$store.getters.current_model_area.region_group_sets.length > 0){  // if we have region groups, include them in the download
        group_data = this.$store.getters.current_model_area.region_groups
      }
      this.$stormchaser_utils.download_regions_as_shapefile(this.$store.getters.current_model_area.regions, ['id', 'name', 'internal_id'], group_data)
    },

  },

  computed:{
    has_revenues: function(){
      // in some cases we need to know that we have revenue available. Check if it's one of the fields passed in
      // and return true if at least one has a gross_revenue key
      if(this.map_variables){
        return this.map_variables.some(variable => variable.value === 'gross_revenue');
      } else {
        return false
      }
    },
    has_rainfall_data: function(){
      return this.rainfall_data !== null && this.rainfall_data !== undefined && this.rainfall_data.length > 0;
    },

    selected_comparisons_full_filtered(){
      let _this = this;
      return this.selected_comparisons_full.map(function(model_run){
        let model_run_data = _.cloneDeep(model_run) // clone it because we're going to overwrite results since the ResultsVisualizerBasic uses the whole structure. If we didn't clone then the next update would be incorrect (it would accumulate updates)
        model_run_data.results[0].result_set = _this.filter_model_run_records(model_run_data.results[0].result_set, model_run_data.results[0].rainfall_result_set)

        return model_run_data
      });
    },
    normalize_to_model_run_filtered(){
      let model_run_data = _.cloneDeep(this.normalize_to_model_run)
      if (model_run_data !== null){
        model_run_data.results[0].result_set = this.filter_model_run_records(model_run_data.results[0].result_set, model_run_data.results[0].rainfall_result_set)
        return model_run_data
      }
      return null;

    },
    data_include_rainfall: function(){
      return this.toggle_data_include.indexOf(0) > -1;
    },
    data_include_irrigated: function(){
      return this.toggle_data_include.indexOf(1) > -1;
    },
    region_geojson: function(){
      return this.$stormchaser_utils.regions_as_geojson(this.$store.getters.current_model_area.regions, ['id', 'name']);
    },
    full_data_filtered: function(){
      return this.filter_model_run_records(this.model_data, this.rainfall_data)
    },

    unique_crops: function(){
      return this.unique_items_list('crop', this.$store.getters.get_crop_name_by_id);
    },

    unique_years: function(){
      return this.unique_items_list( 'year');
    },

    california_wells: function(){
      return ['Low', 'Medium', 'High', 'Dry']
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

    sorted_regions(){
      return this.sort_by_name(this.$store.getters.current_model_area.region_set)
    },
    filter_regions(){
      return this.filter_region_selection_info.filter_mode_exclude ? this.filter_region_selection_info.filter_selected_exclude : this.filter_region_selection_info.selected_rows
    },
  },
});
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
leaflet-control-container
  .leaflet-top
    .leaflet-right
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

.basemap_options, .leaflet-control-container
  background-color: rgba(255,255,255,0.8)
  border-radius: 3px
  padding: 0.5em

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

.v-data-table__th
  .v-data-table-header__content
    span
      font-weight bold

.v-divider
  padding-bottom 10px

.pa-2
  text-align center

  .button-container {
    display: flex;
    flex-direction: column;
    gap: 100px;  /* Adds space between buttons */
}


</style>