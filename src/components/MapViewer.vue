<template>
  <v-row>
    <v-col class="col-12">
      <p>Select values from the dropdowns above to display data on the map. Hover over a region to see values compared to the base case</p>
      <div>
        <l-map
        :center="map_center"
        :zoom="map_zoom"
        style="height: 500px"
        @ready="onMapReady"
        >
          <l-tile-layer :url="map_tile_layer_url"
          :attribution="map_attribution"
          ></l-tile-layer>
          <l-geo-json :geojson="map_geojson" :optionsStyle="map_region_style"
            :options="{
              onEachFeature: map_hover_and_click
            }"
          >
          </l-geo-json>
          <l-control class="basemap_options" position="bottomleft">
            <v-select
            v-model="map_tile_layer_url"
            :items="map_tile_layer_options"
            item-title="text"
            label="Basemap"
            ></v-select>
          </l-control>

          <l-control class="basemap_options" position="topright">
            <h3 id="legend_title"><b>Reference Chart</b></h3>
            <p class="display_map_item">{{get_legend_display()}}</p>
            <div class="value_content" v-if="map_norm">
              <span id="min_value" class="map_min">{{(min_value).toFixed(4)}}</span>
              <span id="max_value" class="map_max">{{(max_value.toFixed(4))}}</span>
            </div><div class="value_content" v-else>
              <span id="min_value" class="map_min">{{format_no_fractions(min_value)}}</span>
              <span id="max_value" class="map_max">{{format_no_fractions(max_value)}}</span>
            </div>
            <br/>
            <div class="gradient-bar" :style="{ background: gradientStyle }" ></div>
            <div v-if="filter_wells.length > 0">
              <div class="value_content" >
                    <p class="well_text">Well Depth</p>
                    <span id="min_value" class="map_min">{{(well_min_max.min)}}</span>
                    <span id="max_value" class="map_max">{{(well_min_max.max)}}</span>
                    <div class="gradient-bar-well"  ></div>
                  </div>
            </div>
            <br>

            <div style="display: inline" v-if="true">
              <div class="line-marker" :style="{ background: '#3388ff' }"></div>
              <p class="line-marker-name">GSA Regions</p>
            </div>
            <div>
              <ReferenceChart
                :model_data="reference_data"
                :map_selected_variable="map_selected_variable"
                :full_model_data="model_data"
                :crop_year_filter="selected_filters"
                :compare_data="selected_comparisons_full"
                :is_base_case="is_base_case"
              ></ReferenceChart>
            </div>
          </l-control>

          <l-control class="basemap_options" position="bottomright">
  <!--          <h3><b>Reference Chart</b></h3>-->
            <div v-html="region_info"></div>
            <div>
              <l-geo-json :options="{ onEachFeature: map_hover_and_click }">Hover over a region</l-geo-json>
            </div>
          </l-control>
      </l-map>
      <div>
        <p v-if="this.$store.getters.current_model_area.background_code === 'cali' ||this.$store.getters.current_model_area.background_code === 'ca_cv' ">Source: GSA Boundaries</p>
        <p>Note: Darker colors represent high value numbers while lighter colors represents low value numbers. Gray is for no data available</p>
      </div>
      </div>
      <div v-if="chart_display">
        <Plotly ref="plot" :data="plot_data" :layout="plot_layout"></Plotly>
      </div>
    </v-col>
  </v-row>
</template>

<script>
import {LControl, LGeoJson, LMap, LTileLayer, LTooltip} from "@vue-leaflet/vue-leaflet";
// import L from "leaflet";
import {defineComponent, reactive} from "vue";
import ReferenceChart from "./ReferenceChart.vue";
import RegionFilter from "./RegionFilter.vue";
import * as d3 from 'd3'; // https://observablehq.com/@d3/quantile-quantize-and-threshold-scales?collection=@d3/d3-scale
import "leaflet.markercluster";
import Plotly from "@aurium/vue-plotly";
import jsonDataWells from '../assets/california_wells_EDIT.json'
import jsonDataWellsDry from '../assets/dry_wells.json'



