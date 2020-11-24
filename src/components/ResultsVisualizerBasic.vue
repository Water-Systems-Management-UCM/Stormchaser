<template>
<v-layout>
  <v-row v-if="has_results" class="stormchaser_resultsviz">
    <v-row>
      <v-col class="col-xs-12 col-md-9">
        <v-autocomplete
            v-model="visualize_attribute"
            :items="visualize_attribute_options"
            label="Value to Plot"
            return-object
            persistent-hint
            solo
        ></v-autocomplete>
      </v-col>
      <v-col class="col-xs-12 col-md-3">
        <v-switch
            v-model="stacked"
            label="Stack Bars by Crop"
        ></v-switch>
      </v-col>
      <v-col class="col-xs-12">
        <Plotly :data="result_data" :layout="plot_layout"></Plotly>
      </v-col>
    </v-row>
  </v-row>
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
      stacked: false,
      visualize_attribute: "gross_revenue",
      visualize_attribute_options: ["gross_revenue", "net_revenue", "water_per_acre", "xlandsc", "xwatersc"],
    }
  },
  methods: {
    get_crop_name_by_id: function (id) {
      if (id === null){
        return "All Crops";
      }
      return this.$store.getters.current_model_area.crops[id].name
    },
    reduce_by_crop(accumulator, raw_value){
      let crop = this.get_crop_name_by_id(raw_value.crop);
      if (!(crop in accumulator)){
        accumulator[crop] = Number(raw_value[this.visualize_attribute]);
      }else{
        accumulator[crop] = accumulator[crop] + Number(raw_value[this.visualize_attribute]);
      }
      return accumulator;
    },
    get_crop_sums_for_results(results, name){
      let crop_values = {};
      results.reduce(this.reduce_by_crop, crop_values)
      return {
        x: Object.keys(crop_values),
        y: Object.values(crop_values),  //.map(function(value){  // this map rounds each value to the specified number of decimal places
                                              // return Math.round(value)  // round to the nearest whole dollar
                                        //}),
        type: "bar",
        name: name,
      };
    },
    stacked_transform(results){
      // when we want stacked bar charts, we need to go from a series per model to a series per crop
      let find_same_crop_value = function(r, crop_name){
        for(let i=0; i < r.x.length; i++){
          if(r.x[i] === crop_name){
            return r.y[i]
          }
        }
      }

      let output_series = []
      for(let i=0; i<results[0].x.length; i++){
        let crop_data = {
          x: [results[0].name, results[1].name],
          y: [results[0].y[i], find_same_crop_value(results[1], results[0].x[i])],
          type: "bar",
          name: results[0].x[i]
        }
        output_series.push(crop_data)
      }

      return output_series;
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
      let viz_data = [this.get_crop_sums_for_results(this.base_results, "This model run")];
      if(this.model_data.id !== this.$store.getters.current_model_area.base_model_run.id){  // if this *is* the base case, then don't plot anything else
        // Add the Base Case to the items to plot
        // doing a weird lookup here because $store.state.base_model_run doesn't seem to have results, so looking up the model run using that ID instead
        // add it to the beginning of the array so the base case always shows first
        viz_data.unshift(this.get_crop_sums_for_results(this.$store.getters.current_model_area.model_runs[this.$store.getters.current_model_area.base_model_run.id].results.result_set, "Base case"));
      }
      if(this.stacked){
        viz_data = this.stacked_transform(viz_data);
      }

      return viz_data;
    },
    plot_layout: function(){
      let layout = {
        xaxis: {
          hoverformat: ".4s"
        },
        yaxis: {
          hoverformat: ".4s"
        }
      };
      if (this.stacked){
        layout["barmode"] = "stack";
      }
      return layout;
    }
  }
}
</script>

<style>

</style>