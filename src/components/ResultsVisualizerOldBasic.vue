<template>
<v-layout row>

  <v-flex class="stormchaser_resultsviz"
          v-if="has_results">
    <v-autocomplete
        v-model="visualize_attribute"
        :items="visualize_attribute_options"
        label="Value to Plot"
        return-object
        persistent-hint
        solo
    ></v-autocomplete>
    <Plotly :data="result_data"></Plotly>
  </v-flex>
  <v-flex class="stormchaser_resultsviz"
          v-if="!has_results">
    <p>No results available yet.</p>
  </v-flex>

</v-layout>
</template>

<script>
import { defineComponent } from 'vue';
/* METAMORPH_START */























import { Plotly } from '@wellcaffeinated/vue-plotly'

export default defineComponent({
  name: 'ResultsVisualizerBasic',
  components: { Plotly },

  props:{
    model_data: Object,
    regions: Array
  },

  data: function(){
    return {
      visualize_attribute: 'gross_revenue',
      visualize_attribute_options: ['gross_revenue', 'net_revenue', 'water_per_acre', 'xlandsc', 'xwatersc'],
    };
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
    },
    get_yearly_sum_for_results(results, name){
      let yearly_values = {};
      results.reduce(this.reduce_by_year, yearly_values)
      return {
        x: Object.keys(yearly_values),
        y: Object.values(yearly_values),
        type: 'bar',
        name: name,
      };
    }
  },

  computed: {
    has_results: function(){
      return this.model_data.results && this.base_results !== undefined && this.base_results !== null;
    },
    base_results: function(){
      return this.model_data.results.result_set;
    },
    result_data: function(){
      let viz_data = [this.get_yearly_sum_for_results(this.base_results, 'This model run')];
      if(this.model_data.id !== this.$store.getters.current_model_area.base_model_run.id){  // if this *is* the base case, then don't plot anything else
        // Add the Base Case to the items to plot
        // doing a weird lookup here because $store.state.base_model_run doesn't seem to have results, so looking up the model run using that ID instead
        // add it to the beginning of the array so the base case always shows first
        viz_data.unshift(this.get_yearly_sum_for_results(this.$store.getters.current_model_area.model_runs[this.$store.getters.current_model_area.base_model_run.id].results.result_set, 'Base case'));
      }
        return viz_data;
    },
  },
});
</script>

<style>


</style>