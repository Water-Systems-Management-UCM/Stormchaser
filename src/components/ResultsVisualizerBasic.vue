<template>
<v-layout row>
  <v-autocomplete
      v-model="visualize_attribute"
      :items="visualize_attribute_options"
      label="Color by Attribute"
      clearable
      return-object
      persistent-hint
      solo
  ></v-autocomplete>
  <v-flex class="stormchaser_resultsviz"
          v-if="has_results">
    <Plotly :data="result_data"></Plotly>
  </v-flex>
  <v-flex class="stormchaser_resultsviz"
          v-if="!has_results">
    <p>No results available yet.</p>
  </v-flex>

</v-layout>
</template>

<script>
import { Plotly } from 'vue-plotly'

export default {
  name: "ResultsVisualizerBasic",
  components: { Plotly },
  props:{
    model_data: Object,
    regions: Array
  },
  data: function(){
    return {
      visualize_attribute: "gross_revenue",
      visualize_attribute_options: ["gross_revenue", "net_revenue", "water_per_acre"],
    }
  },
  methods: {
    reduce_by_year(accumulator, raw_value){
      let year = raw_value.year;
      if (!(year in accumulator)){
        accumulator[year] = Number(raw_value[this.visualize_attribute]);
      }else{
        accumulator[year] = accumulator[year] + Number(raw_value[this.visualize_attribute]);
      }
      return accumulator;
    }
  },
  computed: {
    has_results: function(){
      return this.model_data.results !== undefined && this.model_data.results !== null;
    },
    result_data: function(){
      let yearly_values = {};
      this.model_data.results.result_set.reduce(this.reduce_by_year, yearly_values)
      return [{
        x: Object.keys(yearly_values),
        y: Object.values(yearly_values),
        type: "bar"
      }];
    },
  }
}
</script>

<style scoped>

</style>