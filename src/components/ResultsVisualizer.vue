<template>
  <v-flex row class="results_visualizer">
    <v-autocomplete
        v-model="selected_years"
        :items="years"
        clearable
        deletable-chips
        chips
        small-chips
        label="Years"
        return-object
        persisten-hint
        multiple
        solo
    ></v-autocomplete>
    <Plotly :data="basic_result_scatter_data" :layout="basic_result_scatter_layout"></Plotly>
  </v-flex>
</template>

<script>
import { Plotly } from 'vue-plotly'

export default {
  name: "ResultsVisualizer",
  components: { Plotly },
  props:{
    model_data: Object
  },
  data: function(){
    return {
      years: [],
      selected_years: []
    }
  },
  watch: {
    model_data: {
      immediate: true,
      handler: function() {
        this.set_up_component();
      }
    }
  },
  methods: {
    set_up_component: function () {
      if (this.has_results) { // if we have results
        console.log("Calculating years")
        // get the distinct set of years that the model results cover
        this.years = [...new Set(this.model_data.results.result_set.map(result => result.year))];
        this.selected_years = this.years;
      }else{
        console.log("Skipping Year Calculation")
      }
    }
  },
  computed: {
    has_results: function(){
      return this.model_data.results !== undefined && this.model_data.results !== null;
    },
    basic_result_scatter_data: function(){
      let x = [];
      let y = [];

      this.model_data.results.result_set
          .filter(result => this.selected_years.includes(result.year))  // filter by year first
          .forEach(function(result){
            x.push(result.xlandsc);
            y.push(result.xwatersc);
          });
      return [{
        x: x,
        y: y,
        mode: "markers",
        type: "scatter"
      }]
    },
    basic_result_scatter_layout: function(){
      return {
        xaxis: {
          title:'Land'
        },
        yaxis: {
          title:'Water'
        }
      }
    }
  }
};
</script>

<style lang="stylus">
.plot-container.plotly
  min-height: 500px;
  width: 100%;
</style>