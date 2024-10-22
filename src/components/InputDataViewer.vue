<template>
  <v-container>
    <v-row>
      <v-col class="col-12">
        <h2 style="margin-bottom: 0.5em;margin-top:1em;">Model Input Data</h2>
      </v-col>
    </v-row>
    <v-card v-if="this.$store.getters.current_model_area.background_code !== `ca_cv` ">
      <DataViewer
          :model_data="model_data"
          :map_default_variable="map_selected_variable"
          :map_variables="map_variables"
          :default_tab=0
          default_chart_attribute="xland"
          :chart_attribute_options="visualize_attribute_options"
          :download_name="download_name"
          :download_lookups="download_lookups"
          :allow_download_regions="true"
          :preferences="$store.getters.current_model_area.preferences"
      ></DataViewer>
    </v-card>
  </v-container>
</template>

<script>
import { defineComponent } from 'vue';

import DataViewer from './DataViewer.vue';

export default defineComponent({
  name: 'InputDataViewer',
  components: {DataViewer},

  data(){
    return {
      table_headers: [
        {title: "Region", key:"region"},
        {title: "Crop Group", key:"crop"},
        {title: "Year", key:"year"},
        {title: "Effective Price ($/ton)", key:"p"},
        {title: "Yield (ton/ac)", key:"y"},
        {title: "Land Cost ($/ac)", key:"omegaland"},
        {title: "Supply Cost ($/ac)", key:"omegasupply"},
        {title: "Labor Cost ($/ac)", key:"omegalabor"},
        {title: "Total Cost ($/ac)", key:"omegatotal"},
        {title: "Land (ac)", key:"xland"},
        {title: "Water (ac-ft/ac)", key:"xwater"},
      ],
      map_selected_variable: 'xland',
      map_variables: [
        {text: 'Land (ac)', value:'xland', key: 'xland', metric: 'ac land'},
        {text: 'Water (ac-ft/ac) (Only correct for single crop)', value:'xwater', key: 'xwater', metric: 'ac-ft/ac water (only correct for single crop)'},
      ],
      visualize_attribute_options: [
        {title: 'Land (ac)', value:'xland', key: 'xland', metric: 'ac land'},
        {title: 'Water (ac-ft/ac) (Only correct for single crop)', value:'xwater', key: 'xwater', metric: 'ac-ft/ac water (only correct for single crop)'},
        {title: 'Net Revenue', value:'net_revenue', key: 'net_revenue', metric: '$ net'},
        {title: 'Gross Revenue', value:'gross_revenue', key: 'gross_revenue', metric: '$ gross'}
      ],
    };
  },
  computed: {
    model_data: function(){
      return this.$store.getters.current_model_area.input_data[0].input_data_set; //
    },
    download_name: function(){
      return `${this.$store.getters.current_model_area.name}_input_data.csv`
    },
    download_lookups: function(){
      return {
        'region': [{
          func_object: this.$store.getters.get_region_name_by_id,
          suffix: '_name',
        },
          {
            func_object: this.$store.getters.get_region_code_by_id,
            suffix: '_code',
          },
        ],
        'crop': [
          {
            func_object: this.$store.getters.get_crop_name_by_id,
            suffix: '_name'
          }
        ],
      };
    }
  },
});
</script>

<style scoped lang="stylus">
  h2
    margin-bottom: 1em
</style>