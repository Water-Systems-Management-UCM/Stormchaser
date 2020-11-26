<template>
  <v-container>
    <v-row>
      <h2>Model Input Data</h2>
    </v-row>
    <DataViewer
        :model_data="model_data"
        :table_headers="table_headers"
        :map_default_variable="map_selected_variable"
        :map_variables="map_variables"
        map_metric="ac"
        :default_tab=0
        default_chart_attribute="xland"
        :chart_attribute_options="visualize_attribute_options"
    ></DataViewer>
  </v-container>
</template>

<script>
import DataViewer from "@/components/DataViewer";

export default {
  name: "InputDataViewer",
  components: {DataViewer},
  data: function(){
    return {
      table_headers: [
        {text: "Region", value:"region" //, filter: function(value){
          //if (value === null){
          //  return true
          //}
          //return value.toLowerCase() === window.stormchaser.$store.getters.current_model_area.regions[this.region].name.toLowerCase()
          //}
        }, //, filter: function(value){
        //return value === window.stormchaser.$store.getters.get_region_name_by_id(this.region).toLowerCase();
        //}},
        {text: "Crop Group", value:"crop"},
        {text: "Year", value:"year"},
        {text: "Price ($/ton)", value:"p", filterable: false},
        {text: "Yield (ton/ac)", value:"y", filterable: false},
        {text: "Land Cost ($/ac)", value:"omegaland", filterable: false},
        {text: "Supply Cost ($/ac)", value:"omegasupply", filterable: false},
        {text: "Labor Cost ($/ac)", value:"omegalabor", filterable: false},
        {text: "Total Cost ($/ac)", value:"omegatotal", filterable: false},
        {text: "Land (ac)", value:"xland", filterable: false},
        {text: "Water (ac-ft/ac)", value:"xwater", filterable: false},
      ],
      map_selected_variable: "xland",
      map_variables: [
        {text: "Land (ac)", value:"xland"},
        {text: "Water (ac-ft/ac)", value:"xwater"},
      ],
      visualize_attribute_options: [
        {text:"Land", value: "xland"},
        {text:"Water", value: "xwater"},
      ],
    }
  },
  computed: {
    model_data: function(){
      return this.$store.getters.current_model_area.input_data[0].input_data_set
    },
  }
}
</script>

<style scoped>

</style>