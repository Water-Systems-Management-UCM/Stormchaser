<template>
<v-layout row>
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

    }
  },
  methods: {
    reduce_by_year(accumulator, raw_value){
      if (!(raw_value.year in accumulator)){
        accumulator.year = raw_value.gross_revenue;
      }else{
        accumulator.year = accumulator.year + raw_value.gross_revenue;
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
      return {
        x: Object.keys(yearly_values),
        y: Object.values(yearly_values),
        type: "bar"
      }
    },
  }
}
</script>

<style scoped>

</style>