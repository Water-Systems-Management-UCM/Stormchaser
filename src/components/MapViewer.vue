<template>
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
        <l-geo-json :geojson="map_geojson" :optionsStyle="map_region_style"
        :options="{onEachFeature: map_hover_and_click}"
        >
        </l-geo-json>
        <l-control class="basemap_options" position="bottomright">
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
          <div class="value_content">
            <span id="min_value" class="map_min">{{format_no_fractions(min_value)}}</span>
            <span id="max_value" class="map_max">{{format_no_fractions(max_value)}}</span>
          </div><br>
          <div class="gradient-bar" :style="{ background: gradientStyle }" ></div>
        </l-control>
      </l-map>
    </v-col>
  </v-row>
</template>

<script>
import {LControl, LGeoJson, LMap, LTileLayer, LTooltip} from "@vue-leaflet/vue-leaflet";
import {ChoroplethLayer, InfoControl} from 'vue-choropleth'
import {defineComponent, toRaw} from "vue";
import scaleCluster from 'd3-scale-cluster'; // https://github.com/schnerd/d3-scale-cluster
import * as d3 from 'd3'; // https://observablehq.com/@d3/quantile-quantize-and-threshold-scales?collection=@d3/d3-scale


export default  defineComponent({
  name: "MapViewer",

  components: {
    LMap,
    LControl,
    'l-info-control': InfoControl,
    'l-choropleth-layer': ChoroplethLayer,
    LTileLayer,
    LGeoJson,
    LTooltip,
  },
  props:{
    map_default_variable: String,
    map_variables: Array,
    map_selected_variable: String,
    model_data: Array,
    visualize_attribute_options: Array,
    filter_crop_year: Array,
    map_norm: Boolean,
    selected_comparisons_full: Object,
  },
  data(){
    return{
      map_geojson: {type: 'FeatureCollection', features: []},
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
      map_data_set_copy: [],
      accumulated_compare_run: [],
    }
  },


  mounted() {
    this.map_geojson = this.region_geojson;  // do this at mount so we can mess with the geojson later
    this.selected_tab = this.default_tab;
    this.map_data_set_copy = this.proxy_to_raw(this.model_data);

    this.get_min_max_values(this.map_geojson.features) // We need min and max on load to handle color scale
  },

  refresh_map(){
      this.map_geojson.features.push({})
      this.map_geojson.features.pop();
  },

  emits: ['map_max_value','map_min_value'],

  watch:{
    map_selected_variable: function (){
      if(this.model_data.length > 0){
        this.min_value = Infinity
        this.max_value = -Infinity
      } else {
        this.min_value = Infinity
        this.max_value = -Infinity
      }
      this.get_min_max_values(this.map_geojson.features)
      for(let feat = 0; feat < this.map_geojson.features.length; feat++){
        if(this.map_geojson.features[feat]){
          this.map_region_style(this.map_geojson.features[feat]);
        }
      }
      this.map_geojson = { ...this.map_geojson }; // Copy map again to activate refresh
    },


    filter_crop_year: function (){
      if(this.model_data.length > 0){
        this.min_value = Number.MAX_SAFE_INTEGER
        this.max_value = 0
      } else {
        this.min_value = 0
        this.max_value = 0
      }
      for(let feat = 0; feat < this.map_geojson.features.length; feat++){
        if(this.map_geojson.features[feat]){
          this.map_region_style(this.map_geojson.features[feat]);
        }
      }

      this.map_geojson = { ...this.map_geojson }; // Copy map again to activate refresh
    },
    max_value: function(){
      this.$emit('map_max_value', this.max_value);
    },
    min_value: function(){
      this.$emit('map_min_value', this.min_value);
    },
    map_norm: function(){
        if(this.model_data.length > 0){
          this.min_value = Number.MAX_SAFE_INTEGER
          this.max_value = 0
        } else {
          this.min_value = Number.MAX_SAFE_INTEGER
          this.max_value = 0
        }
        for(let feat = 0; feat < this.map_geojson.features.length; feat++){
          if(this.map_geojson.features[feat]){
            this.map_region_style(this.map_geojson.features[feat]);
          }
        }
        this.map_geojson = { ...this.map_geojson }; // Copy map again to activate refresh
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
      console.log("in acc")
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

        for(let feat = 0; feat < this.map_geojson.features.length; feat++){
          if(this.map_geojson.features[feat]){
            this.map_region_style(this.map_geojson.features[feat]);
          }
        }
        this.map_geojson = { ...this.map_geojson }; // Copy map again to activate refresh

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
  },

  methods: {
    proxy_to_raw(data) {
              // Check if the data is an object or array
              if (Array.isArray(data)) {
                // If it's an array, map over it and recursively apply proxy_to_raw
                return data.map(item => this.proxy_to_raw(toRaw(item)));
              } else if (data !== null && typeof data === 'object') {
                // If it's an object, iterate over its keys and recursively apply proxy_to_raw
                const rawObject = {};
                Object.keys(data).forEach(key => {
                  rawObject[key] = this.proxy_to_raw(toRaw(data[key]));
                });
                return rawObject;
              }
              // If it's neither an array nor an object, just return the raw data
              return data;
    },
    format_no_fractions(value){
        return this.no_fractions_number_formatter.format(value)
    },
    get_legend_display(){
      if(this.map_selected_variable === "xwatersc" || this.map_selected_variable === "xwater"){
        return "Water(ac-ft/ac)"
      } else if(this.map_selected_variable === "xlandsc" || this.map_selected_variable === "xland") {
        return "Land(ac)"
      } else if(this.map_selected_variable === "gross_revenue" || this.map_selected_variable === "net_revenue") {
        return "Revenue $"
      }
    },
    get_min_max_values(features){
      let regionData = [];
      if(this.accumulated_compare_run){
        for(let feat = 0; feat < features.length; feat++){ // Get info for pop-up message
          if(features[feat]){
            regionData.push(this.map_info_popup(features[feat].properties.id, this.model_data));
          }
        }
        for (let i = 0; i < regionData.length; i++) { // Simple loop to find min and max value
          if(regionData[i][this.map_selected_variable] > this.max_value){
            this.max_value = regionData[i][this.map_selected_variable]
          } else if(regionData[i][this.map_selected_variable] < this.min_value){
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
        <b>Region Name:</b> ${item_name}<br>
        <b>Land Value:</b> ${Math.round(land_value * 100)/100} ac<br>
        <b>Water Value:</b> ${Math.round(water_value * 100)/100} (ac-ft)/ac
      `;

        if(region_info || region_info !== undefined){
          if(_this.$store.getters.net_revenue_enabled && _this.map_norm === false){
            if(region_info.hasOwnProperty("gross_revenue") || region_info.hasOwnProperty("net_revenue")){
              if(_this.selected_comparisons_full){
                popupContent = `

              <h3><b>Region Name:</b> ${item_name}<br></h3> <i>In compare mode</i>
              <pre>  <b>Land Value:</b> ${Math.round(land_value * 100)/100} ac<br></pre>
              <pre>  <b>Water Value:</b> ${Math.round(water_value * 100)/100} (ac-ft)/ac<br></pre>
              <pre>  <b>Gross Rev:</b> ${Math.round((region_info.gross_revenue - selected_run.gross_revenue) * 100)/100} $USD<br></pre>
              <pre>  <b>Net Rev:</b> ${Math.round((region_info.net_revenue - selected_run.net_revenue) * 100)/100} $USD</pre>
              `
              } else {
                popupContent = `
              <h3><b>Region Name:</b> ${item_name}<br></h3>
              <pre>  <b>Land Value:</b> ${Math.round(land_value * 100)/100} ac<br></pre>
              <pre>  <b>Water Value:</b> ${Math.round(water_value * 100)/100} (ac-ft)/ac<br></pre>
              <pre>  <b>Gross Rev:</b> ${Math.round(region_info.gross_revenue * 100)/100} $USD<br></pre>
              <pre>  <b>Net Rev:</b> ${Math.round(region_info.net_revenue * 100)/100} $USD</pre>
              `
              }
            }
          } else if(_this.map_norm){
            let region = _this.map_info_popup(item_id, _this.model_data)
            let region_land_val = (region.hasOwnProperty("xlandsc") ? 'xlandsc' : 'xland')

            popupContent = `
              <h3><b>Region Name:</b> ${item_name}<br></h3> `
            if(_this.map_selected_variable === 'gross_revenue' || _this.map_selected_variable === 'net_revenue'){
              popupContent += `
                <pre>  <b>Revenue Normalized Value:</b> ${Math.round((region[_this.map_selected_variable] / region[region_land_val])* 100)/100} $/ac<br></pre>
                `
            } else {
              popupContent += `
                <pre>  <b>Land Normalized Value:</b> ${Math.round((region[_this.map_selected_variable] / region[region_land_val])* 100)/100} ac-ft/ac<br></pre>

                `
            }
          }
        }
        layer.bindPopup(popupContent).openPopup();
      });

      layer.on('mouseout', function () {
        layer.closePopup();
      });
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
            .range(['#e68873', '#d9664f', '#c73d29', '#a81011', '#760314', '#3a0115'])(land_value)
    },
    getColorWater(land_value) {
      if(this.map_norm){
        return d3.scaleQuantile()
            .domain([this.min_value, this.max_value])
            .range(['#A1DAAE','#73C69D','#1C9099','#0A0F51'])(land_value)
      }else {
        return d3.scaleQuantile()
            .domain([this.min_value, this.max_value])
            .range(['#A1DAAE','#73C69D','#1C9099','#0A0F51'])(land_value)
      }
    },
    getColorRev(land_value) {
      if(this.map_norm){
        return d3.scaleQuantile()
            .domain([this.min_value, this.max_value])
            .range(['#B6D890','#91CB70','#6BBF54','#06992B','#005902'])(land_value)
      }else {
        return d3.scaleQuantile()
            .domain([this.min_value, this.max_value])
             .range(['#B6D890','#91CB70','#6BBF54','#06992B','#005902'])(land_value)
      }

    },

    normalize_results(value) {
      return ( (  (value-this.min_value)  ) / (this.max_value-this.min_value) )
    },

    map_region_style(feature) {
      let _this = this
      let regionData;
      let land_value = 0; // land value in this case is just whatever map_selected_variable is

      if(feature){
        regionData = _this.map_info_popup(feature.properties.id, _this.model_data);
        if(regionData){
          land_value = parseFloat(regionData.hasOwnProperty(this.map_selected_variable) ? regionData[this.map_selected_variable] : regionData[this.map_selected_variable.substring(0,(this.map_selected_variable.length - 2))])
        }
      }
      if(this.map_norm){
        land_value /= (regionData.hasOwnProperty("xlandsc") ? regionData.xlandsc : regionData.xland)
      }
      else if(this.selected_comparisons_full){
        let matched_region = this.accumulated_compare_run[0].find((region) => feature.properties.id === region.region)
        if (matched_region) {
          if(this.selected_comparisons_full){
            let region_info = _this.map_info_popup(feature.properties.id, _this.model_data, null)
            let selected_run = _this.map_info_popup(feature.properties.id, _this.selected_comparisons_full.results[0].result_set, null);
            land_value = (region_info.xlandsc - selected_run.xlandsc)
              // water_value = (region_info.xwatersc - selected_run.xwatersc)
          } else{

            land_value = regionData.xlandsc - matched_region.xlandsc;
          }
        }
      }

      this.get_min_max_values(this.map_geojson.features)

      let region_color;
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

  .map_min
    font-size math
    padding-left 0 !important;
    float left

  .map_max
    font-size math
    float right

  #legend_title
    text-align center;

  .display_map_item
    text-align center;
    font-weight bold
</style>