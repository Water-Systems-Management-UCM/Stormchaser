
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
  },
  props:{
    map_default_variable: String,
    map_variables: Array,
    model_data: Array,
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

      console.log("layer", layer)

      layer.on('mouseover', function () {
        let land_value = null;
        let water_value = null

        if(region_info !== undefined || region_info){
          if(region_info.hasOwnProperty("xland") || region_info.hasOwnProperty("xlandsc") || region_info.hasOwnProperty("xwater") || region_info.hasOwnProperty("xlwatersc")){
              land_value = region_info.xland;
              water_value = region_info.xwater;
          }
        }
        let popupContent = `
        <b>Region Name:</b> ${item_name}<br>
        <b>Land Value:</b> ${Math.round(land_value * 100)/100} ac<br>
        <b>Water Value:</b> ${Math.round(water_value * 100)/100} (ac-ft)/ac
      `;
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

    map_region_style: function (feature) {
      let get_color = function (value, min, max) {
        let color_value = Math.round(((value - min) / (max - min)) * 200) // multiply times 200 instead of 255 for black to green to top out on a darker color
        // return {color: `rgb(${255-color_value}, 255, ${255-color_value})`}  // white to green color ramp
        return {color: `rgb(0, ${color_value}, 0)`}; // black to green color ramp
      }
    },
  },
})




</script>


<style scoped lang="stylus">

</style>