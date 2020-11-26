<template>
  <v-container>
    <v-row>
      <v-row>
      <v-col class="col-xs-12 col-md-4"
             v-if="selected_tab < 2">
        <h3>Filter to Crop</h3>
        <v-autocomplete
            v-model="filter_selected_crop"
            :items="unique_crops"
            label="Crop"
            persistent-hint
            solo
        ></v-autocomplete>
      </v-col>
      <v-col class="col-xs-12 col-md-4"
             v-if="unique_years.length > 1">
        <h3>Filter to Year</h3>
        <v-autocomplete
            v-model="filter_selected_year"
            :items="unique_years"
            label="Year"
            persistent-hint
            solo
        ></v-autocomplete>
      </v-col>
      <v-col class="col-xs-12 col-md-4"
        v-if="selected_tab === 1">
        <h3>Filter to Region</h3>
        <v-autocomplete
            v-model="filter_selected_region"
            :items="unique_regions"
            label="Year"
            persistent-hint
            solo
        ></v-autocomplete>
      </v-col>
      <v-col class="col-xs-12 col-md-4"
               v-if="selected_tab === 0">
          <h3>Map Value</h3>
          <v-autocomplete
              v-model="map_selected_variable"
              :items="map_variables"
              label="Map Variable"
              persistent-hint
              solo
          ></v-autocomplete>
      </v-col>
    </v-row>
      <v-tabs
          v-model="selected_tab">
        <v-tab>Map</v-tab>
        <v-tab>Table</v-tab>
        <v-tab>Charts</v-tab>
        <v-tab-item>
          <v-row>
            <v-col class="col-xs-12">
              <p>Select a crop and year above to display input data on the map</p>
              <l-map
                  :center="map_center"
                  :zoom="map_zoom"
                  style="height: 500px;">
                <l-tile-layer :url="map_tile_layer_url"></l-tile-layer>
                <l-choropleth-layer
                    :data="map_model_data"
                    titleKey="region"
                    idKey="region"
                    :value="map_value"
                    geojsonIdKey="id"
                    :geojson="map_geojson"
                    :colorScale="color_scale"
                    strokeColor="#999"
                    :strokeWidth=0
                >
                  <template slot-scope="props">
                    <l-info-control
                        :item="props.currentItem"
                        :unit="props.metric"
                        title="Land Area"
                        placeholder="Hover over a region"/>
                    <l-reference-chart
                        title="Regions"
                        :colorScale="color_scale"
                        :min="Math.round(props.min)"
                        :max="Math.round(props.max)"
                        position="topright"/>
                  </template>
                </l-choropleth-layer>
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
          </v-data-table>
        </v-tab-item>
        <v-tab-item>
          <ResultsVisualizerBasic
              :model_data="chart_model_data"
              :regions="$store.getters.current_model_area.regions"
              :default_visualize_attribute="default_chart_attribute"
              :visualize_attribute_options="chart_attribute_options"
          ></ResultsVisualizerBasic>
        </v-tab-item>
      </v-tabs>
    </v-row>
  </v-container>
</template>

<script>
import { LMap, LTileLayer,  } from 'vue2-leaflet'
import {  InfoControl, ReferenceChart, ChoroplethLayer } from 'vue-choropleth'
import ResultsVisualizerBasic from "@/components/ResultsVisualizerBasic";

export default {
  name: "DataViewer",
  components: {
    LMap,
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
    map_metric: String,
    map_variables: Array,
    default_tab: Number,
    default_chart_attribute: String,
    chart_attribute_options: Array,
  },
  data: function(){
      return {
        selected_tab: 0,
        map_geojson: {type: "FeatureCollection", features: []},
        map_selected_variable: null,
        map_tile_layer_url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
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
  },
  methods:{
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
      return this.$stormchaser_utils.regions_as_geojson(this.$store.getters.current_model_area.regions, "id")
    },
    map_model_data: function(){
      let _this = this
      let filtered_data = this.model_data;
      if (this.unique_years.length > 1) {  // if we have more than one year, then filter by year, otherwise keep it all
        filtered_data = filtered_data.filter(record => record.year === _this.filter_selected_year)
      }
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
      return {key: this.map_selected_variable, metric: this.map_metric}
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
/* Make the top right bar wider so the text is visible */
.leaflet-top.leaflet-right
  width: 20%
  min-width: 150px;

  .info.leaflet-control
    width: 100%;

/* Make sure that the filter dropdowns sit above the maps */
.v-menu__content.theme--light.menuable__content__active.v-autocomplete__content
  z-index: 1000 !important;  /* So annoying to have to use !important to override styles that frameworks set */

</style>