<template>
  <v-container>
    <v-row>
      <v-row>
      <v-col class="col-12 col-md-4"
             v-if="selected_tab < CHART_TAB">
        <h4>Filter to Crop</h4>
        <v-autocomplete
            v-model="filter_selected_crop"
            :items="unique_crops"
            label="Filter to Crop"
            persistent-hint
            solo
        ></v-autocomplete>
      </v-col>
      <v-col class="col-12 col-md-4"
             v-if="(selected_tab === TABLE_TAB && unique_years.length > 2) || (selected_tab !== TABLE_TAB && unique_years.length > 1)">
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
        v-if="selected_tab === TABLE_TAB">
        <h4>Filter to Region</h4>
        <v-autocomplete
            v-model="filter_selected_region"
            :items="unique_regions"
            label="Filter to Region"
            persistent-hint
            solo
        ></v-autocomplete>
      </v-col>
      <v-col class="col-12 col-md-4"
               v-if="selected_tab === MAP_TAB || selected_tab === CHART_TAB">
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
             v-if="selected_tab === CHART_TAB && comparison_options.length > 0 && preferences.allow_viz_multiple_comparisons">
        <h4>Comparison Runs</h4>
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
            solo
        ></v-autocomplete>

        <v-autocomplete
            v-model="normalize_to_model_run"
            :items="comparison_options"
            label="Normalize To Model Run"
            item-value="id"
            item-text="name"
            return-object
            persistent-hint
            clearable
            deletable-chips
            chips
            solo
        ></v-autocomplete>
      </v-col>
      <v-col class="col-12 col-md-4"
             id="stacked_charts_switch"
             v-if="selected_tab === CHART_TAB">
        <h4>Stack Bars by Crop</h4>
        <v-switch
            v-model="charts_stacked_bars"
            label="Stack Bars by Crop"
        ></v-switch>
      </v-col>
    </v-row>
      <v-tabs
          active-class="active_tab"
          v-model="selected_tab">
        <v-tab>Map</v-tab>
        <v-tab>Table</v-tab>
        <v-tab>Charts</v-tab>
        <v-tab-item>
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
        <v-tab-item>
          <v-data-table
              :headers="table_headers"
              :items="table_model_data"
              item-key="id"
              multi-sort
              sort-by="region,crop,year"
              sort-desc
              class="elevation-1"
              items-per-page=50
          >
            <template v-slot:item.region="{ item }">
              <span class="region_name">{{ $store.getters.get_region_name_by_id(item.region) }}</span>
            </template>
            <template v-slot:item.crop="{ item }">
              <span class="crop_name">{{ $store.getters.get_crop_name_by_id(item.crop) }}</span>
            </template>
            <template v-slot:item.p="{ item }"> <!-- `$${Number(Math.round(Number(item.p + "e2")) + "e-2")}` -->
              <span class="price">{{ `$${Math.round(Number(item.p))}` }}</span>
            </template>
            <template v-slot:item.omegaland="{ item }"> <!-- `$${Number(Math.round(Number(item.p + "e2")) + "e-2")}` -->
              <span class="price">{{ `$${Math.round(Number(item.omegaland))}` }}</span>
            </template>
            <template v-slot:item.omegasupply="{ item }"> <!-- `$${Number(Math.round(Number(item.p + "e2")) + "e-2")}` -->
              <span class="price">{{ `$${Math.round(Number(item.omegasupply))}` }}</span>
            </template>
            <template v-slot:item.omegalabor="{ item }"> <!-- `$${Number(Math.round(Number(item.p + "e2")) + "e-2")}` -->
              <span class="price">{{ `$${Math.round(Number(item.omegalabor))}` }}</span>
            </template>
            <template v-slot:item.omegatotal="{ item }"> <!-- `$${Number(Math.round(Number(item.p + "e2")) + "e-2")}` -->
              <span class="price">{{ `$${Math.round(Number(item.omegatotal))}` }}</span>
            </template>
            <template v-slot:item.y="{ item }"> <!--  -->
              <span class="yield">{{ `${Number(Math.round(Number(item.y + "e2")) + "e-2")}` }}</span>
            </template>
            <template v-slot:item.xland="{ item }"> <!--  -->
              <span class="land">{{ Math.round(item.xland) }}</span>
            </template>
            <template v-slot:item.xwater="{ item }"> <!--  -->
              <span class="water">{{ `${Number(Math.round(Number(item.xwater + "e2")) + "e-2")}` }}</span>
            </template>
            <template v-slot:item.xlandsc="{ item }">
              <span class="xlandsc">{{ `${Math.round(Number(item.xlandsc))}` }}</span>
            </template>
            <template v-slot:item.gross_revenue="{ item }">
              <span class="gross_revenue">{{ `$${Math.round(Number(item.gross_revenue))}` }}</span>
            </template>
            <template v-slot:item.net_revenue="{ item }">
              <span class="net_revenue">{{ `$${Math.round(Number(item.net_revenue))}` }}</span>
            </template>
            <template v-slot:item.water_per_acre="{ item }">
              <span class="water_per_acre">{{ `${Number(Math.round(Number(item.water_per_acre + "e2")) + "e-2")}` }}</span>
            </template>
            <template v-slot:item.xwatersc="{ item }">
              <span class="xwatersc">{{ `${Math.round(Number(item.xwatersc))}` }}</span>
            </template>
          </v-data-table>
        </v-tab-item>
        <v-tab-item>
          <ResultsVisualizerBasic
              :model_data="chart_model_data"
              :regions="$store.getters.current_model_area.regions"
              :visualize_attribute="map_selected_variable"
              :visualize_attribute_options="chart_attribute_options"
              :stacked="charts_stacked_bars"
              :comparison_items="selected_comparisons"
          ></ResultsVisualizerBasic>
        </v-tab-item>
      </v-tabs>
    </v-row>
    <v-row style="margin-top:1em">
      <v-btn
          v-if="download_name"
          @click="download_data"><v-icon>mdi-download</v-icon>Download Data as CSV</v-btn>
    </v-row>
  </v-container>