export default  defineComponent({
  name: "MapViewer",

  components: {
    Plotly,
    LMap,
    LControl,
    LTileLayer,
    LGeoJson,
    LTooltip,
    ReferenceChart,
    RegionFilter,
  },
  props:{
    map_default_variable: String,
    map_variables: Array,
    map_selected_variable: String,
    model_data: Array,
    visualize_attribute_options: Array,
    filter_crop_year: Array,
    filter_wells: {
      type: Array,
      default: []
    },
    map_norm: Boolean,
    percent_toggle: Boolean,
    difference_toggle: Boolean,
    selected_comparisons_full: Object,
    result_data: Array,
    selected_filters: Array, // Combines all filters into one array to access later
    map_update_btn: Boolean,
    filtered_base_case: Array,
    is_base_case: {
      type: Boolean,
      default: false
    },
    selected_regions: Number,
  },
  data(){
    return{
      map_geojson: reactive({type: 'FeatureCollection', features: []}),
      colorScaleLand: ['#FEB24C', '#E31A1C', '#3a0115'],
      colorScaleWater: ['#D0EDCF', '#73C69D', '#0a3151'],
      colorScaleRev: ['#CEE1A8', '#91CB70', '#005902'],
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
      map_tile_layer_url: 'https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=2374da9f070e45098bff569aff92f377',
      old_map_tile_layer_url: '',
      min_value: Infinity,
      max_value: -Infinity,
      no_fractions_number_formatter: new Intl.NumberFormat(navigator.languages, { maximumFractionDigits: 0, maximumSignificantDigits: 1}),
      accumulated_compare_run: [],
      region_info: "",
      reference_data: [],
      map_geojson_area: [],
      loading: false,
      iframe_failed: false,
      norm_variable_map: new Map([
        ["xlandsc", "xlandsc_norm"],
        ["xwatersc", "xwatersc_norm"],
        ["gross_revenue", "gross_revenue_norm"],
        ["net_revenue", "net_revenue_norm"],
      ]),
      percent_variable_map: new Map([
        ["xlandsc", "xlandsc_percent"],
        ["xwatersc", "xwatersc_percent"],
        ["gross_revenue", "gross_revenue_percent"],
        ["net_revenue", "net_revenue_percent"],
      ]),
      difference_variable_map: new Map([
        ["xlandsc", "xlandsc_difference"],
        ["xwatersc", "xwatersc_difference"],
        ["gross_revenue", "gross_revenue_difference"],
        ["net_revenue", "net_revenue_difference"],
      ]),
      acc_model_data: [],
      acc_base_case_data: [],
      map_norm_test: false,
      well_data_low: [],
      well_data_med: [],
      well_data_high: [],
      map_obj: null,
      clusterGroup: null,
      map_well_types: {},
      well_min_max: {},
    }
  },


  mounted() {
    this.map_geojson = this.region_geojson;  // do this at mount so we can mess with the geojson later
    this.selected_tab = this.default_tab;
    this.get_min_max_values(this.map_geojson.features)
    this.draw_map();

    let well_data = jsonDataWells
    let min = 999999;
    let max = -99999;

    for (let i = 0; i < well_data.length; i++) {
      if(well_data[i]["properties"]["freq"] === 'Low'){
        if(Number(well_data[i]["properties"]["gm_well_depth_ft"]) < min){
          min = well_data[i]["properties"]["gm_well_depth_ft"];
        }
        this.well_data_low.push(well_data[i])
        this.map_well_types.low = this.well_data_low
      } else if(well_data[i]["properties"]["freq"] === 'Medium'){
        this.well_data_med.push(well_data[i])
        this.map_well_types.medium = this.well_data_med
      } else {
        if(Number(well_data[i]["properties"]["gm_well_depth_ft"]) > max){
          max = well_data[i]["properties"]["gm_well_depth_ft"];
        }
        this.well_data_high.push(well_data[i])
        this.map_well_types.high = this.well_data_high
      }
    }

    this.map_well_types.dry = jsonDataWellsDry;
    this.well_min_max.min = min;
    this.well_min_max.max = max;
  },

  refresh_map(){
      this.map_geojson.features.push({})
      this.map_geojson.features.pop();
  },

  emits: ['map_max_value','map_min_value'],

  watch:{
    map_selected_variable: function (){
      for(let feat = 0; feat < this.map_geojson.features.length; feat++){
        if(this.map_geojson.features[feat]){
          this.map_region_style(this.map_geojson.features[feat]);
        }
      }
      this.get_min_max_values(this.map_geojson.features)
      this.map_geojson = { ...this.map_geojson }; // Copy map again to activate refresh
    },

    filter_crop_year: function (){
      if(this.map_norm){
        this.get_map_norm_vals();
        for(let feat = 0; feat < this.map_geojson.features.length; feat++){
        if(this.map_geojson.features[feat]){
          this.map_region_style(this.map_geojson.features[feat]);
        }
      }
        return ;
      }
      for(let feat = 0; feat < this.map_geojson.features.length; feat++){
        if(this.map_geojson.features[feat]){
          this.map_region_style(this.map_geojson.features[feat]);
        }
      }
      this.get_min_max_values(this.map_geojson.features)

      this.map_geojson = { ...this.map_geojson }; // Copy map again to activate refresh
    },
    filter_wells: function (updated){
      let pointsGeojson = [];
      if(this.clusterGroup || updated.length < 0){
        this.clusterGroup.clearLayers();
      }

      let _this = this
      updated.filter(t => {
        if(_this.filter_wells.includes(t)){
          pointsGeojson.push(..._this.map_well_types[t.toLowerCase()])
        }
      })

      this.clusterGroup = L.markerClusterGroup({
        iconCreateFunction: function (cluster)  {
          const count = cluster.getChildCount();

          // You can scale or color by count if you want
          let size = "small";
          if (count > 5) size = "large";
          else if (count > 10) size = "medium";

          return L.divIcon({
            html: `<div class="cluster-icon" style="background-color: #648FFF; text-align: center; border-radius: 50px">${count}</div>`,
            className: "cluster-icon", // only affects the wrapper
            iconSize: [40, 40]
          });
        }
      });
    // console.log(pointsGeojson)
      L.geoJSON(pointsGeojson, {
        pointToLayer: (feature, latlng) => L.marker(latlng),
        onEachFeature: (feature, layer) => {
          layer.bindPopup(
            `
              <b>${feature.properties?.gm_county_name} -  ${feature.properties?.["Basin_Name"]}</b><br>
              <b>Depth:</b> ${feature.properties?.gm_well_depth_ft} ft<br>
              <b>Level:</b> ${feature.properties?.freq} <br>
              <b>Priority: </b>  ${feature.properties?.priority}
            `
          );
        }
      }).addTo(this.clusterGroup);
      this.map_obj.addLayer(this.clusterGroup)
    },
    max_value: function(){
      this.$emit('map_max_value', this.max_value);
    },
    min_value: function(){
      this.$emit('map_min_value', this.min_value);
    },

    percent_toggle: function(){
      if(this.percent_toggle){
        this.get_percent_change();

      } else {
        for(let feat = 0; feat < this.map_geojson.features.length; feat++){
          if(this.map_geojson.features[feat]){
            this.map_region_style(this.map_geojson.features[feat]);
          }
        }
        this.get_min_max_values(this.map_geojson.features)
        this.map_geojson = { ...this.map_geojson }; // Copy map again to activate refresh
      }
    },

    difference_toggle: function(){
      if(this.difference_toggle){
        this.get_difference_change();

      } else {
        for(let feat = 0; feat < this.map_geojson.features.length; feat++){
          if(this.map_geojson.features[feat]){
            this.map_region_style(this.map_geojson.features[feat]);
          }
        }
        this.get_min_max_values(this.map_geojson.features)
        this.map_geojson = { ...this.map_geojson }; // Copy map again to activate refresh
      }
    },

    map_norm: function(){
      if(this.map_norm){
        this.get_map_norm_vals();

      } else {
        for(let feat = 0; feat < this.map_geojson.features.length; feat++){
          if(this.map_geojson.features[feat]){
            this.map_region_style(this.map_geojson.features[feat]);
          }
        }
        this.get_min_max_values(this.map_geojson.features)
        this.map_geojson = { ...this.map_geojson }; // Copy map again to activate refresh
      }

    },

    accumulated_compare_run: function (){
      if(this.model_data.length > 0){
        this.min_value = Infinity
        this.max_value = -Infinity
      } else {
        this.min_value = Infinity
        this.max_value = -Infinity
      }
      this.get_min_max_values(this.map_geojson.features)
      for(let feat = 0; feat < this.accumulated_compare_run.length; feat++){
        if(this.accumulated_compare_run.features[feat]){
          this.map_region_style(this.accumulated_compare_run.features[feat]);
        }
      }
      this.map_geojson = { ...this.map_geojson }; // Copy map again to activate refresh
    },

    selected_comparisons_full: function(){
      if(this.selected_comparisons_full){
        let data = Object.values(
          this.selected_comparisons_full.results[0].result_set.reduce((acc, obj) => { // Accumulating to region to access later for comparing
              const key = `${obj.region}`; // Unique key based on region and crop
              if (!acc[key]) {
                  acc[key] = { ...obj }; // Initialize the group
              } else {
                  // Sum up values
                  acc[key].gross_revenue = parseFloat(obj.gross_revenue) + parseFloat(acc[key].gross_revenue);
                  acc[key].xwatersc = parseFloat(obj.xwatersc) + parseFloat(acc[key].xwatersc);
                  acc[key].xlandsc = parseFloat(obj.xlandsc) + parseFloat(acc[key].xlandsc);
              }

              return acc;
            }, {})
        );
        this.accumulated_compare_run.push(data);



        return data
      } else { // This will reset the color
        this.map_geojson = { ...this.map_geojson }; // Copy map again to activate refresh
      }
    },
  },


  computed: {
    map_attribution: function () {
      let _this = this;
      return this.map_tile_layer_options.find(item => item.value === _this.map_tile_layer_url).attribution
    },

    map_center: function () {
      return [this.$store.getters.current_model_area.map_center_latitude, this.$store.getters.current_model_area.map_center_longitude]
    },

    map_zoom: function () {
      return this.$store.getters.current_model_area.map_default_zoom;
    },

    region_geojson: function () {
      return this.$stormchaser_utils.regions_as_geojson(this.$store.getters.current_model_area.regions, ['id', 'name']);
    },
    plot_layout: function(){
      let layout = {
        xaxis: {
          hoverformat: '.4s'
        },
        yaxis: {
          type: 'log',
          hoverformat: '.4s',
          // title: {
          //   text: this.y_axis_title, // Add the title for the Y-axis here
          //   }
        },
        margin:{
          l: 50,
          // t: this.chart_title === null ? 15 : 50,
        },
        // title: {
        //   text: this.chart_title,
        // },
      };
      if(this.result_data.length === 1){
        // if we have just one series, it's the current model run - make sure it's always orange. When we
        // have two or more, base is always blue
        layout['marker'] = {color: this.plot_colors}
      }

      return layout;
    },
    plot_colors: function(){
      let base_case_blue = '#1F77B4'
      let current_run_orange = '#FF7F0E'
      let colors = [base_case_blue, current_run_orange, '#17BECF', '#BCBD22', '#E377C2', '#8C564B',
        '#9467BD', '#D62728', '#2CA02C', '#7F7F7F'
      ]

      if(!this.stacked && this.comparison_items.findIndex(mr => mr.id === this.$store.getters.current_model_area.base_model_run.id) === -1 && this.is_base_case === false){
        // if the base case isn't included in comparisons and we're not in stacked mode, and we're not currently looking
        // at the base case, then remove the color for the base case so it's not used on another model run
        colors = colors.slice(1)
      }else if(!this.stacked && this.is_base_case === true){
        // but when it *is* base, we're already getting it to the correct color as the blue - skip adding the normal "this
        // model run" color to the color set so that people aren't confused
        colors.splice(1, 1) // note that we're not assigning. It operates in place, returning what was removed
      }
      return colors
    },
    plot_data: function() {
      if(this.selected_regions === 0){
        return [];
      }
      let region_info = this.$store.getters.base_case_results.filter(item => item.region === this.model_data.region);

      let region_value = 0;
      let variable = this.map_selected_variable;

      // Sum up the selected variable's value for the specific region
      for (let i = 0; i < region_info.length; i++) {
        region_value += Number(region_info[i][variable]);
      }

      region_info[this.map_selected_variable] = Number(region_value);

      // Prepare arrays to store Plotly data
      let region_names = [];
      let base_values = [];
      let model_values = [];

      // Loop through base_case_results and create arrays for plotting
      this.filtered_base_case.forEach(base_case_item => {
        let model_value = this.model_data.find(item => item.region === base_case_item.region)?.[this.map_selected_variable] || 0;

        region_names.push(this.$store.getters.get_region_name_by_id(base_case_item.region));
        base_values.push(Number(base_case_item[this.map_selected_variable]));
        model_values.push(Number(model_value));
      });

      let sorted_regions = []
      if(this.selected_filters[2].selected_rows.length > 0){ // Selected_filters[2] = Region filters
        this.selected_filters[2].selected_rows.forEach(function(add_region){
          sorted_regions.push(add_region.name)
        })
      }
      // Return the data in Plotly-friendly format
      let chart_data_curr_run = {
        marker: {
          color: "#FF7F0E",
        },
        name: "This model run",
        type: "bar",
        x: region_names,             // X-axis data
        y: model_values        // Labels
      }

      let chart_data_base_case;
      if(sorted_regions.length > 0){ // When the user has regions selected, we change the X axis labels to only include regions selected
        chart_data_base_case = {
          marker:{
            color: "#1f77b4",
          },
          name: "Base case",
          type: "bar",
          x: sorted_regions,
          y: base_values,         // Y-axis data for base values
        }
        chart_data_curr_run.x = sorted_regions
      } else {
        chart_data_base_case = {
          marker:{
            color: "#1f77b4",
          },
          name: "Base case",
          type: "bar",
          x: region_names,
          y: base_values,         // Y-axis data for base values
        }

      }

      return [chart_data_base_case, chart_data_curr_run]
    },
    gradientStyle() {
       switch (this.map_selected_variable){
         case 'xwatersc':
         case 'xwater':
            return `linear-gradient(90deg, ${this.colorScaleWater.join(", ")})`;
         case 'xlandsc':
         case 'xland':
           return `linear-gradient(90deg, ${this.colorScaleLand.join(", ")})`;
         case 'net_revenue':
         case 'gross_revenue':
           return `linear-gradient(90deg, ${this.colorScaleRev.join(", ")})`;
        }
      },
    chart_display(){
        return this.selected_regions > 0 && this.plot_data;
      },

    },

  methods: {
    onMapReady: function(map) {
      // Setting map here to use later for clustering
      this.map_obj = map;
    },

    get_difference_change: function() {
      if(this.model_data.length > 0){
          this.min_value = Infinity
          this.max_value = -Infinity
        } else {
          this.min_value = Infinity
          this.max_value = -Infinity
        }

        let temp = this.model_data.reduce((acc, region) => {
          const regionId = region.region;

          if (!acc[regionId]) {
            acc[regionId] = {
              region: regionId,
              xlandsc: 0,
              xwatersc: 0,
              water_per_acre: 0,
              net_revenue: 0,
              gross_revenue: 0,
            };
          }

          acc[regionId].xlandsc += parseFloat(region.xlandsc);
          acc[regionId].xwatersc += parseFloat(region.xwatersc);
          acc[regionId].water_per_acre += parseFloat(region.water_per_acre);
          acc[regionId].net_revenue += parseFloat(region.net_revenue);
          acc[regionId].gross_revenue += parseFloat(region.gross_revenue);

          return acc;
        }, {});

        let acc_base_data = this.$store.getters.base_case_results.reduce((acc, region) => {
        const regionId = region.region;

        if (!acc[regionId]) {
          acc[regionId] = {
            region: regionId,
            xlandsc: 0,
            xwatersc: 0,
            water_per_acre: 0,
            net_revenue: 0,
            gross_revenue: 0,
          };
        }

        acc[regionId].xlandsc += parseFloat(region.xlandsc);
        acc[regionId].xwatersc += parseFloat(region.xwatersc);
        acc[regionId].water_per_acre += parseFloat(region.water_per_acre);
        acc[regionId].net_revenue += parseFloat(region.net_revenue);
        acc[regionId].gross_revenue += parseFloat(region.gross_revenue);

        return acc;
      }, {});

        let tempArray = Object.values(temp);
        acc_base_data = Object.values(acc_base_data);

        for(let i = 0; i < tempArray.length; i++){
          tempArray[i].xlandsc_difference = parseFloat(((tempArray[i]?.xlandsc - acc_base_data[i]?.xlandsc)))
          tempArray[i].xwatersc_difference = ((tempArray[i]?.xwatersc - acc_base_data[i]?.xwatersc ))
          tempArray[i].gross_revenue_difference = ((tempArray[i]?.gross_revenue - acc_base_data[i]?.gross_revenue))
          tempArray[i].net_revenue_difference = ((tempArray[i]?.net_revenue - acc_base_data[i]?.net_revenue))

            if(this.min_value >  tempArray[i][this.percent_variable_map.get(this.map_selected_variable)]){
            this.min_value =  tempArray[i][this.percent_variable_map.get(this.map_selected_variable)];
          } else if(this.max_value <  tempArray[i][this.percent_variable_map.get(this.map_selected_variable)]){
            this.max_value =  tempArray[i][this.percent_variable_map.get(this.map_selected_variable)];
          }
        }
        this.acc_model_data = [... tempArray];
        this.acc_base_case_data = [... acc_base_data];

        for(let feat = 0; feat < this.map_geojson.features.length; feat++){
          if(this.map_geojson.features[feat]){
            this.map_region_style(this.map_geojson.features[feat]);
          }
        }
        this.get_min_max_values(this.map_geojson.features)
        this.map_geojson = { ...this.map_geojson }; // Copy map again to activate refresh
    },
    get_percent_change: function() {
      if(this.model_data.length > 0){
          this.min_value = Infinity
          this.max_value = -Infinity
        } else {
          this.min_value = Infinity
          this.max_value = -Infinity
        }

        let temp = this.model_data.reduce((acc, region) => {
        const regionId = region.region;

        if (!acc[regionId]) {
          acc[regionId] = {
            region: regionId,
            xlandsc: 0,
            xwatersc: 0,
            water_per_acre: 0,
            net_revenue: 0,
            gross_revenue: 0,
          };
        }

        acc[regionId].xlandsc += parseFloat(region.xlandsc);
        acc[regionId].xwatersc += parseFloat(region.xwatersc);
        acc[regionId].water_per_acre += parseFloat(region.water_per_acre);
        acc[regionId].net_revenue += parseFloat(region.net_revenue);
        acc[regionId].gross_revenue += parseFloat(region.gross_revenue);
        // acc[regionId].xlandsc_norm += parseFloat(region.xlandsc_norm);
        // acc[regionId].xwatersc_norm += parseFloat(region.xwatersc_norm);
        // acc[regionId].gross_revenue_norm += parseFloat(region.gross_revenue_norm);
        // acc[regionId].net_revenue_norm += parseFloat(region.net_revenue_norm);

        return acc;
      }, {});

        let acc_base_data = this.$store.getters.base_case_results.reduce((acc, region) => {
        const regionId = region.region;

        if (!acc[regionId]) {
          acc[regionId] = {
            region: regionId,
            xlandsc: 0,
            xwatersc: 0,
            water_per_acre: 0,
            net_revenue: 0,
            gross_revenue: 0,
          };
        }

        acc[regionId].xlandsc += parseFloat(region.xlandsc);
        acc[regionId].xwatersc += parseFloat(region.xwatersc);
        acc[regionId].water_per_acre += parseFloat(region.water_per_acre);
        acc[regionId].net_revenue += parseFloat(region.net_revenue);
        acc[regionId].gross_revenue += parseFloat(region.gross_revenue);

        return acc;
      }, {});

        let tempArray = Object.values(temp);
        acc_base_data = Object.values(acc_base_data);
        for(let i = 0; i < tempArray.length; i++){
          tempArray[i].xlandsc_percent = parseFloat(((tempArray[i]?.xlandsc - acc_base_data[i]?.xlandsc) / acc_base_data[i]?.xlandsc) * 100)
          tempArray[i].xwatersc_percent = ((tempArray[i]?.xwatersc - acc_base_data[i]?.xwatersc ) / acc_base_data[i]?.xwatersc) * 100
          tempArray[i].gross_revenue_percent = ((tempArray[i]?.gross_revenue - acc_base_data[i]?.gross_revenue) / acc_base_data[i]?.gross_revenue) * 100
          tempArray[i].net_revenue_percent = ((tempArray[i]?.net_revenue - acc_base_data[i]?.net_revenue) / acc_base_data[i]?.net_revenue) * 100

            if(this.min_value >  tempArray[i][this.percent_variable_map.get(this.map_selected_variable)]){
            this.min_value =  tempArray[i][this.percent_variable_map.get(this.map_selected_variable)];
          } else if(this.max_value <  tempArray[i][this.percent_variable_map.get(this.map_selected_variable)]){
            this.max_value =  tempArray[i][this.percent_variable_map.get(this.map_selected_variable)];
          }
        }
        this.acc_model_data = [... tempArray];
        this.acc_base_case_data = [... acc_base_data];

        for(let feat = 0; feat < this.map_geojson.features.length; feat++){
          if(this.map_geojson.features[feat]){
            //
            this.map_region_style(this.map_geojson.features[feat]);
          }
        }
        this.get_min_max_values(this.map_geojson.features)
        this.map_geojson = { ...this.map_geojson }; // Copy map again to activate refresh
    },

    get_map_norm_vals: function(){
      if(this.model_data.length > 0){
          this.min_value = Infinity
          this.max_value = -Infinity
        } else {
          this.min_value = Infinity
          this.max_value = -Infinity
        }

        let temp = this.model_data.reduce((acc, region) => {
        const regionId = region.region;

        if (!acc[regionId]) {
          acc[regionId] = {
            region: regionId,
            xlandsc: 0,
            xwatersc: 0,
            water_per_acre: 0,
            net_revenue: 0,
            gross_revenue: 0,
          };
        }

        acc[regionId].xlandsc += parseFloat(region.xlandsc);
        acc[regionId].xwatersc += parseFloat(region.xwatersc);
        acc[regionId].water_per_acre += parseFloat(region.water_per_acre);
        acc[regionId].net_revenue += parseFloat(region.net_revenue);
        acc[regionId].gross_revenue += parseFloat(region.gross_revenue);
        // acc[regionId].xlandsc_norm += parseFloat(region.xlandsc_norm);
        // acc[regionId].xwatersc_norm += parseFloat(region.xwatersc_norm);
        // acc[regionId].gross_revenue_norm += parseFloat(region.gross_revenue_norm);
        // acc[regionId].net_revenue_norm += parseFloat(region.net_revenue_norm);

        return acc;
      }, {});

        let acc_base_data = this.$store.getters.base_case_results.reduce((acc, region) => {
        const regionId = region.region;

        if (!acc[regionId]) {
          acc[regionId] = {
            region: regionId,
            xlandsc: 0,
            xwatersc: 0,
            water_per_acre: 0,
            net_revenue: 0,
            gross_revenue: 0,
          };
        }

        acc[regionId].xlandsc += parseFloat(region.xlandsc);
        acc[regionId].xwatersc += parseFloat(region.xwatersc);
        acc[regionId].water_per_acre += parseFloat(region.water_per_acre);
        acc[regionId].net_revenue += parseFloat(region.net_revenue);
        acc[regionId].gross_revenue += parseFloat(region.gross_revenue);

        return acc;
      }, {});

        let tempArray = Object.values(temp);
        acc_base_data = Object.values(acc_base_data);
        for(let i = 0; i < tempArray.length; i++){
          tempArray[i].xlandsc_norm = parseFloat(tempArray[i]?.xlandsc / acc_base_data[i]?.xlandsc)
          tempArray[i].xwatersc_norm = tempArray[i]?.xwatersc / acc_base_data[i]?.xwatersc
          tempArray[i].gross_revenue_norm = tempArray[i]?.gross_revenue / acc_base_data[i]?.gross_revenue
          tempArray[i].net_revenue_norm = tempArray[i]?.net_revenue / acc_base_data[i]?.net_revenue

            if(this.min_value >  tempArray[i][this.norm_variable_map.get(this.map_selected_variable)]){
            this.min_value =  tempArray[i][this.norm_variable_map.get(this.map_selected_variable)];
          } else if(this.max_value <  tempArray[i][this.norm_variable_map.get(this.map_selected_variable)]){
            this.max_value =  tempArray[i][this.norm_variable_map.get(this.map_selected_variable)];
          }
        }
        this.acc_model_data = [... tempArray];
        this.acc_base_case_data = [... acc_base_data];

        for(let feat = 0; feat < this.map_geojson.features.length; feat++){
          if(this.map_geojson.features[feat]){
            //
            this.map_region_style(this.map_geojson.features[feat]);
          }
        }
        this.get_min_max_values(this.map_geojson.features)
        this.map_geojson = { ...this.map_geojson }; // Copy map again to activate refresh
    },

    get_basin_level: function(region_id){
      let groups = this.$store.getters.current_model_area.region_group_sets[0].groups
      const result = groups.find(region => region.regions.includes(region_id));
      return result ? result.name : "";
    },

    draw_map: function(){
      this.$nextTick(() => {
        // this.$emit("get_draw_map", this.sendDataToShiny());
      });
    },

    format_no_fractions(value){
        return this.no_fractions_number_formatter.format(value)
    },
    get_legend_display(){
      if(this.map_selected_variable === "xwatersc" || this.map_selected_variable === "xwater"){
        return "Water(ac-ft)"
      } else if(this.map_selected_variable === "xlandsc" || this.map_selected_variable === "xland") {
        return "Land(ac)"
      } else if(this.map_selected_variable === "gross_revenue" || this.map_selected_variable === "net_revenue") {
        return "Revenue $"
      }
    },
    get_min_max_values(features){

      let regionData = [];
      this.min_value = Infinity
      this.max_value = -Infinity

      if(this.map_norm){
        for(let region = 0; region < this.acc_model_data.length; region++){
          if(this.min_value > this.acc_model_data[region]?.[this.norm_variable_map.get(this.map_selected_variable)]){
            this.min_value = this.acc_model_data[region]?.[this.norm_variable_map.get(this.map_selected_variable)]
          } else if(this.max_value < this.acc_model_data[region]?.[this.norm_variable_map.get(this.map_selected_variable)]){
            this.max_value = this.acc_model_data[region]?.[this.norm_variable_map.get(this.map_selected_variable)]
          }
        }
        return;
      }

      for(let feat = 0; feat < features.length; feat++){ // Get info for pop-up message
          if(features[feat]){
            regionData.push(this.map_info_popup(features[feat].properties.id, this.model_data));
          }
        }
        for (let i = 0; i < regionData.length; i++) { // Simple loop to find min and max value
          if(regionData[i][this.map_selected_variable] > this.max_value){
            if(this.map_norm){
              if(regionData[i][this.norm_variable_map.get(this.map_selected_variable)]){
                this.max_value = regionData[i][this.norm_variable_map.get(this.map_selected_variable)]
              }
            } else {
              this.max_value = regionData[i][this.map_selected_variable]
            }
          }  if(regionData[i][this.map_selected_variable] < this.min_value){
            if(this.map_norm){
              if(regionData[i][this.norm_variable_map.get(this.map_selected_variable)]){
                this.min_value = regionData[i][this.norm_variable_map.get(this.map_selected_variable)]
              }
            } else {
              this.min_value = regionData[i][this.map_selected_variable]
            }
          }

        }
    },

    map_hover_and_click(feature, layer) {
      let item_name = feature.properties.name;
      let item_id = feature.properties.id;
      let _this = this;


      layer.on('mouseover', function () {
        let region_info = _this.map_info_popup(item_id, _this.model_data, null)
        _this.reference_data = region_info;
        let selected_run;
        if(_this.selected_comparisons_full){
          selected_run = _this.map_info_popup(item_id, _this.selected_comparisons_full.results[0].result_set, null);
        }
        let land_value = 0;
        let water_value = 0;

        if(region_info !== undefined || region_info){
          if(region_info.hasOwnProperty("xland") && region_info.hasOwnProperty("xwater")){
              land_value += region_info.xland;
              water_value += region_info.xwater;
          }
          if(region_info.hasOwnProperty("xlandsc") && region_info.hasOwnProperty("xwatersc")){
            if(_this.selected_comparisons_full){
              land_value = (region_info.xlandsc - selected_run.xlandsc)
              water_value = (region_info.xwatersc - selected_run.xwatersc)
            } else{
              land_value = region_info.xlandsc;
              water_value = region_info.xwatersc;
            }
          }
        }

        let popupContent =
          `
            <b>Region Name:</b> ${item_name} <br/>
            <b>Land Value:</b> ${ (Math.round(land_value * 100)/100).toLocaleString() } ac<br>
            <b>Water Value:</b> ${(Math.round(water_value * 100)/100).toLocaleString()} (ac-ft)
          `;



        if(region_info || region_info !== undefined){
          if(_this.map_norm || _this.percent_toggle || _this.difference_toggle){
            let region = _this.map_info_popup(item_id, _this.acc_model_data)
            let region_land_val = (region.hasOwnProperty("xlandsc") ? 'xlandsc' : 'xland')

            popupContent = `
              <h3><b>Region Name:</b> ${item_name}<br></h3> `
            if(_this.map_norm ){
              popupContent += `
                 <pre> <b>Normalized Value:</b> ${(((region?.[_this.norm_variable_map.get(_this.map_selected_variable)] - _this.min_value) / (_this.max_value - _this.min_value)).toFixed(4).toLocaleString())} $/ac<br></pre>
              `
            } else if(_this.percent_toggle ){
              popupContent += `
                 <pre> <b>Percent Change:</b> ${ (region?.[_this.percent_variable_map.get(_this.map_selected_variable)]) } %<br></pre>
              `
            } else if(_this.difference_toggle ){
              popupContent += `
              <pre>  <b>Difference of Land Value:</b> ${(Math.round(region?.xlandsc_difference * 100)/100).toLocaleString()} ac<br></pre>
              <pre>  <b>Difference of Water Value:</b> ${ (Math.round(region?.xwatersc_difference * 100)/100).toLocaleString() } (ac-ft)<br></pre>
              <pre>  <b>Difference of Gross Rev:</b> ${ (Math.round(region?.gross_revenue_difference * 100)/100).toLocaleString() } $USD<br></pre>
              `

            }


          }
          else if(_this.$store.getters.net_revenue_enabled){
            if(region_info.hasOwnProperty("gross_revenue") || region_info.hasOwnProperty("net_revenue")){
              if(_this.selected_comparisons_full){
                popupContent = `

              <h3><b>Region Name:</b> ${item_name}<br></h3> <i>In compare mode</i>
              <pre>  <b>Land Value:</b> ${ (Math.round(land_value * 100)/100).toLocaleString() } ac<br></pre>
              <pre>  <b>Water Value:</b> ${(Math.round(water_value * 100)/100).toLocaleString() } (ac-ft)<br></pre>
              <pre>  <b>Gross Rev:</b> ${ (Math.round((region_info.gross_revenue - selected_run.gross_revenue) * 100)/100).toLocaleString() } $USD<br></pre>
              <pre>  <b>Net Rev:</b> ${ (Math.round((region_info.net_revenue - selected_run.net_revenue) * 100)/100).toLocaleString() } $USD</pre>
              `
              } else {
                popupContent = `
              <h3><b>Region Name:</b> ${item_name}<br></h3>
              <pre>  <b>Land Value:</b> ${(Math.round(land_value * 100)/100).toLocaleString()} ac<br></pre>
              <pre>  <b>Water Value:</b> ${ (Math.round(water_value * 100)/100).toLocaleString() } (ac-ft)<br></pre>
              <pre>  <b>Gross Rev:</b> ${ (Math.round(region_info.gross_revenue * 100)/100).toLocaleString() } $USD<br></pre>
              <pre>  <b>Net Rev:</b> ${ (Math.round(region_info.net_revenue * 100)/100).toLocaleString() } $USD</pre>
              `
              }
            }
          }
        }

        let priority_text = (_this.$store.getters.current_model_area.background_code === "cali" ? _this.$store.getters.current_model_area.background_code : null);
        if(priority_text){
          popupContent += `<br><b>Priority: </b>${_this.get_basin_level(item_id)}`
        }

        if(_this.$store.getters.map_popup_enabled){

          layer.bindPopup(popupContent).openPopup();
        }
        _this.region_info = popupContent;
      });

      layer.on('mouseout', function () {
        _this.reference_data = []
        layer.closePopup();
      });
      layer.on('mouseout', function () {
          // Clear the content when the mouse leaves the region
        _this.reference_data = []
        _this.region_info = "";
        layer.closePopup();
      });
      layer.on('click', function () {
        layer.bindPopup(_this.map_info_popup(item_id, _this.acc_model_data))
      })
    },

    map_info_popup(region_id, model_data, crop_id){
      let info = {}
      if(!crop_id){
        info = model_data.filter(item => item.region === region_id)
        if(info && info.length !== 0){

          info = info.reduce((accumulator, item) => {
            if (item) {
              if(item.hasOwnProperty("xwatersc" || item.hasOwnProperty("xlandsc"))){
                return {
                  ...accumulator,
                  xwatersc: (parseFloat(accumulator.xwatersc) || 0) + (parseFloat(item.xwatersc) || 0),
                  xlandsc: (parseFloat(accumulator.xlandsc) || 0) + (parseFloat(item.xlandsc) || 0),
                  gross_revenue: (parseFloat(accumulator.gross_revenue) || 0) + (parseFloat(item.gross_revenue) || 0),
                  net_revenue: (parseFloat(accumulator.net_revenue) || 0) + (parseFloat(item.net_revenue) || 0),
                };
              } else{
                return {
                  ...accumulator,
                  xwater: (parseFloat(accumulator.xwater) || 0) + (parseFloat(item.xwater) || 0),
                  xland: (parseFloat(accumulator.xland) || 0) + (parseFloat(item.xland) || 0),
                };
              }
            }
            return accumulator;
          });
        }
      }
      return info
    },

    getColor(land_value) {
      return d3.scaleQuantile()
            .domain([this.min_value, this.max_value])
            .range(['#e68873', '#d9664f', '#c73d29', '#a81011', '#760314', '#3a0115'])(Math.abs(land_value))
    },
    getColorWater(land_value) {

      if(this.map_norm){
        return d3.scaleQuantile()
            .domain([this.min_value, this.max_value])
            .range(['#A1DAAE','#73C69D','#1C9099','#0A0F51'])(Math.abs(land_value))
      }else {
        return d3.scaleQuantile()
            .domain([this.min_value, this.max_value])
            .range(['#A1DAAE','#73C69D','#1C9099','#0A0F51'])(Math.abs(land_value))
      }
    },
    getColorRev(land_value) {
        return d3.scaleQuantile()
            .domain([this.min_value, this.max_value])
             .range(['#B6D890','#91CB70','#6BBF54','#06992B','#005902'])(Math.abs(land_value))
    },

    map_region_style(feature) {
      let _this = this
      let regionData;
      let land_value = -1; // land value in this case is just whatever map_selected_variable is

    // Default to a marker if no radius is specified
      if(feature){
        if(this.map_norm || this.percent_toggle){
          regionData = _this.map_info_popup(feature.properties.id, _this.acc_model_data);
        } else {
          regionData = _this.map_info_popup(feature.properties.id, _this.model_data);
        }
        if(regionData){
          land_value = parseFloat(regionData.hasOwnProperty(this.map_selected_variable) ? regionData[this.map_selected_variable] : regionData[this.map_selected_variable.substring(0,(this.map_selected_variable.length - 2))])
        }
      }
      if(this.map_norm){
        land_value = (regionData?.[this.norm_variable_map.get(this.map_selected_variable)])
      }
      else if(this.selected_comparisons_full){
        let matched_region = this.accumulated_compare_run[0].find((region) => feature.properties.id === region.region)
        if (matched_region) {
          if(this.selected_comparisons_full){
            let region_info = _this.map_info_popup(feature.properties.id, _this.model_data, null)
            let selected_run = _this.map_info_popup(feature.properties.id, _this.selected_comparisons_full.results[0].result_set, null);
            land_value = (region_info.xlandsc - selected_run.xlandsc)
          } else{

            land_value = regionData.xlandsc - matched_region.xlandsc;
          }
        }
      }

      let region_color;

      if(land_value === -1 || isNaN(land_value)){
        return {
          fillColor: "#666666",
          color: "#666666",
          dashArray: '3',
          fillOpacity: 0.4
        };
      }
      if(this.map_selected_variable === "xwatersc" || this.map_selected_variable === "xwater"){
        region_color = this.getColorWater(land_value);
      } else if(this.map_selected_variable === "xlandsc" || this.map_selected_variable === "xland") {
        region_color = this.getColor(land_value)
      } else if(this.map_selected_variable === "gross_revenue" || this.map_selected_variable === "net_revenue") {
        region_color = this.getColorRev(land_value)
      }
      return {
        fillColor: region_color,
        dashArray: '3',
        fillOpacity: 0.7
      };
    },
  },
})




