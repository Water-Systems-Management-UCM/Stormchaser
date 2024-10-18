
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
        <l-control position="topright">
          <v-card>
            <h2>{{this.map_selected_variable}}</h2>
             <v-select
                v-model="map_selected_variable"
                :items="visualize_attribute_options"
                item-title="text"
                label="Basemap"
                :click="map_selected_variable"
             ></v-select>
          </v-card>
        </l-control>
      </l-map>
    </v-col>
  </v-row>
</template>

<script>
import { LMap, LTileLayer, LGeoJson, LControl, LTooltip } from "@vue-leaflet/vue-leaflet";
import {ChoroplethLayer, InfoControl, ReferenceChart} from 'vue-choropleth'
import {defineComponent, toRaw} from "vue";

export default  defineComponent({
  name: "MapViewer",

  components: {
    LMap,
    LControl,
    'l-info-control': InfoControl,
    'l-reference-chart': ReferenceChart,
    'l-choropleth-layer': ChoroplethLayer,
    LTileLayer,
    LGeoJson,
    LTooltip,
    ReferenceChart
  },
  props:{
    map_default_variable: String,
    map_variables: Array,
    model_data: Array,
    visualize_attribute_options: Array,
  },
  data(){
    return{
      map_geojson: {type: 'FeatureCollection', features: []},
      map_selected_variable: null,
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
    }
  },

  mounted() {
    this.map_geojson = this.region_geojson;  // do this at mount so we can mess with the geojson later
    this.selected_tab = this.default_tab
    this.map_selected_variable = this.map_default_variable
  },

  refresh_map(){
      this.map_geojson.features.push({})
      this.map_geojson.features.pop();
  },

  watch:{
    map_selected_variable: function (){
      // this.map_region_style(this.map_geojson.features);
      console.log("clicked")
      for(let feat = 0; feat < this.map_geojson.features.length; feat++){
        console.log("feat in test", feat)
        if(this.map_geojson.features[feat]){
          this.map_region_style(this.map_geojson.features[feat]);
        }
      }
      this.map_geojson = { ...this.map_geojson }; // Copy map again to activate refresh

    }
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

  },

  methods: {
    map_hover_and_click(feature, layer) {
      let item_name = feature.properties.name;
      let item_id = feature.properties.id;
      let _this = this;
      let region_info = _this.map_info_popup(item_id)

      layer.on('mouseover', function () {
        let land_value = null;
        let water_value = null

        if(region_info !== undefined || region_info){
          if(region_info.hasOwnProperty("xland") && region_info.hasOwnProperty("xwater")){
              land_value = region_info.xland;
              water_value = region_info.xwater;
          }
          if(region_info.hasOwnProperty("xlandsc") && region_info.hasOwnProperty("xwatersc")){
            land_value = region_info.xlandsc;
            water_value = region_info.xwatersc;
          }
        }
        let popupContent = `
        <b>Region Name:</b> ${item_name}<br>
        <b>Land Value:</b> ${Math.round(land_value * 100)/100} ac<br>
        <b>Water Value:</b> ${Math.round(water_value * 100)/100} (ac-ft)/ac
      `;
        if(region_info || region_info !== undefined){

          if(_this.$store.getters.net_revenue_enabled){
            if(region_info.hasOwnProperty("gross_revenue") && region_info.hasOwnProperty("net_revenue")){
              popupContent = `
              <h3><b>Region Name:</b> ${item_name}<br></h3>
              <pre>  <b>Land Value:</b> ${Math.round(land_value * 100)/100} ac<br></pre>
              <pre>  <b>Water Value:</b> ${Math.round(water_value * 100)/100} (ac-ft)/ac<br></pre>
              <pre>  <b>Gross Rev:</b> ${Math.round(region_info.gross_revenue * 100)/100} $USD<br></pre>
              <pre>  <b>Net Rev:</b> ${Math.round(region_info.net_revenue * 100)/100} $USD</pre>
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

    map_info_popup(region_id){
      let info = {}

      info = this.model_data.find(item => item.region === region_id);
      return info
    },

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

    getColor(land_value) {
      return land_value > 100 ? '#800026' :
             land_value > 50  ? '#BD0026' :
             land_value > 20  ? '#E31A1C' :
             land_value > 10  ? '#FC4E2A' :
             land_value > 5   ? '#FD8D3C' :
             land_value > 0   ? '#FEB24C' :
                                '#FFEDA0';
    },

    map_region_style(feature) {
      console.log("in map styling", feature)
      let _this = this
      let regionData;
      let land_value = 0;

      if(feature){
        regionData = _this.map_info_popup(feature.properties.id);
        console.log("reg data", regionData, this.map_selected_variable)
        if(regionData){
          land_value = regionData.hasOwnProperty(this.map_selected_variable) ? regionData[this.map_selected_variable] : regionData[this.map_selected_variable.substr(0,(this.map_selected_variable.length - 2))]
        }
      }
      console.log("color", this.getColor(land_value), land_value)
      return {
        fillColor: this.getColor(land_value),
        weight: 2,
        opacity: 1,
        dashArray: '3',
        fillOpacity: 0.7
      };
    },
  },
})




</script>


<style scoped lang="stylus">

</style>