</template>

<script>
import { LMap, LTileLayer, LControl } from 'vue2-leaflet'
import {  InfoControl, ReferenceChart, ChoroplethLayer } from 'vue-choropleth'
import ResultsVisualizerBasic from "@/components/ResultsVisualizerBasic";

export default {
  name: "DataViewer",
  components: {
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
        MAP_TAB: 0,
        TABLE_TAB: 1,
        CHART_TAB: 2,
        charts_stacked_bars: false,
        selected_comparisons: [],
        normalize_to_model_run: null,
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
        filter_selected_year: "any",
        filter_selected_crop: "any",
        filter_selected_region: "any",
        color_scale: ["e7d090", "e9ae7b", "de7062"],

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
    normalize_to_model_run: {
      handler: function(){
        this.check_normalize_and_comparisons()
      }
    },
    selected_comparisons: {
      handler: function(){
        this.check_normalize_and_comparisons()
      }
    }
  },
  methods:{
    check_normalize_and_comparisons(){
      if(this.normalize_to_model_run === null){
        return;
      }
      let index_of_normalize_run = this.selected_comparisons.findIndex(comp => comp.id === this.normalize_to_model_run.id);
      console.log(index_of_normalize_run)
      if(index_of_normalize_run > -1){
        // if we found the normalize run in the selected comparisons, remove it
        this.selected_comparisons = this.selected_comparisons.splice(index_of_normalize_run, 1)
      }
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
      if(this.selected_tab === 1){ // if we're on the data table tab, start items with an "any" value - not for the map
        output_items.push({text: "Any", value: "any"})
      }

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
  },
  computed: {
    region_geojson: function(){
      return this.$stormchaser_utils.regions_as_geojson(this.$store.getters.current_model_area.regions, ["id", "name"])
    },
    map_model_data: function(){
      let _this = this
      let filtered_data = this.model_data;
      if (this.unique_years.length > 1) {  // if we have more than one year, then filter by year, otherwise keep it all
        filtered_data = filtered_data.filter(record => record.year === _this.filter_selected_year)
      }
      filtered_data = filtered_data.map(function(record){  // attach the region name to the map data
        record.name = _this.$store.getters.current_model_area.regions[record.region].name
        return record
      });
      return filtered_data.filter(record => record.crop === _this.filter_selected_crop)
    },
    table_model_data: function(){
      let _this = this
      return this.model_data.filter(function(record){
        return (_this.filter_selected_year === "any" || record.year === _this.filter_selected_year) &&
            (_this.filter_selected_region === "any" || record.region === _this.filter_selected_region) &&
            (_this.filter_selected_crop === "any" || record.crop === _this.filter_selected_crop)
      })
    },
    chart_model_data: function(){
      let _this = this;
      console.log(`Unique Years: ${this.unique_years.length}`)
      if (this.unique_years.length === 1){
        return this.model_data
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

</style>