</script>


<style scoped lang="stylus">
  .gradient-bar
    width: 220px;
    height: 20px;
    margin-left 12%
  .gradient-bar-well{
      width: 220px;
      height: 20px;
      background: #CCC9A1;
      background: linear-gradient(90deg, rgba(204, 201, 161, 1) 0%, rgba(76, 35, 10, 1) 100%);
      transform: rotate(0deg);
      margin-top: 15px
      margin-left 12%
    }
  .map_min
    font-size math
    padding-left 0 !important;
    float left

  .line-marker
    padding-left 0 !important;
    float inline-start
    width: 10px;
    height: 5px;
    margin-bottom 0
    margin-right 0
    color #3388ff

  .line-marker-name
    margin-top 0
    padding-left 20px
  .map_max
    font-size math
    float right
  .well_max
    font-size math
    float left

  #legend_title
    text-align center;

  .display_map_item
    text-align center;
    font-weight bold
    padding-bottom 5px


  .basemap_options_wells
    display inline
    float left

  cluster-icon
    background-color: #648FFF !important;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    line-height: 40px;
    text-align: center;
    color: white;

  .mycluster .cluster-icon,
  .mycluster .cluster-icon,
  .mycluster .cluster-icon {
    background-color: #648FFF !important;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    line-height: 40px;
    text-align: center;
    color: white;
  }

  .well_text
    text-align: center;
    font-weight: bold;
    margin-bottom: -4px;
    margin-top: 5px

</style>